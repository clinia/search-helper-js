'use strict';

var cliniasearchHelper = require('../../../index');

var fakeClient = {};

test('the queryid should keep increasing when new requests arrives', function() {
  var initialQueryID;
  var client = {
    search: function() {
      initialQueryID++;
      return new Promise(function() {});
    }
  };
  var helper = cliniasearchHelper(client, null, {});

  initialQueryID = helper._queryId;

  helper.search().search().search().search().search();

  expect(helper._queryId).toBe(initialQueryID);
});

test('the response handler should check that the query is not outdated', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var shouldTriggerResult = true;
  var callCount = 0;

  var helper = cliniasearchHelper(fakeClient, null, {});

  helper.on('result', function() {
    callCount++;

    if (!shouldTriggerResult) {
      done.fail('The id was outdated');
    }
  });

  var states = [{
    state: helper.state,
    queriesCount: 1,
    helper: helper
  }];

  helper._dispatchCliniaResponse(states, helper._lastQueryIdReceived + 1, testData.response);
  helper._dispatchCliniaResponse(states, helper._lastQueryIdReceived + 10, testData.response);
  expect(callCount).toBe(2);

  shouldTriggerResult = false;

  helper._dispatchCliniaResponse(states, helper._lastQueryIdReceived - 1, testData.response);
  expect(callCount).toBe(2);

  done();
});

test('the error handler should check that the query is not outdated', function(done) {
  var shouldTriggerError = true;
  var callCount = 0;

  var helper = cliniasearchHelper(fakeClient, null, {});

  helper.on('error', function() {
    callCount++;

    if (!shouldTriggerError) {
      done.fail('The id was outdated');
    }
  });

  helper._dispatchCliniaError(helper._lastQueryIdReceived + 1, new Error());
  helper._dispatchCliniaError(helper._lastQueryIdReceived + 10, new Error());
  expect(callCount).toBe(2);

  shouldTriggerError = false;

  helper._dispatchCliniaError(helper._lastQueryIdReceived - 1, new Error());
  expect(callCount).toBe(2);

  done();
});
