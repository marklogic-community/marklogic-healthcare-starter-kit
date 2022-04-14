package com.marklogic.hsk;

import static org.eclipse.rdf4j.model.util.Values.literal;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.rdf4j.model.Model;
import org.eclipse.rdf4j.model.Statement;
import org.eclipse.rdf4j.model.util.ModelBuilder;
import org.eclipse.rdf4j.model.vocabulary.FN;
import org.eclipse.rdf4j.model.vocabulary.LIST;
import org.eclipse.rdf4j.model.vocabulary.OWL;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.model.vocabulary.RDFS;
import org.eclipse.rdf4j.model.vocabulary.SKOS;
import org.eclipse.rdf4j.model.vocabulary.SKOSXL;
import org.eclipse.rdf4j.model.vocabulary.XSD;
import org.eclipse.rdf4j.rio.RDFFormat;
import org.eclipse.rdf4j.rio.RDFHandlerException;
import org.eclipse.rdf4j.rio.RDFWriter;
import org.eclipse.rdf4j.rio.Rio;

import net.sourceforge.argparse4j.ArgumentParsers;
import net.sourceforge.argparse4j.inf.ArgumentParser;
import net.sourceforge.argparse4j.inf.ArgumentParserException;
import net.sourceforge.argparse4j.inf.Namespace;

public class EntityToTTLConverter {
  public static void main(String[] argv) throws IOException {
    Namespace ns = EntityToTTLConverter.parseArguments(argv);

    new EntityToTTLConverter(ns).convertEntityToTTL();
  }

  /**
   * Parse command line arguments
   *
   * @param  argv  Command line arguments
   *
   * @return Argument Parser Namespace containing parsed values
   */
  private static Namespace parseArguments(String[] argv) {
    ArgumentParser parser = ArgumentParsers
      .newFor("EntityToTTLConverter")
      .build()
      .defaultHelp(true)
      .description("Convert CSV file(s) along given path to TTL files for SmartLogic ingest")
      ;

    parser
      .addArgument("--path")
      .setDefault("./entities")
      .help("Specify the path to scan for Entity JSON files")
      ;

    parser
      .addArgument("--prefix")
      .setDefault("http://hsk.marklogic.com/entity-import#")
      .help("Specify a custom prefix for inserted triple subject IRIs")
      ;

    try {
      return parser.parseArgs(argv);
    } catch (ArgumentParserException ape) {
      parser.handleError(ape);
      System.exit(1);
    }

    return null;
  }

  /**
   * Argument Parser Namespace containing arguments given over the command line
   */
  private Namespace args;

  /**
   * Constructs a new instance.
   *
   * @param  args  The Argument Parser Namespace containing arguments given over the command line
   */
  public EntityToTTLConverter(Namespace args) {
    this.args = args;
  }

  /**
   * Convert all CSV files found along a given path to TTL files
   *
   * @throws IOException  Failed to read/write a file
   */
  public void convertEntityToTTL() throws IOException {
    String path = this.args.getString("path");
    List<File> jsonFiles = this.findAllJsonFilesAlongPath(path);

    if (jsonFiles.size() == 0) {
      throw new RuntimeException("No JSON files found along path " + path);
    }

    HashSet<String> visitedTypes = new HashSet<String>();

    for (File file : jsonFiles) {
      String fileName = file.getName();
      String typeName = getTypeNameFromFileName(fileName);

      if (visitedTypes.contains(typeName)) {
        System.out.println("Skipping file \"" + fileName + "\" because its inferred type (\"" + typeName + "\") has already been processed");
        continue;
      }

      visitedTypes.add(typeName);

      ObjectMapper om = new ObjectMapper();
      JsonNode entity = om.readTree(file);

      this.createTTLForFile(typeName, entity.get("definitions"));
    }
  }

  /**
   * Finds all JSON files along path.
   *
   * @param  path  The path
   *
   * @return The list of JSON files found
   */
  private List<File> findAllJsonFilesAlongPath(String path) {
    return this.findAllJsonFilesAlongPath(new File(path));
  }

  /**
   * Finds all JSON files along path.
   *
   * @param  dirent  The dirent
   *
   * @return The list of JSON files found
   */
  private List<File> findAllJsonFilesAlongPath(File dirent) {
    List<File> result = new ArrayList<File>();

    if (dirent.isFile()) {
      result.add(dirent);
    } else {
      File[] entries = dirent.listFiles();

      if (entries != null) {
        for (File entry : entries) {
          if (entry.isDirectory()) {
            result.addAll(this.findAllJsonFilesAlongPath(entry));
          } else if (entry.getName().endsWith(".json")) {
            result.add(entry);
          }
        }
      }
    }

    return result;
  }

  /**
   * Gets the type name for the output RDF Concept Structure from file name.
   *
   * @param  fileName  The file name
   *
   * @return The type name inferred from the file name.
   */
  private String getTypeNameFromFileName(String fileName) {
    String typeName = fileName.substring(0, fileName.indexOf('.'));

    return typeName;
  }

  /**
   * Creates TTL for file.
   *
   * @param  typeName     The type name
   * @param  headers      The headers
   *
   * @throws IOException  Unable to write output file
   */
  private void createTTLForFile(String typeName, JsonNode definitions) throws IOException {
    ModelBuilder mb = this.getDefaultModelBuilder();

    this.addConceptStructure(mb, typeName, definitions.get(typeName).get("properties").fields(), definitions);

    Model m = mb.build();

    new File("./entity-to-rdf").mkdir();
    File outputFile = new File("./entity-to-rdf/" + typeName + ".ttl");
    outputFile.createNewFile();
    FileOutputStream out = new FileOutputStream(outputFile, false);
    RDFWriter writer = Rio.createWriter(RDFFormat.TURTLE, out);

    try {
      writer.startRDF();
      for (Statement st : m) {
        writer.handleStatement(st);
      }
      writer.endRDF();
    } catch (RDFHandlerException rdfe) {
      throw new RuntimeException("An RDFHandlerException occurred and I have no clue how to deal with that");
    } finally {
      out.close();
    }
  }

  /**
   * Creates an RDF Model Builder with default prefixes
   *
   * @return An RDF Model Builder.
   */
  private ModelBuilder getDefaultModelBuilder() {
    return new ModelBuilder()
    // Add all the namespaces we're using in our TTL files
    // Our namespace
      .setNamespace("hsk", this.args.getString("prefix"))
    // Default namespaces used in SmartLogic
      .setNamespace("facts", "http://www.smartlogic.com/2018/01/semaphore-fact-extraction#")
      .setNamespace(FN.NS)
      .setNamespace("lang", "http://id.loc.gov/vocabulary/iso639-1/")
      .setNamespace("list", LIST.NAMESPACE)
      .setNamespace("model", "urn:x-evn-master:")
      .setNamespace(OWL.NS)
      .setNamespace(RDF.NS)
      .setNamespace(RDFS.NS)
      .setNamespace("sdc", "http://vocabulary.marklogic.com/SDC#")
      .setNamespace("sem", "http://www.smartlogic.com/2014/08/semaphore-core#")
      .setNamespace("semgroups", "http://www.smartlogic.com/2018/04/semaphore-groups#")
      .setNamespace("semlang", "http://www.smartlogic.com/2015/03/semaphore-languages#")
      .setNamespace("semord", "http://www.smartlogic.com/2018/03/semaphore-ordering#")
      .setNamespace("sempub", "http://www.smartlogic.com/2017/06/semaphore-publisher#")
      .setNamespace("semspin", "http://www.smartlogic.com/2017/06/semaphore-spin-functions#")
      .setNamespace("sh", "http://www.w3.org/ns/shacl#")
      .setNamespace(SKOS.NS)
      .setNamespace(SKOSXL.NS)
      .setNamespace("sp", "http://spinrdf.org/sp#")
      .setNamespace("spinmap", "http://spinrdf.org/spinmap#")
      .setNamespace("sys", "http://www.smartlogic.com/2015/10/semaphore-sys#")
      .setNamespace("systask", "urn:x-sys-task")
      .setNamespace("tag", "urn:x-tags:")
      .setNamespace("task", "urn:x-ort-tag")
      .setNamespace("teamwork", "http://topbraid.org/teamwork#")
      .setNamespace("ui", "http://uispin.org/ui#")
      .setNamespace(XSD.NS)
      .setNamespace("a", "rdf:type")
      ;
  }

  /**
   * Add a conceputal structure to the given Model Builder
   *
   * @param  mb            The Model Builder
   * @param  typeName      The type name
   * @param  fieldIterator The properties of this type
   * @param  definitions   The base object from the entity containing all definitions (used to get and expand references)
   */
  private void addConceptStructure(ModelBuilder mb, String typeName, Iterator<Map.Entry<String, JsonNode>> fieldIterator, JsonNode definitions) {
    String subject = "hsk:" + typeName;
    String labelSubject = subject + "/" + typeName + "_l-n";
    String altLabelSubject = subject + "/" + "MLEntity." + typeName + "_l-n";

    mb.defaultGraph()
      .add(subject, "rdf:type", "sdc:Structure")
      .add(subject, "sem:guid", java.util.UUID.randomUUID())
      .add(subject, "skos:broader", "sdc:MLEntity")
      .add(subject, "skosxl:prefLabel", labelSubject)
      .add(subject, "skosxl:altLabel", altLabelSubject)
      ;

    mb.defaultGraph()
      .add(labelSubject, "rdf:type", "skosxl:Label")
      .add(labelSubject, "skosxl:literalForm", literal(typeName))
      ;

    mb.defaultGraph()
      .add(altLabelSubject, "rdf:type", "skosxl:Label")
      .add(altLabelSubject, "skosxl:literalForm", literal("MLEntity." + typeName))
      ;

    while (fieldIterator.hasNext()) {
      Map.Entry<String, JsonNode> fieldEntry = fieldIterator.next();

      this.addConceptField(mb, subject, typeName, fieldEntry.getKey(), fieldEntry.getValue(), definitions);
    }
  }

  /**
   * Add a conceptual field to the given Model Builder
   *
   * @param  mb          The Model Builder
   * @param  baseSubject The parent subject's name (used for isFieldIn)
   * @param  fieldName   The field name
   * @param  fieldValue  The JSON Object representing this field in the entity file
   * @param  definitions The base object from the entity containing all definitions (used to get and expand references)
   */
  private void addConceptField(ModelBuilder mb, String baseSubject, String baseLabelPath, String fieldName, JsonNode fieldValue, JsonNode definitions) {
    String subject = baseSubject + "/" + fieldName;
    String labelSubject = subject + "/" + fieldName + "_l-n";
    String labelPath = baseLabelPath + "." + fieldName;
    String altLabelSubject = subject + "/" + labelPath + "_l-n";
    String fullAltLabelSubject = subject + "/MLEntity." + labelPath + "_l-n";

    boolean isArray = fieldValue.has("datatype") && "array".equals(fieldValue.get("datatype").asText());
    String refType = isArray
      ? fieldValue.get("items").has("$ref")
        ? fieldValue.get("items").get("$ref").asText()
        : null
      : fieldValue.has("$ref")
        ? fieldValue.get("$ref").asText()
        : null
      ;

    mb.defaultGraph()
      .add(subject, "rdf:type", "sdc:Field")
      .add(subject, "sdc:isFieldIn", baseSubject)
      .add(subject, "sdc:isKey", fieldName.toLowerCase().equals("id"))
      .add(subject, "sdc:isList", isArray)
      .add(subject, "sem:guid", java.util.UUID.randomUUID())
      .add(subject, "skosxl:prefLabel", labelSubject)
      .add(subject, "skosxl:altLabel", altLabelSubject)
      .add(subject, "skosxl:altLabel", fullAltLabelSubject)
      ;

    mb.defaultGraph()
      .add(labelSubject, "rdf:type", "skosxl:Label")
      .add(labelSubject, "skosxl:literalForm", literal(fieldName))
      ;

    mb.defaultGraph()
      .add(altLabelSubject, "rdf:type", "skosxl:Label")
      .add(altLabelSubject, "skosxl:literalForm", literal(labelPath))
      ;

    mb.defaultGraph()
      .add(fullAltLabelSubject, "rdf:type", "skosxl:Label")
      .add(fullAltLabelSubject, "skosxl:literalForm", literal("MLEntity." + labelPath))
      ;

    if (refType != null) {
      mb.defaultGraph().add(subject, "rdf:type", "sdc:Structure");

      String definitionName = refType.substring("#/definitions/".length());

      Iterator<Map.Entry<String, JsonNode>> iterator = definitions.get(definitionName).get("properties").fields();
      while (iterator.hasNext()) {
        Map.Entry<String, JsonNode> entry = iterator.next();

        this.addConceptField(mb, subject, labelPath, entry.getKey(), entry.getValue(), definitions);
      }
    }
  }
}
