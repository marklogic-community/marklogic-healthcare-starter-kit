
declareUpdate()

xdmp.log("in claim setup")

// add these permissions to test data so that if teardown is not run, Hub Central accessible data is available in the mapper GUI
const permissions =
	[xdmp.permission('data-hub-common', 'read'),
	xdmp.permission('data-hub-common', 'update')];

const claim1 =
	{
		"envelope": {
			"headers": {
				"sources": [{
					"name": "ClaimIngest",
					"file": "data/synthea/csv/claims.csv"
				}, {
					"datahubSourceName": "/Users/credding/Documents/SLED/healthcare-starter-kit/data/synthea/csv/claims.csv",
					"datahubSourceType": "Claim"
				}],
				"createdUsingFile": "/var/folders/bc/4wdhh_js6q3cyrdldlvst8x5dhljp2/T/ingestion-7118838346587409139/claims.csv"
			},
			"triples": [],
			"instance": {
				"Id": "99999999-TEST-9999-9999-SUITE-MLUNIT",
				"PATIENTID": "d9fb22dd-45ab-41e3-7c6c-393d74805e67",
				"PROVIDERID": "91ded9ef-a836-32be-9449-bda240c260a9",
				"PRIMARYPATIENTINSURANCEID": "0",
				"SECONDARYPATIENTINSURANCEID": "0",
				"DEPARTMENTID": "5",
				"PATIENTDEPARTMENTID": "5",
				"DIAGNOSIS1": "702927004",
				"DIAGNOSIS2": "",
				"DIAGNOSIS3": "",
				"DIAGNOSIS4": "",
				"DIAGNOSIS5": "",
				"DIAGNOSIS6": "",
				"DIAGNOSIS7": "",
				"DIAGNOSIS8": "",
				"REFERRINGPROVIDERID": "",
				"APPOINTMENTID": "83d593b0-73e8-c18d-afad-f0414554a70a",
				"CURRENTILLNESSDATE": "2013-12-15T13:46:24Z",
				"SERVICEDATE": "2013-12-15T13:46:24Z",
				"SUPERVISINGPROVIDERID": "91ded9ef-a836-32be-9449-bda240c260a9",
				"STATUS1": "CLOSED",
				"STATUS2": "",
				"STATUSP": "CLOSED",
				"OUTSTANDING1": "0",
				"OUTSTANDING2": "",
				"OUTSTANDINGP": "0",
				"LASTBILLEDDATE1": "2013-12-15T14:01:24Z",
				"LASTBILLEDDATE2": "",
				"LASTBILLEDDATEP": "2013-12-15T14:01:24Z",
				"HEALTHCARECLAIMTYPEID1": "2",
				"HEALTHCARECLAIMTYPEID2": "0"
			},
			"attachments": null
		}
	};
xdmp.documentInsert("/claim1.json", claim1, { collections: ["testclaim", "ClaimIngest"], permissions: permissions })



const claimLine1 =
{
	"envelope": {
		"headers": {
			"sources": [
				{
					"name": "ClaimTransactionIngest",
					"file": [
						"data/synthea/csv/claim_transactions/claim_transactions_1.csv",
						"data/synthea/csv/claim_transactions/claim_transactions_2.csv"
					]
				},
				{
					"datahubSourceName": "data/synthea/csv/claims_transactions/",
					"datahubSourceType": "ClaimTransaction"
				}
			],
			"createdUsingFile": "/Users/damonfeldman/ProjectRepos/marklogic-healthcare-starter-kit/data/synthea/csv/claims_transactions-smaller/claim_transactions_01.csv"
		},
		"triples": [],
		"instance": {
			"CLAIMID": "99999999-TEST-9999-9999-SUITE-MLUNIT",
			"CHARGEID": "37759",
			"PATIENTID": "d9fb22dd-45ab-41e3-7c6c-393d74805e67",
			"TYPE": "PAYMENT",
			"AMOUNT": "61.77",
			"METHOD": "CHECK",
			"FROMDATE": "2009-04-19T13:46:24Z",
			"TODATE": "2009-04-19T14:01:24Z",
			"PLACEOFSERVICE": "99999999-TEST-LOCN-0001-999999999999",
			"PROCEDURECODE": "185349003",
			"MODIFIER1": "",
			"MODIFIER2": "",
			"DIAGNOSISREF1": "1",
			"DIAGNOSISREF2": "",
			"DIAGNOSISREF3": "",
			"DIAGNOSISREF4": "",
			"UNITS": "1",
			"DEPARTMENTID": "2",
			"NOTES": "Encounter for check up (procedure)",
			"UNITAMOUNT": "",
			"TRANSFEROUTID": "",
			"TRANSFERTYPE": "",
			"PAYMENTS": "40.00",
			"ADJUSTMENTS": "-20.77",
			"TRANSFERS": "",
			"OUTSTANDING": "0.00",
			"APPOINTMENTID": "d2ba2cea-42ae-bf01-f4fa-9feb4db9b6ac",
			"LINENOTE": "",
			"PATIENTINSURANCEID": "d9fb22dd-45ab-41e3-7c6c-393d74805e67",
			"FEESCHEDULEID": "1",
			"PROVIDERID": "3436a94f-b383-3aea-92b7-c0f85b94c24b",
			"SUPERVISINGPROVIDERID": "3436a94f-b383-3aea-92b7-c0f85b94c24b"
		},
		"attachments": null
	}
}

const claimLine2 =
{
	"envelope": {
		"headers": {
			"sources": [
				{
					"name": "ClaimTransactionIngest",
					"file": [
						"data/synthea/csv/claim_transactions/claim_transactions_1.csv",
						"data/synthea/csv/claim_transactions/claim_transactions_2.csv"
					]
				},
				{
					"datahubSourceName": "data/synthea/csv/claims_transactions/",
					"datahubSourceType": "ClaimTransaction"
				}
			],
			"createdUsingFile": "/Users/damonfeldman/ProjectRepos/marklogic-healthcare-starter-kit/data/synthea/csv/claims_transactions-smaller/claim_transactions_01.csv"
		},
		"triples": [],
		"instance": {
			"ID": "bcfcdbf1-d9a7-0ee4-cd5e-8050484d787c",
			"CLAIMID": "99999999-TEST-9999-9999-SUITE-MLUNIT",
			"CHARGEID": "35819",
			"PATIENTID": "d9fb22dd-45ab-41e3-7c6c-393d74805e67",
			"TYPE": "TRANSFERIN",
			"AMOUNT": "21.23",
			"METHOD": "",
			"FROMDATE": "1998-07-19T13:46:24Z",
			"TODATE": "1998-12-06T13:46:24Z",
			"PLACEOFSERVICE": "99999999-TEST-LOCN-0001-999999999999",
			"PROCEDURECODE": "860975",
			"MODIFIER1": "",
			"MODIFIER2": "",
			"DIAGNOSISREF1": "1",
			"DIAGNOSISREF2": "",
			"DIAGNOSISREF3": "",
			"DIAGNOSISREF4": "",
			"UNITS": "1",
			"DEPARTMENTID": "2",
			"NOTES": "24 HR Metformin hydrochloride 500 MG Extended Release Oral Tablet",
			"UNITAMOUNT": "",
			"TRANSFEROUTID": "35818",
			"TRANSFERTYPE": "p",
			"PAYMENTS": "",
			"ADJUSTMENTS": "",
			"TRANSFERS": "21.23",
			"OUTSTANDING": "29.23",
			"APPOINTMENTID": "427ec00c-b261-afc0-a55d-0ad73097f153",
			"LINENOTE": "",
			"PATIENTINSURANCEID": "d9fb22dd-45ab-41e3-7c6c-393d74805e67",
			"FEESCHEDULEID": "1",
			"PROVIDERID": "3436a94f-b383-3aea-92b7-c0f85b94c24b",
			"SUPERVISINGPROVIDERID": "3436a94f-b383-3aea-92b7-c0f85b94c24b"
		},
		"attachments": null
	}
}

xdmp.documentInsert("/claimline1.json", claimLine1, { collections: ["testclaimline", "ClaimTransactionIngest"], permissions: permissions })
xdmp.documentInsert("/claimline2.json", claimLine2, { collections: ["testclaimline", "ClaimTransactionIngest"], permissions: permissions })
xdmp.log("INSERTED claimline1 and claimline2.json")
// ==========

const org1 =
{
	"envelope": {
		"headers": {
			"sources": [
				{
					"name": "OrganizationIngest",
					"file": "data/synthea/csv/organizations.csv"
				},
				{
					"datahubSourceName": "data/synthea/csv/organizations/organizations.csv",
					"datahubSourceType": "Organization"
				}
			],
			"createdUsingFile": "/Users/damonfeldman/ProjectRepos/marklogic-healthcare-starter-kit/data/synthea/csv/organizations/organizations.csv"
		},
		"triples": [],
		"instance": {
			"Id": "99999999-TEST-LOCN-0001-999999999999",
			"NAME": "SOUTHEAST GEORGIA HEALTH SYSTEM- BRUNSWICK CAMPUS",
			"ADDRESS": "2415 PARKWOOD DRIVE",
			"CITY": "BRUNSWICK",
			"STATE": "GA",
			"ZIP": "31520",
			"LAT": "31.13617",
			"LON": "-81.466915",
			"PHONE": "9124667000",
			"REVENUE": "0.0",
			"UTILIZATION": "390"
		},
		"attachments": null
	}
}

xdmp.documentInsert("/organization1.json", org1, { collections: ["testOrganization", "OrganizationIngest"], permissions: permissions })

