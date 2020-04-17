'use strict';

var searchHelper = require('../../../index');

var SearchParameters = searchHelper.SearchParameters;

var fakeClient = {};

test('setState should set the state of the helper and trigger a change event', function(done) {
  var state0 = {query: 'a query'};
  var state1 = {query: 'another query'};

  var helper = searchHelper(fakeClient, null, state0);

  expect(helper.state).toEqual(new SearchParameters(state0));

  helper.on('change', function(event) {
    expect(helper.state).toEqual(new SearchParameters(state1));
    expect(event.state).toEqual(new SearchParameters(state1));
    done();
  });

  helper.setState(state1);
});
