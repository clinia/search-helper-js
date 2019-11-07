'use strict';

var SearchParameters = require('../../../src/SearchParameters');

module.exports = getData;

function getData() {
  var response = {
    'results': [
      {
        'index': 'health_facility',
        'records': [
          {
            'id': '1',
            'name': 'Jean Countu'
          }
        ],
        'meta': {
          'page': 0,
          'perPage': 20,
          'numPages': 1,
          'query': '',
          'total': 4
        }
      }
    ]
  }

  var searchParams = new SearchParameters({
    index: 'health_facility',
  });

  var responseHelper = {
    '_rawResults': response.results.slice(),
    '_state': searchParams,
    'query': '',
    'records': response.results[0].records,
    'index': 'health_facility',
    'perPage': 20,
    'total': 4,
    'numPages': 1,
    'page': 0,
  }

  return {
    response: response,
    searchParams: searchParams,
    responseHelper: responseHelper
  };
}