'use strict';

var SearchResults = require('../../../src/SearchResults');

test('getFacetByName should return a given facet be it disjunctive or conjunctive', function() {
  var data = require('../../datasets/SearchParameters/search.dataset')();

  var result = new SearchResults(data.searchParams, data.response.results);

  var typeFacet = result.getFacetByName('type');

  expect(typeFacet.name).toBe('type');
  expect(typeFacet.data).toEqual({
    'Clsc': 1,
    'Pharmacy': 3
  });
});
