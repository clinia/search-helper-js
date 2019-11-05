'use strict';

var cliniasearchHelper = require('../../index');

test('Search should not mutate the original client response', function(done) {
  var testData = require('../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = cliniasearchHelper(client, 'test_hotels-node');

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

  var helper = cliniasearchHelper(client, 'Index', {});

  helper.setQuery('');
  helper.clearRefinements();
  
  expect(client.search).toHaveBeenCalledTimes(0);

  helper.search();

  expect(client.search).toHaveBeenCalledTimes(1);
});