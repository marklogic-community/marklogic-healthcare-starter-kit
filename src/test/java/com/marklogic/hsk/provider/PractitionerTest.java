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
import org.hl7.fhir.r4.model.Practitioner;

public class PractitionerTest {
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

    // Test exemplifying search to retrieve the Practitioner instead of reading deterministic persistence URIs based on their id.
    @Test
    public void testPractitionerFinal() {
        String docUri = null;
        QueryManager qm = client.newQueryManager();
        StructuredQueryBuilder sqb = new StructuredQueryBuilder();
        StructuredQueryDefinition sqd = sqb.and(sqb.term("37c87df4-bd83-3244-ba93-982399145ce4"), sqb.directory(false, "/provider/practitioner/"), sqb.collection("PractitionerMapping"));
        SearchHandle results = qm.search(sqd, new SearchHandle());
        MatchDocumentSummary[] summaries = results.getMatchResults();
        for (MatchDocumentSummary summary : summaries) {
            docUri = summary.getUri();
        }
        JsonNode finalDoc = client.newJSONDocumentManager().read(docUri, new JacksonHandle()).get();
        assertEquals("37c87df4-bd83-3244-ba93-982399145ce4", finalDoc.get("envelope").get("instance").get("Practitioner").get("id").asText());
        assertEquals("Andrea", finalDoc.get("envelope").get("instance").get("Practitioner").get("name").get(0).get("HumanName").get("given").get(0).asText());
        assertEquals("female", finalDoc.get("envelope").get("instance").get("Practitioner").get("gender").asText());
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
