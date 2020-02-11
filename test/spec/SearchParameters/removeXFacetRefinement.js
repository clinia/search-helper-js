'use strict';

var SearchParameters = require('../../../src/SearchParameters');

describe('removeDisjunctiveFacetRefinement', function() {
  test('removeDisjunctiveFacetRefinement(attribute)', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
      disjunctiveFacetsRefinements: {
        attribute: ['value']
      }
    });

    expect(state.removeDisjunctiveFacetRefinement('attribute')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attribute'],
        disjunctiveFacetsRefinements: {
          attribute: []
        }
      })
    );
  });

  test('removeDisjunctiveFacetRefinement(attribute, value)', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
      disjunctiveFacetsRefinements: {
        attribute: ['value', 'value2']
      }
    });

    expect(state.removeDisjunctiveFacetRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attribute'],
        disjunctiveFacetsRefinements: {
          attribute: ['value2']
        }
      })
    );
  });

  test('removeDisjunctiveFacetRefinement(attribute, lastValue)', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
      disjunctiveFacetsRefinements: {
        attribute: ['value']
      }
    });

    expect(state.removeDisjunctiveFacetRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attribute'],
        disjunctiveFacetsRefinements: {
          attribute: []
        }
      })
    );
  });
});

describe('removeFacetRefinement', function() {
  test('removeFacetRefinement(attribute)', function() {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsRefinements: {
        attribute: ['value']
      }
    });

    expect(state.removeFacetRefinement('attribute')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsRefinements: {
          attribute: []
        }
      })
    );
  });

  test('removeFacetRefinement(attribute, value)', function() {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsRefinements: {
        attribute: ['value', 'value2']
      }
    });

    expect(state.removeFacetRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsRefinements: {
          attribute: ['value2']
        }
      })
    );
  });

  test('removeFacetRefinement(attribute, lastValue)', function() {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsRefinements: {
        attribute: ['value']
      }
    });

    expect(state.removeFacetRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsRefinements: {
          attribute: []
        }
      })
    );
  });
});

describe('removeExcludeRefinement', function() {
  test('removeExcludeRefinement(attribute)', function() {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsExcludes: {
        attribute: ['value']
      }
    });

    expect(state.removeExcludeRefinement('attribute')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsExcludes: {
          attribute: []
        }
      })
    );
  });

  test('removeExcludeRefinement(attribute, value)', function() {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsExcludes: {
        attribute: ['value', 'value2']
      }
    });

    expect(state.removeExcludeRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsExcludes: {
          attribute: ['value2']
        }
      })
    );
  });

  test('removeExcludeRefinement(attribute, lastValue)', function() {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsExcludes: {
        attribute: ['value']
      }
    });

    expect(state.removeExcludeRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsExcludes: {
          attribute: []
        }
      })
    );
  });
});
