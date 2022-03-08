# MarkLogic HealthCare Starter Kit Release Notes

*March 2022*

The MarkLogic Healthcare Starter Kit (HSK) is a working project for a healthcare payer data hub, particularly geared toward service to Medicaid customers. Also called an Operational Data Store (ODS), the HSK supports a mandate by the U.S. Centers for Medicare and Medicaid Services (CMMS) to comply with the Fast Healthcare Interoperability Resources (FHIR) specification for the electronic exchange of healthcare information.

MarkLogic HSK is intended as a starting point for a healthcare data hub with working code, as well as sample data and configurations. It is also a good foundation for implementing FHIR-compliant data services when used in combination with the [Marklogic FHIR Mapper](https://github.com/marklogic-community/marklogic-FHIR-mapper).

Users can upload raw, heterogeneous health records and use the harmonization features inherited by the HSK from the MarkLogic Data Hub to canonicalize and master their data. MarkLogic’s powerful default indexing and other Data Hub features make it easy to explore data and models to gain additional insight for future development and operations.

---
## Version 1.0.0 - 2022-03-08

### Version 1.0.0 - Compatibility

This project supports these software versions:

| Software           | Version   |
|--------------------|-----------|
| Java JDK           | 1.8 or 11 |
| Gradle             | 6.4+      |
| MarkLogic Data Hub | 5.5.1+    |
| MarkLogic Server   | 10.0-7+   |

### Version 1.0.0 - Features

Features a pre-configured deployment of MarkLogic Data Hub explicitly configured to provide an operational model to support FHIR specifications for health information exchange.

### Version 1.0.0 - Required Libraries

* MarkLogic Data Hub v5.5.1+
* MarkLogic Unit Test - client v1.1.0+
* MarkLogic Development tools - v5.4.0+ (gradle plugin)
* MarkLogic Data Movement tools - v10.0.6.2+

### Version 1.0.0 - Improvements

* Adds a cookbook which describes how to extend and modify this project to suit individual needs
* Simplifies and flattens storage model from pure FHIR
* Adds transforms from storage model to pure FHIR
* Adds a separate cleaning step for patient data mapping (example/springboard for other separate cleaning steps)
* Adds ontology-based (broader/narrower) claim query by diagnosis/procedure code
* Adds example security roles and applies them to documents
* Adds data export redaction rules, utilities

### Version 1.0.0 - Bugs Fixed

* None - concentrated on adding features for 1.0.0 release

### Version 1.0.0 - Tickets

#### Tasks

* [HSK-80] - Remove id fields from sub structures that don't need them

#### Stories

* [HSK-36] - Build a transform from ES-FHIR to true-FHIR (unflatten)
* [HSK-42] - Add a data cleansing step
* [HSK-51] - ontology-based query
* [HSK-95] - Flatten codable concepts, identifers, and other nested data in some data domain
* [HSK-96] - Build FHIR queries to test data model approach
* [HSK-97] - Update cookbook to describe how to integrate to a FHIR server
* [HSK-98] - Find security policies to drive requirements
* [HSK-99] - Implement security policy
* [HSK-105] - Redaction rules
* [HSK-106] - Export of redacted data
* [HSK-108] - Update Readme
* [HSK-109] - Update cookbook
* [HSK-110] - Cut a release on Github
* [HSK-111] - Map non-FHIR related Sanctions into a nonFHIR structured property
