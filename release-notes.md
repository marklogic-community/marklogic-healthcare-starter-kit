MarkLogic HealthCare Starter Kit Release Notes
==============================

*August 2021*

The **MarkLogic Healthcare Starter Kit (HSK)** is a working project for a healthcare payer data hub, particularly geared toward service to Medicaid customers. Also called an **_operational data store (ODS)_**, the **HSK **supports a mandate by the **U.S. Centers for Medicare and Medicaid Services (CMS)** to comply with the **FHIR (Fast Healthcare Interoperability Resources)** specifications for the electronic exchange of healthcare information.

MarkLogic HSK is a tailored instance of a **MarkLogic Data Hub**, powered by **MarkLogic Server**.

Users can upload raw, heterogeneous health records and use the harmonization features inherited by the **HSK** from the **MarkLogic Data Hub** to canolicalize and master their data. MarkLogic’s powerful default indexing and other Hub features make it easy to explore data and models to gain additional insight for future development and operations.

---
## Version 0.9.0 - 2021-08-10

### Version 0.9.0 - Compatibility

This project supports these software versions:

<table>
  <tr>
   <td><strong>Software</strong></td>
   <td><strong>Version</strong></td>
  </tr>
  <tr>
   <td>Java JDK</td>
   <td>1.8 or 11</td>
  </tr>
  <tr>
   <td>Gradle</td>
   <td>6.4 or higher</td>
  </tr>
  <tr>
   <td>MarkLogic Data Hub</td>
   <td>5.5.1</td>
  </tr>
  <tr>
   <td>MarkLogic Server</td>
   <td>10.0-7 or higher</td>
  </tr>
</table>

### Version 0.9.0 - Features

This is the initial release of the Healthcare Starter Kit, so, everything’s new!

Features a pre-configured deployment of MarkLogic Data Hub explicitly configured to provide an operational model to support FHIR specifications for health information exchange.

### Version 0.9.0 - Required Libraries

* MarkLogic Data Hub v5.5.1
* MarkLogic Unit Test - client v1.1.0
* MarkLogic Development tools - v5.4.0 (gradle plugin)
* MarkLogic Data Movement tools - v10.0.6.2

### Version 0.9.0 - Improvements

* None, other than…​"This is the initial release of the Healthcare Starter Kit, so, everything’s new!"


### Version 0.9.0 - Bugs Fixed

* None, other than…​"This is the initial release of the Healthcare Starter Kit, so, everything’s new!"


### Version 0.9.0 - Tickets

#### Tasks
 * [HSK-75] - Resolve conflicting URIs in Final
 * [HSK-77] - Update the names of storage entities
 * [HSK-80] - Remove id fields from sub structures that don't need them
 * [HSK-81] - Remove meta field from models
 * [HSK-82] - Flatten all identifiers

#### Sub-tasks
 * [HSK-65] - Map provider and organization data to PersistenceUSCoreLocation entity
 * [HSK-72] - Create Initial Document Artifacts: README.md, release-notes.md and Wiki Cookbook outline

#### Epics
 * [HSK-68] - Quality v1

#### Stories
 * [HSK-38] - Map incoming Provider data to Practitioner + Organization
 * [HSK-45] - README and Cookbooks
 * [HSK-50] - Push starter kit code to github, approve as FOSS
 * [HSK-70] - Release management v1
 * [HSK-83] - Remove some codes
 * [HSK-85] - Stress test, review, be sure nothing blows up
