package com.marklogic.hsk.organization;

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
import org.hl7.fhir.r4.model.Organization;

public class OrganizationTest {
    private static Logger logger = LoggerFactory.getLogger("com.marklogic.organization.OrganizationTest");
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
    public void testOrganizationFinal() {
        JsonNode finalDoc = client.newJSONDocumentManager().read("/organization/organization/3ff2e4da-531e-3439-9532-fb9de7f124f4.json", new JacksonHandle()).get();
        assertEquals("3ff2e4da-531e-3439-9532-fb9de7f124f4", finalDoc.get("envelope").get("instance").get("Organization").get("id").asText());
        assertEquals("SUMMIT URGENT CARE AND OCCUPATIONAL MEDICINE", finalDoc.get("envelope").get("instance").get("Organization").get("name").asText());
        assertEquals("prov", finalDoc.get("envelope").get("instance").get("Organization").get("code__type").asText());
        //assertEquals("Healthcare Provider", finalDoc.get("envelope").get("instance").get("Organization").get("type").get("CodeableConcept").get("coding").get(0).get("Coding").get("display").asText());
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
