'use strict';

declareUpdate();
const op = require('/MarkLogic/optic');
const sem = require('/MarkLogic/semantics.xqy');

const skosCoreNotation = sem.iri('http://www.w3.org/2004/02/skos/core#notation');

// This file is intended to serve as an example of a trigger module, and takes roughly 45 seconds to run on the SNOMED-CT ontology we have
sem.graphInsert('snomed-ct-ontology', [
  ...op
    .fromSPARQL(`
      select distinct ?iri where {
        ?iri <http://www.w3.org/2000/01/rdf-schema#subClassOf>* <http://snomed.info/id/138875005> .
      }
    `)
    .map(result => sem.triple(sem.iri(result.iri), skosCoreNotation, sem.typedLiteral(result.iri.toString().split('/').pop(), sem.iri('http://www.w3.org/2001/XMLSchema#string'))))
    .result()
]);
