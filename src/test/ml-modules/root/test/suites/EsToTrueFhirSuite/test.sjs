'use strict';

const test = require("/test/test-helper.xqy");

const tt = require("/lib/fhirTransforms/templateTransform.sjs")

const doc = { "envelope": { "headers": { "sources": [{ "name": "ClaimIngest", "file": "data/synthea/csv/claims.csv" }, { "datahubSourceName": "data/synthea/csv/claims/claims.csv", "datahubSourceType": "Claim" }], "createdUsingFile": "C:\\Users\\bgriffin\\AppData\\Local\\Temp\\ingestion-9332939255836290877\\claims.csv" }, "triples": [], "instance": { "info": { "title": "Claim", "version": "1.0.0", "baseUri": "http://example.org/" }, "Claim": { "id": "0a8c5c5f-46ff-28b5-3cba-309d1c4637fa", "use": "claim", "patient": { "Reference": { "reference": "Patient/d9fb22dd-45ab-41e3-7c6c-393d74805e67", "type": "Patient" } }, "status": "active", "code__type": "institutional", "identifier__FILL": ["0a8c5c5f-46ff-28b5-3cba-309d1c4637fa"], "provider": { "Reference": { "reference": "Provider/91ded9ef-a836-32be-9449-bda240c260a9", "type": "Practitioner" } }, "code__priority": "normal", "billablePeriod": { "Period": { "end": "2013-12-15T14:01:24Z", "start": "2013-12-15T14:01:24Z" } }, "created": "2013-12-15T14:01:24Z", "enterer": { "Reference": { "reference": "Provider/91ded9ef-a836-32be-9449-bda240c260a9", "type": "Practitioner" } }, "code__fundsReserve": "none", "payee": { "Payee": { "code__type": "provider", "party": { "Reference": { "reference": "Practitioner/91ded9ef-a836-32be-9449-bda240c260a9", "type": "Practitioner" } } } }, "careTeam": [{ "CareTeamMember": { "sequence": 1, "provider": { "Reference": { "reference": "Provider/91ded9ef-a836-32be-9449-bda240c260a9", "type": "Practitioner" } }, "responsible": true, "code__role": "primary" } }], "diagnosis": [{ "Diagnosis": { "sequence": 1, "code__diagnosisCodeableConcept__SNOMED": "702927004" } }], "procedure": [{ "Procedure": { "sequence": 1, "date": "2013-12-15", "code__procedureCodeableConcept__SNOMED": "702927004" } }, { "Procedure": { "sequence": 2, "date": "2013-12-15", "code__procedureCodeableConcept__SNOMED": "702927004" } }], "total": { "Money": { "value": 102.15, "currency": "USD" } }, "item": [{ "ClaimItem": { "sequence": 1, "careTeamSequence": [1], "procedureSequence": [1], "diagnosisSequence": [1], "informationSequence": [1], "servicedDate": "2013-12-15", "servicedPeriod": { "Period": { "start": "2013-12-15T13:46:24Z", "end": "2013-12-15T14:01:24Z" } }, "locationAddress": { "Address": { "city": "MARIETTA", "state": "GA", "postalCode": "30067", "country": "US", "line": ["2890 DELK ROAD SOUTHEAST"], "text": "WELLSTAR URGENT CARE - DELK ROAD, 2890 DELK ROAD SOUTHEAST, MARIETTA, GA, 30067", "use": "work", "type": "both" } }, "locationReference": { "Reference": { "reference": "Location/148c7e27-c289-3bc0-8778-f0117d43b41c", "type": "Location" } }, "quantity": { "SimpleQuantity": { "value": 1 } }, "unitPrice": { "Money": { "currency": "USD", "value": 0 } }, "net": { "Money": { "value": 0, "currency": "USD" } } } }, { "ClaimItem": { "sequence": 2, "careTeamSequence": [1], "procedureSequence": [2], "diagnosisSequence": [1], "informationSequence": [1], "servicedDate": "2013-12-15", "servicedPeriod": { "Period": { "start": "2013-12-15T13:46:24Z", "end": "2013-12-15T14:01:24Z" } }, "locationAddress": { "Address": { "city": "MARIETTA", "state": "GA", "postalCode": "30067", "country": "US", "line": ["2890 DELK ROAD SOUTHEAST"], "text": "WELLSTAR URGENT CARE - DELK ROAD, 2890 DELK ROAD SOUTHEAST, MARIETTA, GA, 30067", "use": "work", "type": "both" } }, "locationReference": { "Reference": { "reference": "Location/148c7e27-c289-3bc0-8778-f0117d43b41c", "type": "Location" } }, "quantity": { "SimpleQuantity": { "value": 1 } }, "unitPrice": { "Money": { "currency": "USD", "value": 102.15 } }, "net": { "Money": { "value": 102.15, "currency": "USD" } } } }] } } } };

const config = {
	codableConcept: [
	  {
			  path: "envelope.instance.Claim.code__type",
			  system: "http://terminology.hl7.org/CodeSystem/claim-type",
			  lookupValueSet: "claim-type"
	  },
	  {
			  path: "envelope.instance.Claim.payee.Payee.code__type",
			  system: "http://hl7.org/fhir/ValueSet/payeetype",
			  lookupValueSet: "payeetype"
	  },
	  {
			  path: "envelope.instance.Claim.careTeam.CareTeamMember.code__role",
			  system: "http://terminology.hl7.org/CodeSystem/claimcareteamrole",
			  lookupValueSet: "claim-caretyperole"
	  },
	  {
			  path: "envelope.instance.Claim.diagnosis.Diagnosis.code__diagnosisCodeableConcept__SNOMED",
			  system: "http://snomed.info/sct/"
	  },
	  {
			  path: "envelope.instance.Claim.procedure.Procedure.code__procedureCodeableConcept__SNOMED",
			  system: "http://snomed.info/sct/"
	  },
	  {
			  path: "envelope.instance.Claim.code__priority",
			  system: "http://terminology.hl7.org/CodeSystem/processpriority",
			  lookupValueSet: "process-priority"
	  },
	  {
			  path: "envelope.instance.Claim.code__fundsReserve",
			  system: "http://hl7.org/fhir/ValueSet/fundsreserve",
			  lookupValueSet: "fundsreserve"
	  }
	],
	identifier: [
	  {
		path: "envelope.instance.Claim.identifier__FILL",
		use: "official",
		system: "http://marklogic.com/hsk/fhir/v4/Claim"
	  }
	]
  }

var claim = tt.transform(config, doc)

const assertions = []

assertions.push(
	test.assertEqual("0a8c5c5f-46ff-28b5-3cba-309d1c4637fa", claim.id),
	test.assertEqual("http://hl7.org/fhir/ValueSet/payeetype", claim.payee.type.coding[0].system),
	test.assertEqual("provider", claim.payee.type.coding[0].code),
	test.assertEqual("Provider", claim.payee.type.coding[0].display),
	test.assertEqual("702927004", claim.procedure[0].procedureCodeableConcept.coding[0].code),
	test.assertEqual(2, claim.item.length),
	test.assertEqual("102.15", xs.string(claim.total.value)),
	test.assertEqual("WELLSTAR URGENT CARE - DELK ROAD, 2890 DELK ROAD SOUTHEAST, MARIETTA, GA, 30067", claim.item[0].locationAddress.text),
);

assertions