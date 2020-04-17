'use strict';

var searchHelper = require('../../../index');

var bind = require('lodash/bind');

var fakeClient = {};

test('setChange should change the current page', function() {
  var helper = searchHelper(fakeClient, null, null);

  expect(helper.getPage()).toBeUndefined();

  helper.setPage(3);

  expect(helper.getPage()).toBe(3);
});

test('nextPage should increment the page by one', function() {
  var helper = searchHelper(fakeClient, null, null);

  expect(helper.getPage()).toBeUndefined();

  helper.nextPage();
  helper.nextPage();
  helper.nextPage();

  expect(helper.getPage()).toBe(3);
});

test('previousPage should decrement the current page by one', function() {
  var helper = searchHelper(fakeClient, null, null);

  expect(helper.getPage()).toBeUndefined();

  helper.setPage(3);

  expect(helper.getPage()).toBe(3);

  helper.previousPage();

  expect(helper.getPage()).toBe(2);
});

test('previousPage should throw an error without a current page', function() {
  var helper = searchHelper(fakeClient, null, null);

  expect(bind(helper.previousPage, helper)).toThrow('Page requested below 0.');
});

test('pages should be reset if the mutation might change the number of pages', function() {
  var helper = searchHelper(fakeClient, '', {
    facets: ['facet1', 'f2'],
    disjunctiveFacets: ['f1']
  });

  [
    ['clearRefinements', bind(helper.clearRefinements, helper)],
    ['setQuery', bind(helper.setQuery, helper, 'query')],

    ['addNumericRefinement', bind(helper.addNumericRefinement, helper, 'facet', '>', '2')],
    ['removeNumericRefinement', bind(helper.removeNumericRefinement, helper, 'facet', '>')],

    ['addFacetExclusion', bind(helper.addFacetExclusion, helper, 'facet1', 'val2')],
    ['removeFacetExclusion', bind(helper.removeFacetExclusion, helper, 'facet1', 'val2')],

    ['addFacetRefinement', bind(helper.addFacetRefinement, helper, 'f2', 'val')],
    ['removeFacetRefinement', bind(helper.removeFacetRefinement, helper, 'f2', 'val')],

    ['addDisjunctiveFacetRefinement', bind(helper.addDisjunctiveFacetRefinement, helper, 'f1', 'val')],
    ['removeDisjunctiveFacetRefinement', bind(helper.removeDisjunctiveFacetRefinement, helper, 'f1', 'val')],

    ['toggleFacetRefinement', bind(helper.toggleFacetRefinement, helper, 'f1', 'v1')],
    ['toggleFacetExclusion', bind(helper.toggleFacetExclusion, helper, 'facet1', '55')]
  ].forEach(function(definition) {
    var fn = definition[1];

    helper.setPage(10);

    expect(helper.getPage()).toBe(10);

    fn();

    expect(helper.getPage()).toBe(0);
  });
});
