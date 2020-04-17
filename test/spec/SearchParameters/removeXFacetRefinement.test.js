'use strict';

var SearchParameters = require('../../../src/SearchParameters');

describe('removeDisjunctiveFacetRefinement', function() {
  test('removeDisjunctiveFacetRefinement(property)', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['property'],
      disjunctiveFacetsRefinements: {
        property: ['value']
      }
    });

    expect(state.removeDisjunctiveFacetRefinement('property')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['property'],
        disjunctiveFacetsRefinements: {
          property: []
        }
      })
    );
  });

  test('removeDisjunctiveFacetRefinement(property, value)', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['property'],
      disjunctiveFacetsRefinements: {
        property: ['value', 'value2']
      }
    });

    expect(state.removeDisjunctiveFacetRefinement('property', 'value')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['property'],
        disjunctiveFacetsRefinements: {
          property: ['value2']
        }
      })
    );
  });

  test('removeDisjunctiveFacetRefinement(property, lastValue)', function() {
    var state = new SearchParameters({
      disjunctiveFacets: ['property'],
      disjunctiveFacetsRefinements: {
        property: ['value']
      }
    });

    expect(state.removeDisjunctiveFacetRefinement('property', 'value')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['property'],
        disjunctiveFacetsRefinements: {
          property: []
        }
      })
    );
  });
});

describe('removeFacetRefinement', function() {
  test('removeFacetRefinement(property)', function() {
    var state = new SearchParameters({
      facets: ['property'],
      facetsRefinements: {
        property: ['value']
      }
    });

    expect(state.removeFacetRefinement('property')).toEqual(
      new SearchParameters({
        facets: ['property'],
        facetsRefinements: {
          property: []
        }
      })
    );
  });

  test('removeFacetRefinement(property, value)', function() {
    var state = new SearchParameters({
      facets: ['property'],
      facetsRefinements: {
        property: ['value', 'value2']
      }
    });

    expect(state.removeFacetRefinement('property', 'value')).toEqual(
      new SearchParameters({
        facets: ['property'],
        facetsRefinements: {
          property: ['value2']
        }
      })
    );
  });

  test('removeFacetRefinement(property, lastValue)', function() {
    var state = new SearchParameters({
      facets: ['property'],
      facetsRefinements: {
        property: ['value']
      }
    });

    expect(state.removeFacetRefinement('property', 'value')).toEqual(
      new SearchParameters({
        facets: ['property'],
        facetsRefinements: {
          property: []
        }
      })
    );
  });
});

describe('removeExcludeRefinement', function() {
  test('removeExcludeRefinement(property)', function() {
    var state = new SearchParameters({
      facets: ['property'],
      facetsExcludes: {
        property: ['value']
      }
    });

    expect(state.removeExcludeRefinement('property')).toEqual(
      new SearchParameters({
        facets: ['property'],
        facetsExcludes: {
          property: []
        }
      })
    );
  });

  test('removeExcludeRefinement(property, value)', function() {
    var state = new SearchParameters({
      facets: ['property'],
      facetsExcludes: {
        property: ['value', 'value2']
      }
    });

    expect(state.removeExcludeRefinement('property', 'value')).toEqual(
      new SearchParameters({
        facets: ['property'],
        facetsExcludes: {
          property: ['value2']
        }
      })
    );
  });

  test('removeExcludeRefinement(property, lastValue)', function() {
    var state = new SearchParameters({
      facets: ['property'],
      facetsExcludes: {
        property: ['value']
      }
    });

    expect(state.removeExcludeRefinement('property', 'value')).toEqual(
      new SearchParameters({
        facets: ['property'],
        facetsExcludes: {
          property: []
        }
      })
    );
  });
});

describe('removeNumericRefinement', function() {
  test('removeNumericRefinement(property)', function() {
    var state = new SearchParameters({
      numericRefinements: {
        property: {
          '>=': [100]
        }
      }
    });

    expect(state.removeNumericRefinement('property')).toEqual(
      new SearchParameters({
        numericRefinements: {
          property: {
            '>=': []
          }
        }
      })
    );
  });

  test('removeNumericRefinement(property, operator)', function() {
    var state = new SearchParameters({
      numericRefinements: {
        property: {
          '>=': [100]
        }
      }
    });

    expect(state.removeNumericRefinement('property', '>=')).toEqual(
      new SearchParameters({
        numericRefinements: {
          property: {
            '>=': []
          }
        }
      })
    );
  });

  test('removeNumericRefinement(property, operator, value)', function() {
    var state = new SearchParameters({
      numericRefinements: {
        property: {
          '<': [100],
          '>=': [100, 200]
        }
      }
    });

    expect(state.removeNumericRefinement('property', '>=', 100)).toEqual(
      new SearchParameters({
        numericRefinements: {
          property: {
            '<': [100],
            '>=': [200]
          }
        }
      })
    );
  });

  test('removeNumericRefinement(property, operator, lastValue)', function() {
    var state = new SearchParameters({
      numericRefinements: {
        property: {
          '<': [100],
          '>=': [100, 200]
        }
      }
    });

    expect(state.removeNumericRefinement('property', '<', 100)).toEqual(
      new SearchParameters({
        numericRefinements: {
          property: {
            '<': [],
            '>=': [100, 200]
          }
        }
      })
    );
  });
});
