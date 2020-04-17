'use strict';

var SearchParameters = require('../../../src/SearchParameters');

describe('removeDisjunctiveFacet', function() {
  test('removeDisjunctiveFacet(property), multiple refinements', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['property', 'other'],
      disjunctiveFacetsRefinements: {
        property: ['value'],
        other: ['value']
      }
    });

    expect(state.removeDisjunctiveFacet('property')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['other'],
        disjunctiveFacetsRefinements: {
          other: ['value']
        }
      })
    );
  });

  test('removeDisjunctiveFacet(property), empty refinements', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['property'],
      disjunctiveFacetsRefinements: {
        property: []
      }
    });

    expect(state.removeDisjunctiveFacet('property')).toEqual(
      new SearchParameters()
    );
  });

  test('removeDisjunctiveFacet(property), no refinements', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['property']
    });

    expect(state.removeDisjunctiveFacet('property')).toEqual(
      new SearchParameters()
    );
  });

  test('removeDisjunctiveFacet(property), empty', function() {
    var state = new SearchParameters();

    expect(state.removeDisjunctiveFacet('property')).toEqual(
      new SearchParameters()
    );
  });
});

describe('removeFacet', function() {
  test('removeFacet(property), multiple refinements', function() {
    var state = new SearchParameters({
      facets: ['property', 'other'],
      facetsRefinements: {
        property: ['value'],
        other: ['value']
      }
    });

    expect(state.removeFacet('property')).toEqual(
      new SearchParameters({
        facets: ['other'],
        facetsRefinements: {
          other: ['value']
        }
      })
    );
  });

  test('removeFacet(property), empty refinements', function() {
    var state = new SearchParameters({
      facets: ['property'],
      facetsRefinements: {
        property: []
      }
    });

    expect(state.removeFacet('property')).toEqual(
      new SearchParameters()
    );
  });

  test('removeFacet(property), no refinements', function() {
    var state = new SearchParameters({
      facets: ['property']
    });

    expect(state.removeFacet('property')).toEqual(
      new SearchParameters()
    );
  });

  test('removeFacet(property), empty', function() {
    var state = new SearchParameters();

    expect(state.removeFacet('property')).toEqual(
      new SearchParameters()
    );
  });
});
