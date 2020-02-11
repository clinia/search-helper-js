'use strict';

var searchHelper = require('../../../index');

var fakeClient = {};

test('Conjunctive facet should be declared to be refined', function() {
  var h = searchHelper(fakeClient, '', {});

  expect(h.addFacetRefinement.bind(h, 'undeclaredFacet', 'value')).toThrow();
  expect(h.removeFacetRefinement.bind(h, 'undeclaredFacet', 'value')).toThrow();
});

test('Conjunctive facet should be declared to be excluded', function() {
  var h = searchHelper(fakeClient, '', {});

  expect(h.addFacetExclusion.bind(h, 'undeclaredFacet', 'value')).toThrow();
  expect(h.removeFacetExclusion.bind(h, 'undeclaredFacet', 'value')).toThrow();
});

test('Conjuctive facet should be declared to be refine', function() {
  var h = searchHelper(fakeClient, '', {});

  expect(h.addDisjunctiveFacetRefinement.bind(h, 'undeclaredFacet', 'value')).toThrow();
  expect(h.removeDisjunctiveFacetRefinement.bind(h, 'undeclaredFacet', 'value')).toThrow();
});
