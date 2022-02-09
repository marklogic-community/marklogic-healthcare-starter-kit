# MarkLogic Healthcare Starter Kit Cookbook

## (TODO: Place me appropriately) Using Ontologies for Subsumation Searching

We have provided ontologies for ICD-10-CM and ICD-10-PCS because those are freely available without license. If you are using ICD-10 codes in your data you can simply use the `loadIcd10Ontologies` task available in the gradle build file.

If you are using SNOMED-CT then you will need to download the ontology yourself as it requires a license for use and distribution. Once downloaded you will need to run the ZIP file through the [`snomed-owl-toolkit`](https://github.com/IHTSDO/snomed-owl-toolkit) and then run the resulting `ontology-<time-run>.owl` through [ROBOT](http://robot.obolibrary.org/) in order to transform the data into a format that will be understood by the MarkLogic Database for ingestion. Once transformed place the ingestable file in `src/main/ml-data/ontologies/SNOMED-CT.ttl` and you will be able to run `loadSnomedCTOntology` (or if you want to use all 3 ontologies you can use `loadOntologies`).

If you are using SNOMED-CT and would like to use the standardized queries that we have provided in this project you will also need to add SKOS Core Notation triples to the SNOMED-CT ontology. This is currently set up as part of the import task but if you do not want to use this process you can separate the two steps and add the SKOS Core Notations separately by running the `normalizeSnomedCTOntology` task.

Keep in mind that if you use a different data model you will need to tweak your code to work with it.

## Adding Interoperablitiy

### FHIR Mapping Project

To see how to connect a HAPI FHIR server to a MarkLogic database, chack out the [MarkLogic FHIR Mapper](https://github.com/marklogic-community/marklogic-FHIR-mapper) project.

### Improvements Using FHIR Like Storage Model

In the FHIR mapper project, we used a DHF mapping step to convert a storage model into FHIR as part of the Data Service that responds to requests from the HAPI server. While that could work for this project as well, we can avoid many of these steps since our storage model is very close to FHIR already.

Many of the differences between our storage model and FHIR are flattened code fields that don't contain the full FHIR definition of a CodableConcept and flattened identifiers that don't contain the full FHIR definition of an Identifier. To convert these from a list of codes or identifiers, a library has been created at ```src\main\ml-modules\root\lib\fhirTransforms\templateTransform.sjs``` which takes a replacement template and a document to apply that template to. This method will allow the configuration to focus on models that need to be changed and replaced, rather than including 1:1 mappings of everything that does not change. Using this type of transform would replace the call to ```egress.transformMultiple()``` used in the data services which is used to call the mapping step on egress.

The ```templateTransform``` has a couple of utilities built into it for easily converting string fields in the storage model into standard FHIR formats. For example, to convert a string code into a CodeableConcept, you can use the utility template like this:

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

### Subsumation searches and FHIR

Adding ```:above``` and ```:below``` modifiers to searchs can be achieved by using the "Ontologies for Subsumation Searching" described earlier in this cookbook. This will change the way you query for documents, but will not affect the conversion from your storage model into a FHIR record.