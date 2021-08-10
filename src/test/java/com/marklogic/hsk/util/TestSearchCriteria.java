package com.marklogic.hsk.util;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TestSearchCriteria {
  public String field;
  public String modifier;
  public List<String> values;

  public TestSearchCriteria(String field, String modifier, List<String> values) {
    this.field = field;
    this.modifier = modifier;
    this.values = values;
  }

  public static JsonNode getSearchTermJson(String field, String modifier, List<String> values) {
    List<TestSearchCriteria> structuredTerm = List.of(new TestSearchCriteria(field, modifier, values));
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode searchTermJson = objectMapper.valueToTree(structuredTerm);

    return searchTermJson;
  }

  public static JsonNode getSearchTermListJson(List<TestSearchCriteria> searchTerms) {
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode searchTermJson = objectMapper.valueToTree(searchTerms);

    return searchTermJson;
  }
}
