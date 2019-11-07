'use strict';

var cliniaSearchHelper = require('../../../index.js');

var fakeClient = {};

test('getQuery', function() {
  var helper = cliniaSearchHelper(fakeClient, 'IndexName');

  expect(helper.getQuery()).toEqual({
    query: '',
    page: 0
  });
});