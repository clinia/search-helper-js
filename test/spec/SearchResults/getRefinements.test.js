'use strict';

var filter = require('lodash/filter');
var forEach = require('lodash/forEach');
var find = require('lodash/find');

var SearchResults = require('../../../src/SearchResults');
var SearchParameters = require('../../../src/SearchParameters');

test('getRefinements(facetName) returns an empty array when there is no refinements set', function() {
  var data = require('./getRefinements/noFilters.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();

  expect(refinements).toEqual([]);
});

function hasSameNames(l1, l2) {
  var res = true;
  forEach(l1, function(e) {
    var l2MatchingNameElement = find(l2, {name: e.name});
    if (!l2MatchingNameElement) res = false;
  });
  return res;
}

test('getRefinements(facetName) returns a refinement(facet) when a facet refinement is set', function() {
  var data = require('./getRefinements/conjunctive-brand-apple.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('brand');
  var refinedFacetValues = filter(facetValues, function(f) {
    return f.isRefined === true;
  });

  var expected = [{
    propertyName: 'brand', count: 386, exhaustive: true, name: 'Apple', type: 'facet'
  }];

  expect(refinements).toEqual(expected);
  expect(refinements.length).toBe(refinedFacetValues.length);
  expect(hasSameNames(refinements, refinedFacetValues)).toBeTruthy();
});

test('getRefinements(facetName) returns a refinement(exclude) when a facet exclusion is set', function() {
  var data = require('./getRefinements/exclude-apple.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('brand');
  var refinedFacetValues = filter(facetValues, function(f) {
    return f.isExcluded === true;
  });

  var expected = [{
    propertyName: 'brand', count: 0, exhaustive: true, name: 'Apple', type: 'exclude'
  }];

  expect(refinements).toEqual(expected);
  expect(refinements.length).toBe(refinedFacetValues.length);
  expect(hasSameNames(refinements, refinedFacetValues)).toBeTruthy();
});

test(
  'getRefinements(facetName) returns a refinement(disjunctive) when a disjunctive refinement is set',
  function() {
    var data = require('./getRefinements/disjunctive-type-trendcase.json');
    var searchParams = new SearchParameters(data.state);
    var result = new SearchResults(searchParams, data.content.results);

    var refinements = result.getRefinements();
    var facetValues = result.getFacetValues('type');
    var refinedFacetValues = filter(facetValues, function(f) {
      return f.isRefined === true;
    });

    var expected = [{
      propertyName: 'type', count: 537, exhaustive: true, name: 'Trend cases', type: 'disjunctive'
    }];

    expect(refinements).toEqual(expected);
    expect(refinements.length).toBe(refinedFacetValues.length);
    expect(hasSameNames(refinements, refinedFacetValues)).toBeTruthy();
  }
);
