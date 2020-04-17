'use strict';

var SearchParameters = require('../../../src/SearchParameters');
var SearchResults = require('../../../src/SearchResults');

test('took should be the sum of all individual times', function() {
  var result = new SearchResults(new SearchParameters(), [
    {
      meta: {
        took: 1
      }
    },
    {
      meta: {
        took: 1
      }
    }
  ]);

  expect(result.took).toBe(2);
});

test('took should ignore undefined', function() {
  var result = new SearchResults(new SearchParameters(), [
    {
      meta: {
        took: undefined
      }
    },
    {
      meta: {
        took: 1
      }
    }
  ]);

  expect(result.took).toBe(1);
});
