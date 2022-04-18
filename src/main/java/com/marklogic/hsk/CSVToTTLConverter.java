package com.marklogic.hsk;

import static org.eclipse.rdf4j.model.util.Values.literal;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Pattern;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
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
import net.sourceforge.argparse4j.impl.Arguments;
import net.sourceforge.argparse4j.inf.ArgumentParser;
import net.sourceforge.argparse4j.inf.ArgumentParserException;
import net.sourceforge.argparse4j.inf.MutuallyExclusiveGroup;
import net.sourceforge.argparse4j.inf.Namespace;

public class CSVToTTLConverter {
  public static void main(String[] argv) throws IOException {
    Namespace ns = CSVToTTLConverter.parseArguments(argv);

    new CSVToTTLConverter(ns).convertCSVToTTL();
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
      .newFor("CSVToTTLConverter")
      .build()
      .defaultHelp(true)
      .description("Convert CSV file(s) along given path to TTL files for SmartLogic ingest")
      ;

    parser
      .addArgument("--path")
      .setDefault("./data/synthea/csv")
      .help("Specify the path to scan for CSV files")
      ;

    parser
      .addArgument("--prefix")
      .setDefault("http://hsk.marklogic.com/csv-import#")
      .help("Specify a custom prefix for inserted triple subject IRIs")
      ;

    MutuallyExclusiveGroup group = parser.addMutuallyExclusiveGroup();

    group
      .addArgument("--preferAltLabel")
      .setDefault(false)
      .action(Arguments.storeTrue())
      .help("Prefer the more verbose alternate label as the primary label when outputting TTL")
      ;

    group
      .addArgument("--preferFullAltLabel")
      .setDefault(false)
      .action(Arguments.storeTrue())
      .help("Prefer the full alternate label as the primary label when outputting TTL. Implies --preferAltLabel for subjects without a full alternate label.")
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
  public CSVToTTLConverter(Namespace args) {
    this.args = args;
  }

  /**
   * Convert all CSV files found along a given path to TTL files
   *
   * @throws IOException  Failed to read/write a file
   */
  public void convertCSVToTTL() throws IOException {
    String path = this.args.getString("path");
    List<File> csvFiles = this.findAllCSVFilesAlongPath(path);

    if (csvFiles.size() == 0) {
      throw new RuntimeException("No CSV files found along path " + path);
    }

    HashSet<String> visitedTypes = new HashSet<String>();

    for (File file : csvFiles) {
      String fileName = file.getName();
      String typeName = getTypeNameFromFileName(fileName);

      if (visitedTypes.contains(typeName)) {
        System.out.println("Skipping file \"" + fileName + "\" because its inferred type (\"" + typeName + "\") has already been processed");
        continue;
      }

      visitedTypes.add(typeName);

      CSVRecord headers = CSVParser
        .parse(file, StandardCharsets.UTF_8, CSVFormat.DEFAULT)
        .iterator()
        .next();

      this.createTTLForFile(typeName, headers);
    }
  }

  /**
   * Finds all CSV files along path.
   *
   * @param  path  The path
   *
   * @return The list of CSV files found
   */
  private List<File> findAllCSVFilesAlongPath(String path) {
    return this.findAllCSVFilesAlongPath(new File(path));
  }

  /**
   * Finds all CSV files along path.
   *
   * @param  dirent  The dirent
   *
   * @return The list of CSV files found
   */
  private List<File> findAllCSVFilesAlongPath(File dirent) {
    List<File> result = new ArrayList<File>();

    if (dirent.isFile()) {
      result.add(dirent);
    } else {
      File[] entries = dirent.listFiles();

      if (entries != null) {
        for (File entry : entries) {
          if (entry.isDirectory()) {
            result.addAll(this.findAllCSVFilesAlongPath(entry));
          } else if (entry.getName().endsWith(".csv")) {
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
    final Pattern typeNameContainsNumber = Pattern.compile(".*_\\d+$");

    String typeName = fileName.substring(0, fileName.indexOf('.'));

    if (typeNameContainsNumber.matcher(typeName).matches()) {
      typeName = typeName.substring(0, typeName.lastIndexOf('_'));
    }

    return typeName.toUpperCase();
  }

  /**
   * Creates TTL for file.
   *
   * @param  typeName     The type name
   * @param  headers      The headers
   *
   * @throws IOException  Unable to write output file
   */
  private void createTTLForFile(String typeName, CSVRecord headers) throws IOException {
    ModelBuilder mb = this.getDefaultModelBuilder();

    this.addConceptStructure(mb, typeName);
    for (String header : headers) {
      this.addConceptField(mb, typeName, header);
    }

    Model m = mb.build();

    new File("./csv-to-rdf").mkdir();
    File outputFile = new File("./csv-to-rdf/" + typeName + ".ttl");
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
   * @param  mb        The Model Builder
   * @param  typeName  The type name
   */
  private void addConceptStructure(ModelBuilder mb, String typeName) {
    String subject = "hsk:" + typeName;
    String labelSubject = subject + "/" + typeName + "_l-n";
    String altLabelSubject = subject + "/csvFile." + typeName + "_l-n";

    // Perform boolean comparison in case --preferAltLabel isn't found and getBoolean returns null
    boolean preferAltLabel = this.args.getBoolean("preferAltLabel") == true || this.args.getBoolean("preferFullAltLabel") == true;

    mb.defaultGraph()
      .add(subject, "rdf:type", "sdc:Structure")
      .add(subject, "sem:guid", java.util.UUID.randomUUID())
      .add(subject, "skos:broader", "sdc:csvFile")
      .add(subject, "skosxl:prefLabel", !preferAltLabel ? labelSubject : altLabelSubject)
      .add(subject, "skosxl:altLabel", !preferAltLabel ? altLabelSubject : labelSubject)
      ;

    mb.defaultGraph()
      .add(labelSubject, "rdf:type", "skosxl:Label")
      .add(labelSubject, "skosxl:literalForm", literal(typeName))
      ;

    mb.defaultGraph()
      .add(altLabelSubject, "rdf:type", "skosxl:Label")
      .add(altLabelSubject, "skosxl:literalForm", literal("csvFile." + typeName))
      ;
  }

  /**
   * Add a conceptual field to the given Model Builder
   *
   * @param  mb         The Model Builder
   * @param  typeName   The type name
   * @param  fieldName  The field name
   */
  private void addConceptField(ModelBuilder mb, String typeName, String fieldName) {
    String structureSubject = "hsk:" + typeName;
    String subject = structureSubject + "/" + fieldName;
    String labelSubject = subject + "/" + fieldName + "_l-n";
    String altLabelSubject = subject + "/" + typeName + "." + fieldName + "_l-n";
    String fullAltLabelSubject = subject + "/csvFile." + typeName + "." + fieldName + "_l-n";

    // Perform boolean comparison in case --preferAltLabel isn't found and getBoolean returns null
    boolean preferAltLabel = this.args.getBoolean("preferAltLabel") == true;
    boolean preferFullAltLabel = this.args.getBoolean("preferFullAltLabel") == true;

    mb.defaultGraph()
      .add(subject, "rdf:type", "sdc:Field")
      .add(subject, "sdc:isFieldIn", structureSubject)
      .add(subject, "sdc:isKey", fieldName.toLowerCase().equals("id"))
      .add(subject, "sdc:isList", false)
      .add(subject, "sem:guid", java.util.UUID.randomUUID())
      .add(subject, "skosxl:prefLabel", preferFullAltLabel
        ? fullAltLabelSubject
        : preferAltLabel
          ? altLabelSubject
          : labelSubject
      )
      .add(subject, "skosxl:altLabel", preferAltLabel ? labelSubject : altLabelSubject)
      .add(subject, "skosxl:altLabel", preferFullAltLabel ? labelSubject : fullAltLabelSubject)
      ;

    mb.defaultGraph()
      .add(labelSubject, "rdf:type", "skosxl:Label")
      .add(labelSubject, "skosxl:literalForm", literal(fieldName))
      ;

    mb.defaultGraph()
      .add(altLabelSubject, "rdf:type", "skosxl:Label")
      .add(altLabelSubject, "skosxl:literalForm", literal(typeName + "." + fieldName))
      ;

    mb.defaultGraph()
      .add(fullAltLabelSubject, "rdf:type", "skosxl:Label")
      .add(fullAltLabelSubject, "skosxl:literalForm", literal("csvFile." + typeName + "." + fieldName))
      ;
  }
}
