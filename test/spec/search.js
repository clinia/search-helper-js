'use strict';

var searchHelper = require('../../index');

test('Search should call the clinia client according to the number of refinements', function(done) {
  var testData = require('../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = searchHelper(client, 'test_health_facility', {
    disjunctiveFacets: ['type']
  });

  helper.addDisjunctiveFacetRefinement('type', 'Clsc', true);
  helper.addDisjunctiveFacetRefinement('type', 'Pharmacy', true);

  helper.on('result', function(event) {
    var results = event.results;

    // shame deepclone, to remove any associated methods coming from the results
    expect(JSON.parse(JSON.stringify(results))).toEqual(JSON.parse(JSON.stringify(testData.responseHelper)));

    var typeValues = results.getFacetValues('type');
    var expectedTypeValues = [
      {name: 'Pharmacy', count: 3, isRefined: true},
      {name: 'Clsc', count: 1, isRefined: true}
    ];

    expect(typeValues).toEqual(expectedTypeValues);

    var typeValuesCustom = results.getFacetValues('type', {sortBy: ['count:asc', 'name:asc']});
    var expectedTypeValuesCustom = [
      {name: 'Clsc', count: 1, isRefined: true},
      {name: 'Pharmacy', count: 3, isRefined: true}
    ];


    expect(typeValuesCustom).toEqual(expectedTypeValuesCustom);

    var typeValuesFn = results.getFacetValues('type', {sortBy: function(a, b) { return a.count - b.count; }});
    var expectedTypeValuesFn = [
      {name: 'Clsc', count: 1, isRefined: true},
      {name: 'Pharmacy', count: 3, isRefined: true}
    ];

    expect(typeValuesFn).toEqual(expectedTypeValuesFn);

    expect(client.search).toHaveBeenCalledTimes(1);

    var queries = client.search.mock.calls[0][0];
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      expect(query.query).toBeUndefined();
      expect(query.params.query).toBeUndefined();
    }

    done();
  });

  helper.search('');
});

test('Search should not mutate the original client response', function(done) {
  var testData = require('../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = searchHelper(client, 'health_facility');

  var originalResponseLength = testData.response.results.length;

  helper.on('result', function() {
    var currentResponseLength = testData.response.results.length;

    expect(currentResponseLength).toBe(originalResponseLength);

    done();
  });

  helper.search('');
});

test('no mutating methods should trigger a search', function() {
  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return new Promise(function() {});
    })
  };

  var helper = searchHelper(client, 'Index', {});

  helper.setQuery('');
  helper.clearRefinements();

  expect(client.search).toHaveBeenCalledTimes(0);

  helper.search();

  expect(client.search).toHaveBeenCalledTimes(1);
});
