'use strict';

var SearchParameters = require('../../../src/SearchParameters');
var SearchResults = require('../../../src/SearchResults');

test('processingTime should be the sum of all individual times', function() {
  var result = new SearchResults(new SearchParameters(), [
    {
      meta: {
        processingTimeMS: 1
      }
    },
    {
      meta: {
        processingTimeMS: 1
      }
    }
  ]);

  expect(result.processingTimeMS).toBe(2);
});

test('processingTime should ignore undefined', function() {
  var result = new SearchResults(new SearchParameters(), [
    {
      meta: {
        processingTimeMS: undefined
      }
    },
    {
      meta: {
        processingTimeMS: 1
      }
    }
  ]);

  expect(result.processingTimeMS).toBe(1);
});
