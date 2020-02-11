'use strict';

var requestBuilder = require('../../src/requestBuilder.js');
var SearchParameters = require('../../src/SearchParameters');
var getQueries = requestBuilder._getQueries;

test('does only a single query if refinements are empty', function() {
  var searchParams = new SearchParameters({
    disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
    disjunctiveFacetsRefinements: {
      test_disjunctive: []
    }
  });

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries).toHaveLength(1);
});
