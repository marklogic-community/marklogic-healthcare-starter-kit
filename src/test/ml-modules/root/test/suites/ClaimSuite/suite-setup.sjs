
declareUpdate()

const claimLine1 = {
	"claimLine": {
		"ID": "12b86ff6-ef7e-758a-5019-cec81ce5f87c",
		"CLAIMID": "99999999-TEST-9999-9999-SUITE-MLUNIT",
		"CHARGEID": "94127",
		"PATIENTID": "59919746-ac2b-39c7-c49a-77834553de92",
		"TYPE": "CHARGE",
		"AMOUNT": "0.00",
		"METHOD": "",
		"FROMDATE": "1980-10-06T02:11:14Z",
		"TODATE": "1980-12-29T02:11:14Z",
		"PLACEOFSERVICE": "03a88203-f2f4-315a-96f6-af70a4add945",
		"PROCEDURECODE": "310798",
		"MODIFIER1": "",
		"MODIFIER2": "",
		"DIAGNOSISREF1": "1",
		"DIAGNOSISREF2": "",
		"DIAGNOSISREF3": "",
		"DIAGNOSISREF4": "",
		"UNITS": "1",
		"DEPARTMENTID": "20",
		"NOTES": "Hydrochlorothiazide 25 MG Oral Tablet",
		"UNITAMOUNT": "0.00",
		"TRANSFEROUTID": "",
		"TRANSFERTYPE": "1",
		"PAYMENTS": "",
		"ADJUSTMENTS": "",
		"TRANSFERS": "",
		"OUTSTANDING": "",
		"APPOINTMENTID": "65d6c491-79b7-2874-e2ba-8489c3b82398",
		"LINENOTE": "",
		"PATIENTINSURANCEID": "59919746-ac2b-39c7-c49a-77834553de92",
		"FEESCHEDULEID": "1",
		"PROVIDERID": "d4717b6f-ef22-3b8f-9bfd-f2007525853f",
		"SUPERVISINGPROVIDERID": "d4717b6f-ef22-3b8f-9bfd-f2007525853f"
	}};
xdmp.documentInsert("/claimline1.json", claimLine1, {collections: ["testclaimline"]})
