'use strict';

const sem = require('/MarkLogic/semantics.xqy');

const skosCoreNotation = sem.iri('http://www.w3.org/2004/02/skos/core#notation');

/**
 * Functions for use in MLCP Transforms on SNOMED-CT Ontology data.
 *
 * The following will need to be added to mlcp import arguments in order to make use of these functions:
 *
 * -transform_module /lib/transformers/ontologyUtils.sjs -transform_function addSkosCoreNotationsForDocument -transform_param <graphName>
 */
const utils = {
	/**
	 * Generate a SKOS Core Notation triple with the given subject IRI
	 *
	 * @param  {sem.iri}    iri The iri
	 *
	 * @return {sem.triple}
	 */
	generateSkosCoreNotationForIri(iri) {
		return sem.triple(
			iri,
			skosCoreNotation,
			sem.typedLiteral(
				iri
					.toString() // Ensure string prototype functions are available
					.split('/')
					.pop(),
				sem.iri('http://www.w3.org/2001/XMLSchema#string'),
			),
		);
	},

	/**
	 * Generate and insert SKOS Core Notation triples for any ?subject rdfs:subClassOf ?object triples
	 * in the given document
	 *
	 * @param  {Document} doc   The document being inserted into the database
	 * @param  {string}   graph The graph to insert into
	 */
	generateSkosCoreNotationsForDocument(doc, graph) {
		const triples = sem.rdfParse(doc);

		const result = [];

		for (const triple of triples) {
			const subject = sem.tripleSubject(triple);

			// Only add a triple if it will be reachable in a standard ontology search and has a non-blank
			// subject
			if (
				sem.triplePredicate(triple).toString() === 'http://www.w3.org/2000/01/rdf-schema#subClassOf' &&
				sem.isIRI(subject)
			) {
				result.push(utils.generateSkosCoreNotationForIri(subject));
			}
		}

		if (result.length) {
			const file = sem.graphInsert(graph, result);
			xdmp.trace('ontology-standardization', `Inserted ${result.length} triples for skos core notations into "${file}"`);
		}
	},

	/**
	 * Add SKOS Core Notation triples for unique codes in the given document
	 *
	 * @param  {{ uri: string, value: Document }} content The document being inserted into the database
	 * @param  {{ transform_param: any }}         context The context for document insertion
	 *
	 * @return {{ uri: string, value: Document }}
	 */
	addSkosCoreNotationsForDocument(content, context) {
		const graph = context.transform_param;

		utils.generateSkosCoreNotationsForDocument(content.value, graph);

		// Without this line inserted document is not put into a graph when MLCP transforms are applied
		context.collections = [graph];

		return content;
	},
};

module.exports = utils;
