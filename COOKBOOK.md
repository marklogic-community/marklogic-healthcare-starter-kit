# MarkLogic Healthcare Starter Kit Cookbook

## (TODO: Place me appropriately) Using Ontologies for Subsumation Searching

We have provided ontologies for ICD-10-CM and ICD-10-PCS because those are freely available without license. If you are using ICD-10 codes in your data you can simply use the `loadIcd10Ontologies` task available in the gradle build file.

If you are using SNOMED-CT then you will need to download the ontology yourself as it requires a license for use and distribution. Once downloaded you will need to run the ZIP file through the [`snomed-owl-toolkit`](https://github.com/IHTSDO/snomed-owl-toolkit) and then run the resulting `ontology-<time-run>.owl` through [ROBOT](http://robot.obolibrary.org/) in order to transform the data into a format that will be understood by the MarkLogic Database for ingestion. Once transformed place the ingestable file in `src/main/ml-data/ontologies/SNOMED-CT.ttl` and you will be able to run `loadSnomedCTOntology` (or if you want to use all 3 ontologies you can use `loadOntologies`).

If you are using SNOMED-CT and would like to use the standardized queries that we have provided in this project you will also need to add SKOS Core Notation triples to the SNOMED-CT ontology. This is currently set up as part of the import task but if you do not want to use this process you can separate the two steps and add the SKOS Core Notations separately by running the `normalizeSnomedCTOntology` task.

Keep in mind that if you use a different data model you will need to tweak your code to work with it.
