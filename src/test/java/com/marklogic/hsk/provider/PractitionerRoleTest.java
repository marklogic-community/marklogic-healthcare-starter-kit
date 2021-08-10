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
import org.hl7.fhir.r4.model.PractitionerRole;

public class PractitionerRoleTest {
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
    public void testProviderRoleFinal() {
        JsonNode finalDoc = client.newJSONDocumentManager().read("/provider/50e1b18e-f201-3669-8b49-5606a9b5b776.json", new JacksonHandle()).get();
        assertEquals("50e1b18e-f201-3669-8b49-5606a9b5b776", finalDoc.get("envelope").get("instance").get("PractitionerRole").get("id").asText());
        assertEquals("Organization/ac762f62-d91b-369d-946b-017bcae4132c", finalDoc.get("envelope").get("instance").get("PractitionerRole").get("organization").get("Reference").get("reference").asText());
        assertEquals("doctor", finalDoc.get("envelope").get("instance").get("PractitionerRole").get("code__code").get(0).asText());
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
