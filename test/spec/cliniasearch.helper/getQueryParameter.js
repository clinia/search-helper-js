'use strict';

var cliniaSearchHelper = require('../../../index.js');

var fakeClient = {};

test('getQueryParameter', function() {
  var bind = require('lodash/bind');

  var helper = cliniaSearchHelper(fakeClient, null, {
    searchFields: ['name'],
    queryType: 'prefix_last'
  });

  expect(helper.getQueryParameter('searchFields')).toEqual(['name']);
  expect(helper.getQueryParameter('queryType')).toBe('prefix_last');

  expect(bind(helper.getQueryParameter, helper, 'unknown')).toThrow();
});