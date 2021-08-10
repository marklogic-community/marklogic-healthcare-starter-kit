package com.marklogic.hsk.provider;

import com.fasterxml.jackson.databind.JsonNode;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.MatchDocumentSummary;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;

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
import com.marklogic.client.io.Format;
import org.hl7.fhir.r4.model.Location;

public class ProviderLocationTest {
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
    public void testProviderLocationFinal() {
        JsonNode finalDoc = client.newJSONDocumentManager().read("/provider/location/9d4ea135-3756-33ca-aa83-4dc6ee1c3c19.json", new JacksonHandle()).get();
        assertEquals("9d4ea135-3756-33ca-aa83-4dc6ee1c3c19", finalDoc.get("envelope").get("instance").get("Location").get("id").asText());
        assertEquals("1904 PALMYRA RD", finalDoc.get("envelope").get("instance").get("Location").get("address").get(0).get("Address").get("line").get(0).asText());
        assertEquals("31.577669", finalDoc.get("envelope").get("instance").get("Location").get("position").get("Position").get("latitude").asText());
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
