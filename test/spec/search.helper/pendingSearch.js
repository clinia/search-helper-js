'use strict';

var clinia = require('clinia');

var searchHelper = require('../../../index');

test('When searchOnce with callback, hasPendingRequests is true', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var client = clinia('dsf', 'dsfdf');

  var triggerCb;
  client.search = function() {
    return new Promise(function(resolve) {
      triggerCb = function() { resolve(testData.response); };
    });
  };

  var helper = searchHelper(client, 'test_health_facility');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.searchOnce(helper.state, function() {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  });

  expect(helper.hasPendingRequests()).toBe(true);
  expect(countNoMoreSearch).toBe(0);

  triggerCb();
});

test('When searchOnce with promises, hasPendingRequests is true', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var client = clinia('dsf', 'dsfdf');

  var triggerCb;
  client.search = function() {
    return new Promise(function(resolve) {
      triggerCb = function() { resolve(testData.response); };
    });
  };

  var helper = searchHelper(client, 'test_health_facility');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.searchOnce(helper.state).then(function() {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  });

  expect(helper.hasPendingRequests()).toBe(true);
  expect(countNoMoreSearch).toBe(0);

  triggerCb();
});

test('When helper.search(), hasPendingRequests is true', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var client = clinia('dsf', 'dsfdf');

  var triggerCb;
  client.search = function() {
    return new Promise(function(resolve) {
      triggerCb = function() { resolve(testData.response); };
    });
  };

  var helper = searchHelper(client, 'test_health_facility');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.on('result', function() {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  });

  helper.search();

  expect(helper.hasPendingRequests()).toBe(true);
  expect(countNoMoreSearch).toBe(0);

  triggerCb();
});

test('When helper.search() and one request is discarded, hasPendingRequests is true unless all come back', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var client = clinia('dsf', 'dsfdf');

  var triggerCbs = [];
  client.search = function() {
    return new Promise(function(resolve) {
      triggerCbs.push(function() { resolve(testData.response); });
    });
  };

  var helper = searchHelper(client, 'test_health_facility');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.search();
  helper.search();
  helper.search();

  // intermediary result handler
  helper.once('result', function() {
    expect(helper.hasPendingRequests()).toBe(true);
    expect(countNoMoreSearch).toBe(0);
  });

  // The second search returns from clinia -> discards the first one
  triggerCbs[1]();

  // Final result handler
  helper.once('result', function() {
    expect(helper.hasPendingRequests()).toBe(true);
    expect(countNoMoreSearch).toBe(0);
  });

  helper.searchOnce({}, function() {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
  });

  // The third search returns from Clinia
  triggerCbs[2]();
  // The searchOnce should not be impacted
  triggerCbs[3]();
  triggerCbs[0]();
  // this will be ignored and it won't change anything

  setTimeout(function() {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  }, 0);
});