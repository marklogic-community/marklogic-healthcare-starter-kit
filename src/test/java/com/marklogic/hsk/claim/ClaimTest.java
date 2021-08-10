package com.marklogic.hsk.claim;

import com.fasterxml.jackson.databind.JsonNode;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hsk.util.TestSearchCriteria;
import static com.marklogic.hsk.util.TestSearchCriteria.getSearchTermJson;
import static com.marklogic.hsk.util.TestSearchCriteria.getSearchTermListJson;

import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import org.hl7.fhir.r4.model.Claim;

public class ClaimTest {
    private static Logger logger = LoggerFactory.getLogger("com.marklogic.patient.PatientTest");
    private static DatabaseClient client = null;
    private static String host = "localhost";
    private static int port = 8011;
    private static String userName = "DrSmith";
    private static String password = "demo";
    private static Integer offset = 1;
    private static Integer count = 10;

    @BeforeAll
    public static void init() throws Exception {
        logger.info("Starting Patient Test setup");
        client = DatabaseClientFactory.newClient(host, port,
        new DatabaseClientFactory.DigestAuthContext(userName, password));
    }

    @Test
    public void testClaimFinal() {
        JsonNode finalDoc = client.newJSONDocumentManager().read("/claim/0a8c5c5f-46ff-28b5-3cba-309d1c4637fa.json", new JacksonHandle()).get();
        assertEquals("0a8c5c5f-46ff-28b5-3cba-309d1c4637fa", finalDoc.get("envelope").get("instance").get("Claim").get("id").asText());
        assertEquals("http://hl7.org/fhir/ValueSet/payeetype", finalDoc.get("envelope").get("instance").get("Claim").get("payee").get("Payee").get("type").get("CodeableConcept").get("coding").get(0).get("Coding").get("system").asText());
        assertEquals("provider", finalDoc.get("envelope").get("instance").get("Claim").get("payee").get("Payee").get("type").get("CodeableConcept").get("coding").get(0).get("Coding").get("code").asText());
        assertEquals("Provider", finalDoc.get("envelope").get("instance").get("Claim").get("payee").get("Payee").get("type").get("CodeableConcept").get("coding").get(0).get("Coding").get("display").asText());
        assertEquals("702927004", finalDoc.get("envelope").get("instance").get("Claim").get("procedure").get(0).get("Procedure").get("procedureCodeableConcept").get("CodeableConcept").get("coding").get(0).get("Coding").get("code").asText());
        assertEquals(2, finalDoc.get("envelope").get("instance").get("Claim").get("item").size());
        assertEquals("102.15", finalDoc.get("envelope").get("instance").get("Claim").get("total").get("Money").get("value").asText());
        assertEquals("WELLSTAR URGENT CARE - DELK ROAD, 2890 DELK ROAD SOUTHEAST, MARIETTA, GA, 30067", finalDoc.get("envelope").get("instance").get("Claim").get("item").get(0).get("ClaimItem").get("locationAddress").get("Address").get("text").asText());
    }

private int getDocLength(JsonNode thisNode) {
    Iterator<Map.Entry<String,JsonNode>> fieldsIterator = thisNode.fields();
    JsonNode docNode = null;
    int len = 0;
    while (fieldsIterator.hasNext()) {
       Map.Entry<String,JsonNode> field = fieldsIterator.next();
       docNode = field.getValue().get(0);
       if (docNode != null) {
            len += docNode.toString().length();
       }
    }
    return len;
}

    @AfterAll
    public static void cleanUp() throws Exception {
        logger.info("Clean up Test setup");
        client.release();
    }
}
