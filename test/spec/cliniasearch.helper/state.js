'use strict';

var cliniasearchHelper = require('../../../index');

var SearchParameters = cliniasearchHelper.SearchParameters;

var fakeClient = {};

test('setState should set the state of the helper and trigger a change event', function(done) {
  var state0 = {query: 'a query'};
  var state1 = {query: 'another query'};

  var helper = cliniasearchHelper(fakeClient, null, state0);

  expect(helper.state).toEqual(new SearchParameters(state0));

  helper.on('change', function(newState) {
    expect(helper.state).toEqual(new SearchParameters(state1));
    expect(newState).toEqual(new SearchParameters(state1));
    done();
  });

  helper.setState(state1);
});

test('getState should return the current state of the helper', function() {
  var initialState = {query: 'a query'};
  var helper = cliniasearchHelper(fakeClient, null, initialState);

  expect(helper.getState()).toEqual(new SearchParameters(initialState));
  expect(helper.getState()).toEqual(helper.state);
});
