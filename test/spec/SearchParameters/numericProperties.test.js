'use strict';

var forEach = require('lodash/forEach');

var SearchParameters = require('../../../src/SearchParameters');

var stateWithStringForIntegers = {
  page: '10',
  perPage: '500',
  rankingInfo: '1',
  maxValuesPerFacet: '10',
  aroundRadius: '10',
  minimumAroundRadius: '234'
};

test('Constructor should parse the numeric properties', function() {
  var state = new SearchParameters(stateWithStringForIntegers);

  forEach(stateWithStringForIntegers, function(v, k) {
    var parsedValue = parseFloat(v);
    expect(state[k]).toBe(parsedValue);
  });
});

test('setQueryParameter should parse the numeric properties', function() {
  var state0 = new SearchParameters();

  forEach(stateWithStringForIntegers, function(v, k) {
    var parsedValue = parseFloat(v);
    var state1 = state0.setQueryParameter(k, v);
    expect(state1[k]).toBe(parsedValue);
  });
});

test('setQueryParameters should parse the numeric properties', function() {
  var state0 = new SearchParameters();
  var state1 = state0.setQueryParameters(stateWithStringForIntegers);

  forEach(stateWithStringForIntegers, function(v, k) {
    var parsedValue = parseFloat(v);
    expect(state1[k]).toBe(parsedValue);
  });
});
