package com.marklogic.hsk.patient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;

import com.fasterxml.jackson.databind.JsonNode;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;

import com.marklogic.hsk.matching.AdhocMatchingService;

public class AdhocPatientMatchTest {

    private static final String host = "localhost";
    private static final int port = 8011;
    private static final String userName = "developer";
    private static final String password = "demo";

    
    private static final String firstName = "Breann";
    private static final String lastName = "Ullrich";
    private static final String dob = "1944-03-05";
    private static final String gender = "female";
    private static final String ssn = "999-18-9966";

    private static DatabaseClient client = null;

    @BeforeAll
    static void setup() {
        client = DatabaseClientFactory.newClient(host, port, new DatabaseClientFactory.DigestAuthContext(userName, password));
    }

    @Test
    void ssnMatchesWithNotify() {
        //setup

        //act
        JsonNode result = AdhocMatchingService.on(client).patientMatch(ssn,"","","","");

        JsonNode notifyMatches = result.get("notify");
        System.err.println(notifyMatches);

        //assert
        assertEquals(2, notifyMatches.size());

    }

    @Test
    void ssnAndFirstNameMatchesWithNotify() {
        //setup

        //act
        JsonNode result = AdhocMatchingService.on(client).patientMatch(ssn,firstName,"","","");

        JsonNode notifyMatches = result.get("notify");
        System.err.println(notifyMatches);

        //assert
        assertEquals(2, notifyMatches.size());

    }

    @Test
    void ssnFirstNameLastNameMatchesWithMerge() {
        //setup

        //act
        JsonNode result = AdhocMatchingService.on(client).patientMatch(ssn,firstName,lastName,"","");

        JsonNode notifyMatches = result.get("merge");
        System.err.println(notifyMatches);

        //assert
        assertEquals(2, notifyMatches.size());

    }
}
