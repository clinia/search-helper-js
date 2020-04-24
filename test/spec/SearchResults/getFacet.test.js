'use strict';

var SearchResults = require('../../../src/SearchResults');

test('getFacetByName should return a given facet be it disjunctive or conjunctive', function() {
  var data = require('../../datasets/SearchParameters/search.dataset')();

  var result = new SearchResults(data.searchParams, data.response.results);

  var servicesFacet = result.getFacetByName('services.en');

  expect(servicesFacet.name).toBe('services.en');
  expect(servicesFacet.data).toEqual({
    'Acupuncture': 2,
    'Blood samples': 2,
    'Blood test': 2,
    'Chiropractic': 3,
    'Fertility': 3,
    'Massage therapy': 12,
    'Nutrition': 4,
    'Osteopathy': 6,
    'Physiotherapy': 115,
    'Physiotherapy Consultation': 4
  });
});
