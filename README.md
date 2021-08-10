MarkLogic Healthcare Starter Kit
==============================

*****
The **MarkLogic Healthcare Starter Kit (HSK)** is a working project for a healthcare payer data hub, particularly geared toward service to Medicaid customers. Also called an **_operational data store (ODS)_**, the **HSK** supports a mandate by the **U.S. Centers for Medicare and Medicaid Services (CMS)** to comply with the **FHIR (Fast Healthcare Interoperability Resources)** specifications for the electronic exchange of healthcare information.

MarkLogic HSK is a tailored instance of a **MarkLogic Data Hub**, powered by **MarkLogic Server**.

Users can upload raw, heterogeneous health records and use the harmonization features inherited by the **HSK** from the **MarkLogic Data Hub** to canolicalize and master their data. MarkLogic’s powerful default indexing and other Hub features make it easy to explore data and models to gain additional insight for future development and operations.

More information about **MarkLogic Data Hub**, **MarkLogic Server** and the **FHIR** specifications can be found here:

[MarkLogic Data Hub Documentation](https://docs.marklogic.com/datahub/5.5/index.html)

[MarkLogic Server Documentation](https://docs.marklogic.com/10.0)

[Everything About HL7/FHIR](https://www.hl7.org/fhir/index.html)


## Get the Healthcare Starter Kit

Clone the source or download the tagged release zip file from the MarkLogic Community GitHub repository:

[MarkLogic Health Care Starter Kit](https://github.com/marklogic-community/marklogic-healthcare-starter-kit).

## Deploy the Healthcare Starter Kit

This version (0.9.0) of the HSK project was built and tested with the following prerequisites:

- Java 8 or 11
- Gradle >= v6.4
  - Note: we recommend running all commands with the built-in the Gradle wrapper function, `./gradlew`, which requires no installation.
- MarkLogic Data Hub v5.5.1
- MarkLogic Server >= v10.0-7

### Installation Steps:

- [Download MarkLogic Data Hub Central v.5.5.1 web application archive (.war) file](http://developer.marklogic.com/download/binaries/dhf/marklogic-data-hub-central-5.5.1.war)
- Unzip the tagged release or clone the source into a directory of your choosing.
- At the top level of the `healthcare-starter-kit` directory, edit the `mlUsername` and `mlPassword` properties within the `gradle-local.properties` file, based on the MarkLogic user you intend to use. 
  - Note: This assumes a MarkLogic Server user/role with sufficient privileges; please refer to MarkLogic Data Hub documentation if needed.
  - The project includes several sample demo users, such as `DrSmith` (password `"demo"` sans quotes), who is capable of running all operations.
- Deploy Healtcare Starter Kit data hub:
  - `./gradlew hubInit`
  - `./gradlew mlDeploy`
    -   Reference the "Notes On Maintaining and Modifying the Healthcare Starter Kit", below.
  - `./gradlew mlLoadData`
    -  Loads reference data input to user-defined steps and functions included with this project

## Use the Healthcare Starter Kit (HSK)

There are two primary ways to access and use the deployed Healthcare Starter Kit. 

1. For GUI access, use **MarkLogic Data Hub Central**. 
1. For command line access, use **gradle.**

Both means can be used together as determined by your development requirements. However, see "Notes On Maintaining and Modifying the Healthcare Starter Kit" below.

### Using Data Hub Central

In the top level directory, run the following command: `java -jar marklogic-data-hub-central-5.5.1.war`

At this point, you can use the features of Data Hub Central to run the processing flows to ingest, curate, and explore the sample data and models provided.

Detailed DHC documentation is found here: 

[Data Hub Central -- Access and Features](https://developer.marklogic.com/learn/data-hub-central/#access-data-hub-central)


### Using Gradle 

*Note: we recommend using the `./gradlew` wrapper command for all operations*

The **gradlew** command line tool accesses the MarkLogic Gradle plugin, **ml-gradle**,  which provides functions for development and command and control of the **MarkLogic Server** and **Data Hub**. A [full list of ml-gradle functions is provided here](https://github.com/marklogic-community/ml-gradle/wiki/Task-reference).

To ingest and curate (harmonize) the sample data provided, run the following commands at the top level of the ../healthcare-starter-kit directory into which you deployed the project artifacts:

#### Ingest the Data

Run the following commands in sequence for ingestion of the provided sample data.
 
```
# Patient (755 documents)
./gradlew hubRunFlow -PentityName=Patient -Psteps="1" -PflowName=Patient -PinputFilePath=data/synthea/csv/patients -PenvironmentName=local

# Provider (790 documents)
./gradlew hubRunFlow -PentityName=Provider -Psteps="1" -PflowName=Provider -PinputFilePath=data/synthea/csv/providers -PenvironmentName=local

# Organization (790 documents)
./gradlew hubRunFlow -PentityName=Organization -Psteps="1" -PflowName=Organization -PinputFilePath=data/synthea/csv/organizations -PenvironmentName=local

# Claim (76,118 documents)
./gradlew hubRunFlow -PentityName=Claim -Psteps="1" -PflowName=Claim -PinputFilePath=data/synthea/csv/claims -PenvironmentName=local

ClaimTransaction (464,726 documents)
./gradlew hubRunFlow -PentityName=ClaimTransaction -Psteps="1" -PflowName=ClaimTransaction -PinputFilePath=data/synthea/csv/claims_transactions -PenvironmentName=local

Payor (10 documents)
./gradlew hubRunFlow -PentityName=Payor -Psteps="1" -PflowName=Payor -PinputFilePath=data/synthea/csv/payers -PenvironmentName=local
```

#### Curate the Data

Run the following commands in sequence for curation (mapping, custom, matching, and merging steps) of the provided sample data.

```
# Patient
./gradlew hubRunFlow -PentityName=Patient -Psteps="2,3,4,5" -PflowName=Patient -PenvironmentName=local

# Organization
./gradlew hubRunFlow -PentityName=Organization -Psteps="2,3" -PflowName=Organization -PenvironmentName=local

# Provider
./gradlew hubRunFlow -PentityName=Provider -Psteps="2,3,4" -PflowName=Provider -PenvironmentName=local

# Claim
./gradlew hubRunFlow -PentityName=Claim -Psteps="2" -PflowName=Claim -PenvironmentName=local
```

### Running Unit and Integration Tests

To verify the deployment, two test suites are provided.

- To run JUnit integration test of the complete flow from ingest to curation, use `./gradlew test -PenvironmentName=local`
- To run MarkLogic Unit Tests (developed in server-side Javascript), use `./gradlew mlUnitTest -PenvironmentName=local`

The test suites are found in project directories, here:

- JUnit integration: `src/test/java/com/marklogic/hsk`
- MarkLogic unit tests: `src/test/ml-modules/root/test/suites`


## Notes on Maintaining and Modifying the Healthcare Starter Kit (HSK)

### About the sample source data

The sample health population data provided in this project was generated using the Synthea synthetic health records project found here: [https://github.com/synthetichealth/synthea](https://github.com/synthetichealth/synthea)

The HSK project provides sample records for 755 patients and associated healthcare providers, organizations, claims, claims transactions, and payors.

### ml-gradle project

The Marklogic Gradle plugin project is found here: [MarkLogic Gradle Plugin](https://github.com/marklogic-community/ml-gradle). This project provides the commands needed to deploy, maintain, test and modify the HSK project. Full documentation is found here: [MarkLogic Gradle Plugin Wiki](https://github.com/marklogic-community/ml-gradle/wiki)


### Data Hub Central and ml-gradle

 **Data Hub Central** can be used to modify entities, run ingest and curation steps, explore content, and monitor jobs. Please note that using Data Hub Central, any changes are not propagated immediately to the local file directory that stores the artifacts for the base HSK project. You can use features of DHC to download them to your project directory, or this ml-gradle command: 
 - `./gradlew mlWatch -i -PenvironmentName=local`.  

This command will run in the background and automatically upload changes you make to artifacts in the project directory -- see ml-gradle documentation for details: [Watching for Module Changes](https://github.com/marklogic-community/ml-gradle/wiki/Watching-for-module-changes)

### Deployment best practices and caveats:

If you happen to clear or delete all of your user data from the staging database, `data-hub-STAGING`, you will need to re-ingest the reference data via this command: 

- `./gradlew mlLoadData`

This will restore the refrerence document contents found in the `referenceData/` directory into the collection required to run user-defined steps included with the project.