'use strict';

var searchHelper = require('../../../index.js');

var fakeClient = {};

test('getQuery', function() {
  var helper = searchHelper(fakeClient, 'IndexName', {
    disjunctiveFacets: ['df1', 'df2', 'df3'],
    disjunctiveFacetsRefinements: {
      df1: ['DF1-VAL-1'],
      df2: ['DF2-VAL-1', 'DF2-VAL-2']
    },
    facets: ['facet1', 'facet2', 'facet3'],
    facetsRefinements: {
      facet1: ['FACET1-VAL-1'],
      facet2: ['FACET2-VAL-1', 'FACET2-VAL2']
    }
  });

  expect(helper.getQuery()).toEqual({
    facets: ['facet1', 'facet2', 'facet3', 'df1', 'df2', 'df3'],
    facetFilters: ['facet1:FACET1-VAL-1',
      'facet2:FACET2-VAL-1',
      'facet2:FACET2-VAL2',
      ['df1:DF1-VAL-1'],
      ['df2:DF2-VAL-1', 'df2:DF2-VAL-2']
    ]
  });
});
