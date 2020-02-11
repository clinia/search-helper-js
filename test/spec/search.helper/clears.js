'use strict';

var searchHelper = require('../../../index');
var forEach = require('lodash/forEach');
var isUndefined = require('lodash/isUndefined');

function fixture() {
  var helper = searchHelper({}, 'Index', {
    facets: ['facet1', 'facet2', 'both_facet', 'excluded1', 'excluded2'],
    disjunctiveFacets: ['disjunctiveFacet1', 'disjunctiveFacet2', 'both_facet']
  });

  return helper.toggleFacetRefinement('facet1', '0')
    .toggleFacetRefinement('facet2', '0')
    .toggleFacetRefinement('disjunctiveFacet1', '0')
    .toggleFacetRefinement('disjunctiveFacet2', '0')
    .toggleFacetExclusion('excluded1', '0')
    .toggleFacetExclusion('excluded2', '0');
}

test('Check that the state objects match how we test them', function() {
  var helper = fixture();

  expect(helper.state.facetsRefinements).toEqual({
    facet1: ['0'],
    facet2: ['0']
  });
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({
    disjunctiveFacet1: ['0'],
    disjunctiveFacet2: ['0']
  });
  expect(helper.state.facetsExcludes).toEqual({
    excluded1: ['0'],
    excluded2: ['0']
  });
});

test('Clear with a name should work on every type and not remove others than targetted name', function() {
  var helper = fixture();

  helper.clearRefinements('facet1');
  expect(helper.state.facetsRefinements).toEqual({facet2: ['0']});

  helper.clearRefinements('disjunctiveFacet1');
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({disjunctiveFacet2: ['0']});

  helper.clearRefinements('excluded1');
  expect(helper.state.facetsExcludes).toEqual({excluded2: ['0']});
});

test('Clearing the same field from multiple elements should remove it everywhere', function() {
  var helper = fixture();

  helper.toggleFacetExclusion('facet1', 'value');

  expect(helper.state.facetsRefinements.facet1).toEqual(['0']);
  expect(helper.state.facetsExcludes.facet1).toEqual(['value']);

  helper.clearRefinements('facet1');
  expect(isUndefined(helper.state.facetsRefinements.facet1)).toBeTruthy();
  expect(isUndefined(helper.state.facetsExcludes.facet1)).toBeTruthy();
});

test('Clear with a function: neutral predicate', function() {
  var helper = fixture();
  var state0 = helper.state;

  helper.clearRefinements(function() {
    return false;
  });

  expect(helper.state.numericRefinements).toEqual(state0.numericRefinements);
  expect(helper.state.facetsRefinements).toEqual(state0.facetsRefinements);
  expect(helper.state.facetsExcludes).toEqual(state0.facetsExcludes);
  expect(helper.state.disjunctiveFacetsRefinements).toEqual(state0.disjunctiveFacetsRefinements);
});

test('Clear with a function: remove all predicate', function() {
  var helper = fixture();

  helper.clearRefinements(function() {
    return true;
  });

  Object.keys(helper.state.facetsRefinements).forEach(function(facet) {
    expect(helper.state.facetsRefinements[facet]).toHaveLength(0);
  });
  Object.keys(helper.state.facetsExcludes).forEach(function(facet) {
    expect(helper.state.facetsExcludes[facet]).toHaveLength(0);
  });
  Object.keys(helper.state.disjunctiveFacetsRefinements).forEach(function(facet) {
    expect(helper.state.disjunctiveFacetsRefinements[facet]).toHaveLength(0);
  });
});

test('Clear with a function: filtering', function() {
  var helper = fixture();

  var checkType = {
    disjunctiveFacet: false,
    conjunctiveFacet: false,
    exclude: false
  };

  helper.clearRefinements(function(value, key, type) {
    checkType[type] = true;

    return key.indexOf('1') !== -1;
  });

  expect(Object.keys(checkType).length).toBe(3);
  forEach(checkType, function(typeTest) {
    expect(typeTest).toBeTruthy();
  });

  expect(helper.state.facetsRefinements).toEqual({facet1: [], facet2: ['0']});
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({
    disjunctiveFacet1: [],
    disjunctiveFacet2: ['0']
  });
  expect(helper.state.facetsExcludes).toEqual({
    excluded1: [],
    excluded2: ['0']
  });
});

test('Clearing twice the same attribute should be not problem', function() {
  var helper = fixture();

  expect(helper.state.facetsRefinements.facet1).toEqual(['0']);
  helper.clearRefinements('facet1');
  expect(isUndefined(helper.state.facetsRefinements.facet1)).toBeTruthy();
  expect(function() {
    helper.clearRefinements('facet1');
  }).not.toThrow();

  expect(helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1).toEqual(['0']);
  helper.clearRefinements('disjunctiveFacet1');
  expect(isUndefined(helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1)).toBeTruthy();
  expect(function() {
    helper.clearRefinements('disjunctiveFacet1');
  }).not.toThrow();

  expect(helper.state.facetsExcludes.excluded1).toEqual(['0']);
  helper.clearRefinements('excluded1');
  expect(isUndefined(helper.state.facetsExcludes.excluded1)).toBeTruthy();
  expect(function() {
    helper.clearRefinements('excluded1');
  }).not.toThrow();
});

test('Clearing without parameters should clear everything', function() {
  var helper = fixture();

  helper.clearRefinements();

  expect(helper.state.facetsRefinements).toEqual({});
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({});
});

test('Clearing with no effect should not update the state', function() {
  var helper = fixture();
  // Reset the state
  helper.clearRefinements();
  var emptyState = helper.state;
  // This operation should not update the reference to the state
  helper.clearRefinements();

  expect(helper.state.facetsRefinements).toBe(emptyState.facetsRefinements);
  expect(helper.state.disjunctiveFacetsRefinements).toBe(emptyState.disjunctiveFacetsRefinements);

  expect(helper.state).toBe(emptyState);
});

test('Clearing with no effect should not update the state, if used with an unknown attribute', function() {
  var helper = fixture();
  var initialState = helper.state;
  // This operation should not update the reference to the state
  helper.clearRefinements('unknown');

  expect(helper.state.facetsRefinements).toEqual(initialState.facetsRefinements);
  expect(helper.state.disjunctiveFacetsRefinements).toEqual(initialState.disjunctiveFacetsRefinements);

  expect(helper.state).toEqual(initialState);
});
