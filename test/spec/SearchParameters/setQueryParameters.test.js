'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('setQueryParameters should return the same instance if the options is falsey', function() {
  var state = new SearchParameters({
    facets: ['a', 'b'],
    highlightProperties: ''
  });

  expect(state).toBe(state.setQueryParameters());
  expect(state).toBe(state.setQueryParameters(null));
  expect(state).toBe(state.setQueryParameters(undefined));
});

test('setQueryParameters should be able to mix an actual state with a new set of parameters', function() {
  var state0 = new SearchParameters({
    facets: ['a', 'b'],
    highlightProperties: ''
  });

  var params = {
    facets: ['a', 'c'],
    highlightProperties: ['city', 'country']
  };

  var state1 = state0.setQueryParameters(params);

  expect(state1).toEqual(new SearchParameters({
    facets: ['a', 'c'],
    highlightProperties: ['city', 'country']
  }));
});

test('setQueryParameters should add unknown properties', function() {
  var state0 = new SearchParameters({
    facets: ['a', 'b'],
    highlightProperties: ''
  });

  var params = {
    unknow1: ['a', 'c'],
    facet: ['city', 'country']
  };

  var state1 = state0.setQueryParameters(params);

  expect(state1).toEqual(new SearchParameters({
    facets: ['a', 'b'],
    highlightProperties: '',
    unknow1: ['a', 'c'],
    facet: ['city', 'country']
  }));
});

test('setQueryParameters should ignore undefined parameters without previous values', function() {
  var state0 = new SearchParameters({
    aroundLatLng: '10,12'
  });

  var state1 = state0.setQueryParameters({
    query: undefined,
    page: undefined
  });

  expect(state1).not.toHaveProperty('query');
  expect(state1).not.toHaveProperty('page');
});

test('setQueryParameters should omit defined parameters with next values of undefined', function() {
  var state0 = new SearchParameters({
    aroundLatLng: '10,12',
    query: 'Apple',
    page: 5
  });

  var state1 = state0.setQueryParameters({
    query: undefined,
    page: undefined
  });

  expect(state1).not.toHaveProperty('query');
  expect(state1).not.toHaveProperty('page');
});
