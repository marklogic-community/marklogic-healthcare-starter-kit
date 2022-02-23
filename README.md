# MarkLogic Healthcare Starter Kit

The **MarkLogic Healthcare Starter Kit (HSK)** is a working project for a healthcare payer data hub, particularly geared toward service to Medicaid customers. Also called an **_operational data store (ODS)_**, the **HSK** supports a mandate by the **U.S. Centers for Medicare and Medicaid Services (CMMS)** to comply with the **Fast Healthcare Interoperability Resources (FHIR)** specification for the electronic exchange of healthcare information.

MarkLogic HSK is a tailored instance of a **MarkLogic Data Hub**, powered by **MarkLogic Server**.

Users can upload raw, heterogeneous health records and use the harmonization features inherited by the **HSK** from the **MarkLogic Data Hub** to canonicalize and master their data. MarkLogic’s powerful default indexing and other Data Hub features make it easy to explore data and models to gain additional insight for future development and operations.

Documentation for external projects, tools, and specifications referenced by this README are available as follows:

- [MarkLogic Data Hub](https://docs.marklogic.com/datahub/5.5/index.html)
- [MarkLogic Server](https://docs.marklogic.com/10.0)
- [HL7/FHIR](https://www.hl7.org/fhir/index.html)

## Get the Healthcare Starter Kit

Clone the source or download a tagged release zip file from the [MarkLogic Health Care Starter Kit](https://github.com/marklogic-community/marklogic-healthcare-starter-kit) repository.

## Deploy the Healthcare Starter Kit

The HSK project was built and tested with the following prerequisites:

- Java 8 or 11
- [MarkLogic Data Hub Central v5.5.1](http://developer.marklogic.com/download/binaries/dhf/marklogic-data-hub-central-5.5.1.war)
- MarkLogic Server >= v10.0-7

### Installation Steps:

> Note: Installation steps assume a MarkLogic Server user/role with sufficient privileges is specified. Refer to the MarkLogic Data Hub documentation if needed.

- Download MarkLogic Data Hub Central using the link above
- Unzip the tagged release or clone the source into a directory of your choosing.
- At the top level of your project directory, change the `mlUsername` and `mlPassword` properties in `gradle-local.properties`, based on the MarkLogic user you intend to use.
  - The project includes several sample demo users, such as `DrSmith` (password `demo`), who is capable of running all operations.
- Deploy Healtcare Starter Kit data hub:
  - `./gradlew hubInit`
  - `./gradlew mlDeploy`
    - See [Maintaining and Modifying the Healthcare Starter Kit](#user-content-maintaining-and-modifying-the-healthcare-starter-kit) below.
  - `./gradlew mlLoadData`
    - Loads reference data input to user-defined steps and functions included with this project
  - `./gradlew loadOntologies`
    - Loads ICD10 ontologies (CM & PCS), and SNOMED-CT ontology [if located at expected path](#user-content-loading-snomed-ct-ontology).

## Use the Healthcare Starter Kit (HSK)

There are two primary ways to access and use the deployed Healthcare Starter Kit.

1. For GUI access, use **MarkLogic Data Hub Central**.
1. For command line access, use **gradle.**

A mix of these methods can be used as needed by your development requirements. See [Maintaining and Modifying the Healthcare Starter Kit](#user-content-maintaining-and-modifying-the-healthcare-starter-kit) below for more information.

### Using Data Hub Central

In the top level directory, run the following command: `java -jar marklogic-data-hub-central-5.5.1.war`

At this point, you can use the features of Data Hub Central to run the processing flows to ingest, curate, and explore the sample data and models provided.

Detailed DHC documentation can be found [here](https://developer.marklogic.com/learn/data-hub-central/#access-data-hub-central)

### Using Gradle

> Note: we recommend using the provided `./gradlew` wrapper for all operations

`gradlew` accesses the MarkLogic Gradle plugin, **ml-gradle**, which provides tasks for development, command, and control of the **MarkLogic Server** and **Data Hub**. A full list of ml-gradle tasks can be found [here](https://github.com/marklogic-community/ml-gradle/wiki/Task-reference).

#### Ingesting the Data

To ingest all data you can run `./gradlew ingest`, or to ingest a smaller set of claims (for faster setup) you can run `./gradlew ingestSmaller`.

If you would like to load sets of data individually you can run the tasks that the above depend on instead:

- One of `./gradlew ingestClaimLines` or `./gradlew ingestClaimLinesSmaller`
- One of `./gradlew ingestClaims` or `./gradlew ingestClaimsSmaller`
- `./gradlew ingestOrganizations`
- `./gradlew ingestPatients`
- `./gradlew ingestPayers`
- `./gradlew ingestProviders`

#### Curating the Data

To curate all data you can run `./gradlew harmonizeAll`.

If you would like to curate sets of data individually you can run the tasks that the above depends on instead:

- `./gradlew harmonizeClaims`
- `./gradlew harmonizeOrganizations`
- `./gradlew harmonizePatients`
- `./gradlew harmonizeProviders`

### Running Unit and Integration Tests

To verify the deployment, two test suites are provided.

- To run JUnit integration test of the complete flow from ingest to curation, use `./gradlew test`
- To run MarkLogic Unit Tests (developed in server-side Javascript), use `./gradlew mlUnitTest`

The test suites can be found in the following project directories:

- JUnit integration: `src/test/java/com/marklogic/hsk`
- MarkLogic unit tests: `src/test/ml-modules/root/test/suites`

## Maintaining and Modifying the Healthcare Starter Kit

### About the sample source data

The sample health population data provided in this project was generated using the [Synthea synthetic health records project](https://github.com/synthetichealth/synthea)

The HSK project provides sample records for 755 patients and associated healthcare providers, organizations, claims, claims transactions, and payors.

### ml-gradle

The [Marklogic Gradle plugin](https://github.com/marklogic-community/ml-gradle) (ml-gradle) provides the commands needed to deploy, maintain, test and modify the HSK. Full documentation can be found on the [ml-gradle Wiki](https://github.com/marklogic-community/ml-gradle/wiki)

### Data Hub Central and ml-gradle

Data Hub Central (DHC) can be used to modify entities, run ingest and curation steps, explore content, and monitor jobs. Please note that when making changes using DHC, changes are not propagated to the local project directory. You can run `./gradlew hubPullChanges` to download the changes made in DHC and write them to your local project directory.

> WARNING: `./gradlew hubPullChanges` will overwrite any local changes you have made that were not pushed to the database using `./gradlew hubDeployUserArtifacts`

### Deployment best practices and caveats:

If you happen to clear or delete all of your user data from the staging database, `data-hub-STAGING`, you will need to re-ingest the reference data by running `./gradlew mlLoadData`

This will restore the reference document contents found in the `referenceData/` directory into the collection required to run user-defined steps included with the project.

### Loading SNOMED-CT Ontology

If you want to load a SNOMED-CT Ontology into your HSK instance, you will need to download the ontology yourself as it requires a license for use and distribution.

Once downloaded you will need to run the ZIP file through the [`snomed-owl-toolkit`](https://github.com/IHTSDO/snomed-owl-toolkit) and then run the resulting `ontology-<time-run>.owl` through [ROBOT](http://robot.obolibrary.org/) in order to transform the data into a format that will be understood by [MLCP](https://github.com/marklogic/marklogic-contentpump) for ingestion. Once transformed place the ingestable file at `./src/main/ml-data/ontologies/SNOMED-CT.ttl` and you will be able to run `./gradlew loadSnomedCTOntology` (or if you want to use all 3 ontologies you can run `./gradlew loadOntologies`).

```sh
# Example commands for transforming SNOMED-CT ontology into an ingestable format
# from the downloaded ZIP file, as run from the project directory
#
# Convert the RF2 files contained in the ZIP file to Functional OWL syntax.
# Example output filename: ~/downloads/ontology-2022-01-19_11-05-40.owl
java -jar -xms4g snomed-owl-toolkit-3.0.3-executable.jar \
     -rf2-to-owl ~/downloads/SnomedCT_PRODUCTION.zip
# Convert from Functional OWL to TTL
java -jar robot.jar convert \
     --input ~/downloads/ontology-2022-01-19_11-05-40.owl \
     --output ./src/main/ml-data/ontologies/SNOMED-CT.ttl
```
