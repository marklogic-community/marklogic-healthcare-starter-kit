package com.marklogic.hsk.matching;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Performs adhoc matching based on the parameters passed against the mastered data existing the the database
 */
public interface AdhocMatchingService {
    /**
     * Creates a AdhocMatchingService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static AdhocMatchingService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a AdhocMatchingService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * The service declaration uses a custom implementation of the same service instead
     * of the default implementation of the service by specifying an endpoint directory
     * in the modules database with the implementation. A service.json file with the
     * declaration can be read with FileHandle or a string serialization of the JSON
     * declaration with StringHandle.
     *
     * @param db	provides a client for communicating with the database server
     * @param serviceDeclaration	substitutes a custom implementation of the service
     * @return	an object for executing database operations
     */
    static AdhocMatchingService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class AdhocMatchingServiceImpl implements AdhocMatchingService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_patientMatch;

            private AdhocMatchingServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-services/matching/", servDecl);

                this.req_patientMatch = this.baseProxy.request(
                    "patientMatch.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode patientMatch(String ssn, String firstName, String lastName, String dob, String gender) {
                return patientMatch(
                    this.req_patientMatch.on(this.dbClient), ssn, firstName, lastName, dob, gender
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode patientMatch(BaseProxy.DBFunctionRequest request, String ssn, String firstName, String lastName, String dob, String gender) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("ssn", true, BaseProxy.StringType.fromString(ssn)),
                          BaseProxy.atomicParam("firstName", true, BaseProxy.StringType.fromString(firstName)),
                          BaseProxy.atomicParam("lastName", true, BaseProxy.StringType.fromString(lastName)),
                          BaseProxy.atomicParam("dob", true, BaseProxy.StringType.fromString(dob)),
                          BaseProxy.atomicParam("gender", true, BaseProxy.StringType.fromString(gender))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new AdhocMatchingServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the patientMatch operation on the database server
   *
   * @param ssn	
   * @param firstName	
   * @param lastName	
   * @param dob	
   * @param gender	
   * @return	
   */
    com.fasterxml.jackson.databind.JsonNode patientMatch(String ssn, String firstName, String lastName, String dob, String gender);

}
