'use strict';

var searchHelper = require('../../../index');

var _ = require('lodash');

var fakeClient = {};

test('undefined attribute', function() {
  var helper = searchHelper(fakeClient, 'index');
  expect(_.partial(helper.hasRefinements, 'unknown')).toThrow(Error);
});

describe('facet', function() {
  test('with refinement', function() {
    var helper = searchHelper(fakeClient, 'index', {
      facets: ['color']
    });

    helper.toggleFacetRefinement('color', 'red');

    expect(helper.hasRefinements('color')).toBe(true);
  });

  test('without refinement', function() {
    var helper = searchHelper(fakeClient, 'index', {
      facets: ['color']
    });

    expect(helper.hasRefinements('color')).toBe(false);
  });
});

describe('disjunctiveFacet', function() {
  test('with refinement', function() {
    var helper = searchHelper(fakeClient, 'index', {
      disjunctiveFacets: ['author']
    });

    helper.toggleFacetRefinement('author', 'John Spartan');

    expect(helper.hasRefinements('author')).toBe(true);
  });

  test('without refinement', function() {
    var helper = searchHelper(fakeClient, 'index', {
      disjunctiveFacets: ['author']
    });

    expect(helper.hasRefinements('author')).toBe(false);
  });
});
