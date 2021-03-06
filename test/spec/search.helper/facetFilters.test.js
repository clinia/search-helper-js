'use strict';

var searchHelper = require('../../../index');
var requestBuilder = require('../../../src/requestBuilder');

var fakeClient = {};

test('The filters should contain the different filters for a single conjunctive facet with multiple refinements',
  function() {
    var facetName = 'myFacet';
    var helper = searchHelper(fakeClient, '', {
      facets: [facetName]
    });

    helper.addFacetRefinement(facetName, 'value1');
    expect(requestBuilder._getFacetFilters(helper.state)).toEqual([facetName + ':value1']);
    helper.addFacetRefinement(facetName, 'value2');
    expect(requestBuilder._getFacetFilters(helper.state)).toEqual([facetName + ':value1', facetName + ':value2']);
    helper.toggleFacetRefinement(facetName, 'value3');
    expect(requestBuilder._getFacetFilters(helper.state)).toEqual([facetName + ':value1', facetName + ':value2', facetName + ':value3']);
    helper.toggleFacetRefinement(facetName, 'value3');
    expect(requestBuilder._getFacetFilters(helper.state)).toEqual([facetName + ':value1', facetName + ':value2']);
    helper.addFacetRefinement(facetName, 'value1');
    expect(requestBuilder._getFacetFilters(helper.state)).toEqual([facetName + ':value1', facetName + ':value2']);
  });
