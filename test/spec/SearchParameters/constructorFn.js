'use strict';

var forOwn = require('lodash/forOwn');
var SearchParameters = require('../../../src/SearchParameters');

test('Constructor should accept an object with known keys', function() {
  var legitConfig = {
    'query': '',
    'page': 0,
    'perPage': 10,
    'searchFields': [
      'name',
      'services'
    ]
  };
  var params = new SearchParameters(legitConfig);
  forOwn(legitConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});

test('Constructor should accept an object with unknown keys', function() {
  var betaConfig = {
    'query': '',
    'query': '',
    'page': 0,
    'perPage': 10,
    'searchFields': [
      'name',
      'services'
    ],
    'betaParameter': true,
    'otherBetaParameter': ['alpha', 'omega']
  };
  var params = new SearchParameters(betaConfig);
  forOwn(betaConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});

test('Factory should accept an object with known keys', function() {
  var legitConfig = {
    'query': '',
    'query': '',
    'page': 0,
    'perPage': 10,
    'searchFields': [
      'name',
      'services'
    ]
  };
  var params = SearchParameters.make(legitConfig);
  forOwn(legitConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});

test('Constructor should accept an object with unknown keys', function() {
  var betaConfig = {
    'query': '',
    'query': '',
    'page': 0,
    'perPage': 10,
    'searchFields': [
      'name',
      'services'
    ],
    'betaParameter': true,
    'otherBetaParameter': ['alpha', 'omega']
  };
  var params = SearchParameters.make(betaConfig);
  forOwn(betaConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});