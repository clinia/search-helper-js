'use strict';

var SearchParameters = require('../../../src/SearchParameters');

var cliniasearchHelper = require('../../../index');

test('searchOnce should call the algolia client according to the number of refinements and call callback with no error and with results when no error', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = cliniasearchHelper(client, 'health_facility');

  var parameters = new SearchParameters()
    .setIndex('health_facility');

  helper.searchOnce(parameters, function(err, data) {
    expect(err).toBe(null);

    // shame deepclone, to remove any associated methods coming from the results
    expect(JSON.parse(JSON.stringify(data))).toEqual(JSON.parse(JSON.stringify(testData.responseHelper)));

    expect(client.search).toHaveBeenCalledTimes(1);

    var queries = client.search.mock.calls[0][0];
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      expect(query.query).toBe(undefined);
      expect(query.params.query).toBe('');
    }

    done();
  });
});

test('searchOnce should call the algolia client according to the number of refinements and call callback with error and no results when error', function(done) {
  var error = {message: 'error'};
  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.reject(error);
    })
  };

  var helper = cliniasearchHelper(client, 'test_hotels-node');

  var parameters = new SearchParameters()
    .setIndex('health_facility');

  helper.searchOnce(parameters, function(err, data) {
    expect(err).toBe(error);
    expect(data).toBe(null);

    expect(client.search).toHaveBeenCalledTimes(1);

    var queries = client.search.mock.calls[0][0];
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      expect(query.query).toBe(undefined);
      expect(query.params.query).toBe('');
    }

    done();
  });
});