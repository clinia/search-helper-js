'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('[No changes] setPerPage', function() {
  var state = SearchParameters.make({
    perPage: 2
  });

  expect(state.setPerPage(2)).toBe(state);
});

test('[No changes] setPage', function() {
  var state = SearchParameters.make({
    page: 2
  });

  expect(state.setPage(2)).toBe(state);
});

test('[No changes] setQuery', function() {
  var state = SearchParameters.make({
    query: 'query'
  });

  expect(state.setQuery('query')).toBe(state);
});

test('[No changes] addFacet', function() {
  var state = SearchParameters.make({}).addFacet('facet');

  expect(state.addFacet('facet')).toBe(state);
});

test('[No changes] removeFacet', function() {
  var state = SearchParameters.make({});

  expect(state.removeFacet('facet')).toBe(state);
});

test('[No changes] addDisjunctiveFacet', function() {
  var state = SearchParameters.make({}).addDisjunctiveFacet('facet');

  expect(state.addDisjunctiveFacet('facet')).toBe(state);
});

test('[No changes] removeDisjunctiveFacet', function() {
  var state = SearchParameters.make({});

  expect(state.removeDisjunctiveFacet('facet')).toBe(state);
});

test('[No changes] addDisjunctiveFacetRefinement', function() {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  }).addDisjunctiveFacetRefinement('facet', 'value');

  expect(state.addDisjunctiveFacetRefinement('facet', 'value')).toBe(state);
});

test('[No changes] removeDisjunctiveFacetRefinement', function() {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  });

  expect(state.removeDisjunctiveFacetRefinement('facet', 'value')).toBe(state);
});

test('[No changes] addFacetRefinement', function() {
  var state = SearchParameters.make({
    facets: ['facet']
  }).addFacetRefinement('facet', 'value');

  expect(state.addFacetRefinement('facet', 'value')).toBe(state);
});

test('[No changes] removeDisjunctiveFacetRefinement', function() {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  });

  expect(state.removeDisjunctiveFacetRefinement('facet', 'value')).toBe(state);
});

test('[No changes] setQueryParameter', function() {
  var state = SearchParameters.make({
    queryType: 'prefix_last'
  });

  expect(state.setQueryParameter('queryType', 'prefix_last')).toBe(state);
});
