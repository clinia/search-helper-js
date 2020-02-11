'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('addFacet should add a facet to the facets list', function() {
  var state = SearchParameters.make({}).addFacet('facet');

  expect(state.facets).toEqual(['facet']);
});

test('removeFacet should remove a facet from the facets list', function() {
  var state = SearchParameters.make({}).addFacet('facet').removeFacet('facet');

  expect(state.facets).toEqual([]);

  state = SearchParameters.make({})
    .addFacet('facet')
    .addFacetRefinement('facet', 'value')
    .removeFacet('facet');

  expect(state.facetsRefinements).toEqual({});
});

test('addDisjunctiveFacet should add a facet to the disjunctiveFacets list', function() {
  var state = SearchParameters.make({}).addDisjunctiveFacet('facet');

  expect(state.disjunctiveFacets).toEqual(['facet']);
});

test('removeDisjunctiveFacet should remove a facet from the disjunctiveFacets list', function() {
  var state = SearchParameters.make({})
    .addDisjunctiveFacet('facet')
    .removeDisjunctiveFacet('facet');

  expect(state.disjunctiveFacets).toEqual([]);

  state = SearchParameters.make({})
    .addDisjunctiveFacet('facet')
    .addDisjunctiveFacetRefinement('facet', 'value')
    .removeDisjunctiveFacet('facet');

  expect(state.disjunctiveFacetsRefinements).toEqual({});
});
