'use strict';

var _ = require('lodash');
var searchHelper = require('../../index');

var emptyClient = {};

test('Adding refinements should add an entry to the refinements property', function() {
  var facetName = 'facet1';
  var facetValue = '42';

  var helper = searchHelper(emptyClient, 'index', {
    facets: [facetName]
  });

  expect(_.isEmpty(helper.state.facetsRefinements)).toBeTruthy();
  helper.addFacetRefinement(facetName, facetValue);
  expect(_.size(helper.state.facetsRefinements)).toBe(1);
  expect(helper.state.facetsRefinements.facet1).toEqual([facetValue]);
  helper.addFacetRefinement(facetName, facetValue);
  expect(_.size(helper.state.facetsRefinements)).toBe(1);
  helper.removeFacetRefinement(facetName, facetValue);
  expect(_.size(helper.state.facetsRefinements)).toBe(1);
  expect(helper.state.facetsRefinements[facetName]).toEqual([]);
});

test('Adding several refinements for a single property should be handled', function() {
  var facetName = 'facet';

  var helper = searchHelper(emptyClient, null, {
    facets: [facetName]
  });

  expect(_.isEmpty(helper.state.facetsRefinements)).toBeTruthy();
  helper.addFacetRefinement(facetName, 'value1');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 1).toBeTruthy();
  helper.addFacetRefinement(facetName, 'value2');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 2).toBeTruthy();
  helper.addFacetRefinement(facetName, 'value1');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 2).toBeTruthy();
});

test('Toggling several refinements for a single property should be handled', function() {
  var facetName = 'facet';

  var helper = searchHelper(emptyClient, null, {
    facets: [facetName]
  });

  expect(_.isEmpty(helper.state.facetsRefinements)).toBeTruthy();
  helper.toggleFacetRefinement(facetName, 'value1');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 1).toBeTruthy();
  helper.toggleFacetRefinement(facetName, 'value2');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 2).toBeTruthy();
  helper.toggleFacetRefinement(facetName, 'value1');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 1).toBeTruthy();
  expect(helper.state.facetsRefinements[facetName]).toEqual(['value2']);
});

test('Using toggleRefine on a non specified facet should throw an exception', function() {
  var helper = searchHelper(emptyClient, null, {});

  expect(_.partial(helper.toggleFacetRefinement, 'unknown', 'value')).toThrow();
});

test('Removing several refinements for a single attribute should be handled', function() {
  var facetName = 'facet';

  var helper = searchHelper(emptyClient, null, {
    facets: [facetName]
  });

  expect(_.isEmpty(helper.state.facetsRefinements)).toBeTruthy();
  helper.addFacetRefinement(facetName, 'value1');
  helper.addFacetRefinement(facetName, 'value2');
  helper.addFacetRefinement(facetName, 'value3');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 3).toBeTruthy();
  helper.removeFacetRefinement(facetName, 'value2');
  expect(_.size(helper.state.facetsRefinements[facetName]) === 2).toBeTruthy();
  expect(helper.state.facetsRefinements[facetName]).toEqual(['value1', 'value3']);
});

test('isDisjunctiveRefined', function() {
  var facet = 'MyFacet';

  var helper = searchHelper(emptyClient, null, {
    disjunctiveFacets: [facet]
  });

  var value = 'MyValue';

  expect(helper.hasRefinements(facet, value)).toBe(false);

  helper.addDisjunctiveFacetRefinement(facet, value);
  expect(helper.hasRefinements(facet, value)).toBe(true);

  helper.removeDisjunctiveFacetRefinement(facet, value);
  expect(helper.hasRefinements(facet, value)).toBe(false);
});

test('hasRefinements(facet) should return true if the facet is refined.', function() {
  var helper = searchHelper(emptyClient, null, {
    facets: ['facet1']
  });

  expect(helper.hasRefinements('facet1')).toBe(false);

  helper.addFacetRefinement('facet1', 'boom');

  expect(helper.hasRefinements('facet1')).toBe(true);

  // in complete honesty we should be able to detect numeric facets but we can't
  // t.throws(helper.hasRefinements.bind(helper, 'notAFacet'), 'not a facet');
  expect(_.bind(helper.hasRefinements, null)).toThrow();
});

test('getRefinements should return all the refinements for a given facet', function() {
  var helper = searchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2', 'sales']
  });

  helper.addFacetRefinement('facet1', 'val1')
    .addFacetRefinement('facet1', 'val2')
    .addFacetExclusion('facet1', 'val-1')
    .toggleFacetRefinement('facet1', 'val3');

  helper.addDisjunctiveFacetRefinement('facet2', 'val4')
    .addDisjunctiveFacetRefinement('facet2', 'val5')
    .toggleFacetRefinement('facet2', 'val6');

  expect(helper.getRefinements('facet1')).toEqual([
    {value: 'val1', type: 'conjunctive'},
    {value: 'val2', type: 'conjunctive'},
    {value: 'val3', type: 'conjunctive'},
    {value: 'val-1', type: 'exclude'}
  ]);

  expect(helper.getRefinements('facet2')).toEqual([
    {value: 'val4', type: 'disjunctive'},
    {value: 'val5', type: 'disjunctive'},
    {value: 'val6', type: 'disjunctive'}
  ]);
});

test('getRefinements should return an empty array if the facet has no refinement', function() {
  var helper = searchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  expect(helper.getRefinements('facet1')).toEqual([]);
  expect(helper.getRefinements('facet2')).toEqual([]);
});

test('[Conjunctive] Facets should be resilient to user attempt to use numbers', function() {
  var helper = searchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addFacetRefinement('facet1', 42);
  expect(helper.hasRefinements('facet1', 42)).toBe(true);
  expect(helper.hasRefinements('facet1', '42')).toBe(true);

  var stateWithFacet1and42 = helper.state;

  helper.removeFacetRefinement('facet1', '42');
  expect(helper.hasRefinements('facet1', '42')).toBe(false);

  helper.setState(stateWithFacet1and42);
  helper.removeFacetRefinement('facet1', 42);
  expect(helper.hasRefinements('facet1', 42)).toBe(false);
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function() {
  var helper = searchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addFacetExclusion('facet1', 42);
  expect(helper.isExcluded('facet1', 42)).toBe(true);
  expect(helper.isExcluded('facet1', '42')).toBe(true);

  var stateWithFacet1Without42 = helper.state;

  helper.removeFacetExclusion('facet1', '42');
  expect(helper.isExcluded('facet1', '42')).toBe(false);

  helper.setState(stateWithFacet1Without42);
  helper.removeFacetExclusion('facet1', 42);
  expect(helper.isExcluded('facet1', 42)).toBe(false);
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function() {
  var helper = searchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addDisjunctiveFacetRefinement('facet2', 42);
  expect(helper.hasRefinements('facet2', 42)).toBe(true);
  expect(helper.hasRefinements('facet2', '42')).toBe(true);

  var stateWithFacet2and42 = helper.state;

  helper.removeDisjunctiveFacetRefinement('facet2', '42');
  expect(helper.hasRefinements('facet2', '42')).toBe(false);
  helper.setState(stateWithFacet2and42);

  helper.removeDisjunctiveFacetRefinement('facet2', 42);
  expect(helper.hasRefinements('facet2', 42)).toBe(false);
});
