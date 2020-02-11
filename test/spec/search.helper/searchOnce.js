'use strict';

var SearchParameters = require('../../../src/SearchParameters');

var searchHelper = require('../../../index');

test('searchOnce should call the clinia client according to the number of refinements and call callback with no error and with results when no error', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = searchHelper(client, 'test_health_facility');

  var parameters = new SearchParameters({
    disjunctiveFacets: ['type']
  })
    .setIndex('test_health_facility')
    .addDisjunctiveFacetRefinement('type', 'Clsc')
    .addDisjunctiveFacetRefinement('type', 'Pharmacy');

  helper.searchOnce(parameters, function(err, data) {
    expect(err).toBe(null);

    // shame deepclone, to remove any associated methods coming from the results
    expect(JSON.parse(JSON.stringify(data))).toEqual(JSON.parse(JSON.stringify(testData.responseHelper)));

    var typeValues = data.getFacetValues('type');
    var expectedTypeValues = [
      {name: 'Pharmacy', count: 3, isRefined: true},
      {name: 'Clsc', count: 1, isRefined: true}
    ];

    expect(typeValues).toEqual(expectedTypeValues);

    var typeValuesCustom = data.getFacetValues('type', {sortBy: ['count:asc', 'name:asc']});
    var expectedTypeValuesCustom = [
      {name: 'Clsc', count: 1, isRefined: true},
      {name: 'Pharmacy', count: 3, isRefined: true}
    ];

    expect(typeValuesCustom).toEqual(expectedTypeValuesCustom);

    var typeValuesFn = data.getFacetValues('type', {sortBy: function(a, b) { return a.count - b.count; }});
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
});

test('searchOnce should call the clinia client according to the number of refinements and call callback with error and no results when error', function(done) {
  var error = {message: 'error'};
  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.reject(error);
    })
  };

  var helper = searchHelper(client, 'test_health_facility');

  var parameters = new SearchParameters({
    disjunctiveFacets: ['city']
  })
    .setIndex('test_health_facility')
    .addDisjunctiveFacetRefinement('city', 'Paris')
    .addDisjunctiveFacetRefinement('city', 'New York');

  helper.searchOnce(parameters, function(err, data) {
    expect(err).toBe(error);
    expect(data).toBe(null);

    expect(client.search).toHaveBeenCalledTimes(1);

    var queries = client.search.mock.calls[0][0];
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      expect(query.query).toBeUndefined();
      expect(query.params.query).toBeUndefined();
    }

    done();
  });
});
