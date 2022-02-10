# MarkLogic Healthcare Starter Kit Cookbook

## (TODO: Place me appropriately) Using Ontologies for Subsumation Searching

We have provided ontologies for ICD-10-CM and ICD-10-PCS because those are freely available without license. If you are using ICD-10 codes in your data you can simply use the `loadIcd10Ontologies` task available in the gradle build file.

If you are using SNOMED-CT then you will need to download the ontology yourself as it requires a license for use and distribution. Once downloaded you will need to run the ZIP file through the [`snomed-owl-toolkit`](https://github.com/IHTSDO/snomed-owl-toolkit) and then run the resulting `ontology-<time-run>.owl` through [ROBOT](http://robot.obolibrary.org/) in order to transform the data into a format that will be understood by the MarkLogic Database for ingestion. Once transformed place the ingestable file in `src/main/ml-data/ontologies/SNOMED-CT.ttl` and you will be able to run `loadSnomedCTOntology` (or if you want to use all 3 ontologies you can use `loadOntologies`).

If you are using SNOMED-CT and would like to use the standardized queries that we have provided in this project you will also need to add SKOS Core Notation triples to the SNOMED-CT ontology. This is currently set up as part of the import task but if you do not want to use this process you can separate the two steps and add the SKOS Core Notations separately by running the `normalizeSnomedCTOntology` task.

Keep in mind that if you use a different data model you will need to tweak your code to work with it.

## Connecting to a compliant FHIR server for healthcare interoperability
The CMS Interoperability and Patient Access final rule requires that patient data be exposed as FHIR for Medicaid and other payers. FHIR is also a standard, widely-understood format, so FHIR-compliant APIs are useful.
### FHIR Mapping Project

To see how we connect a HAPI FHIR server to a generic MarkLogic database, check out the [MarkLogic FHIR Mapper](https://github.com/marklogic-community/marklogic-FHIR-mapper) project. The FHIR Mapping project includes HAPI IResourceProvider implementations and query logic that will be useful to integrate HAPI to this project as well. 

The FHIR Mapping project is different in that it uses data services which invoke a DHF mapping step to convert a storage model into FHIR in memory. The step mapping is used because the persistent model is no similar to FHIR and a full mapping is required. Here, we simplify, and avoid writing an full mapping from persistent to FHIR by leveraging the similarity of our storage model to FHIR. 

While the .sjs data service implementations in the FHIR Mapping project will not work here, the Java integration code and data service .api specifications will work as-is, if a new search and transform data service (search.sjs module) is written for this projet. The intent is to use the generic FHIR transform described below in a new data service. If the data service needs additional query parameters or logic, that can then be added.
### Adding FHIR data services to this project

This project's persistent data model (the Entity Services model) is a simplified version of FHIR, with extensions. These simplifications are regular, meaning that one can derive FHIR easily from the data model using mechanical transforms. These mechanical transforms use information encoded in field names, along with some FHIR mapping metadata to drive the transform. A library is included at ```src\main\ml-modules\root\lib\fhirTransforms\templateTransform.sjs``` that performs the transform from persistent models to FHIR.

The main difference between our storage model and FHI is that our persistent model "flattens" CodableConcept fields and Identifier fields, replacing them with simpler structures. This reduces the nesting level and complexity of our data models, simplifies and speeds queries, and avoids confusion about how to persist records by fixing one "system" and storing all values in the same system. The library noted above uses a FHIR rewriting template to specify how a document is converted to FHIR. The template specifies the fully-specified, nested CodableConcept and Identifier structures that replace the flattened, simplified fields in our persistent model. These templates are configuration records that specify only the flattened fields that need to be changed and replaced, and allow us to avoid larger mappings of the entire record. In this way, we have a configuration-driven process to map persistent data to FHIR, which effectively reverses the mechanical "flattening" that was done to FHIR to yeild our persistence-optimized model.

### Steps for FHIR integration

To build a data service that will work with the Java calling code in the FHIR Mapping project, use a similar data service to those such as ```data-services\patient\search.sjs``` but instead of calling  ```egress.transformMultiple()``` (which invokes a data hub step to transform a persistent record), call ```templateTransofrm()``` in the library above. 

The ```templateTransform.sjs``` file also has utility functions for easily converting string fields in the storage model into standard FHIR formats. For example, to convert a flattened string code into a CodeableConcept, you can use the utility template like this:

```json
{
    "codeableConcept": [
        {
            "path": "claim.payee.code__type",
            "system": "http://hl7.org/fhir/ValueSet/payeetype",
            "lookupValueSet": "payeetype"
        }
    ]
}
```

This will replace the ```code__type``` field in the claim.payee object with a CodeableConcept named ```type``` with a coding value of the value in ```code__type```, a system of ```http://hl7.org/fhir/ValueSet/payeetype```, and will lookup the display value from the lookup file in ```src\main\ml-data\referenceData\ValueSets\payeetype.json```.

Note that we are assuming tha all data is stored in one CodableConcept.system. This makes the persistent value uniform and queryable. Because of this fundamental difference between flexible message formats and unofirm persistent formats, we are able to almost always flatten a CodabelConcept into an underscore__delimited field without the complexity and nesting of a CodableConcept, and similarly flatten many Identifiers.

### Subsumation searches and FHIR

Adding ```:above``` and ```:below``` modifiers to searchs can be achieved by using the "Ontologies for Subsumation Searching" described earlier in this cookbook. This will change the way you query for documents, but will not affect the conversion from your storage model into a FHIR record.