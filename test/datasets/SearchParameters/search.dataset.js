'use strict';

var SearchParameters = require('../../../src/SearchParameters');

module.exports = getData;

function getData() {
  var response = {
    'results': [
      {
        'index': 'test_health_facility',
        'records': [
          {
            'id': '366084010',
            'name': 'Jean coutu',
            'type': 'Pharmacy'
          },
          {
            'id': '366084010',
            'name': 'Uniprix',
            'type': 'Pharmacy'
          },
          {
            'id': '366084010',
            'name': 'Pharmaprix',
            'type': 'Pharmacy'
          },
          {
            'id': '366084010',
            'name': 'Clsc Plateau mont-royal',
            'type': 'Clsc'
          }
        ],
        'meta': {
          'page': 0,
          'total': 4,
          'params': 'query=&perPage=20&page=0&facets=%5B%5D&facetFilters=%5B%5B%22city%3AParis%22%2C%22city%3ANew%20York%22%5D%5D',
          'exhaustiveFacetsCount': true,
          'exhaustiveTotalRecords': true,
          'query': '',
          'processingTimeMS': 2,
          'numPages': 1,
          'perPage': 20
        }
      },
      {
        'index': 'test_health_facility',
        'records': [
          {
            'id': '366084010'
          }
        ],
        'meta': {
          'page': 0,
          'total': 5,
          'params': 'query=&perPage=1&page=0&propertiesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&facets=city&facetFilters=%5B%5D',
          'exhaustiveFacetsCount': false,
          'exhaustiveTotalRecords': true,
          'query': '',
          'processingTimeMS': 3,
          'numPages': 5,
          'perPage': 1
        },
        'facets': {
          'type': {
            'Clsc': 1,
            'Pharmacy': 3
          }
        }
      }
    ]
  };

  var searchParams = new SearchParameters({
    index: 'test_health_facility',
    disjunctiveFacets: ['type'],
    disjunctiveFacetsRefinements: {
      type: ['Clsc', 'Pharmacy']
    }
  });

  var responseHelper = {
    '_rawResults': response.results.slice(0),
    '_state': searchParams,
    'query': '',
    'records': [
      {
        'id': '366084010',
        'name': 'Jean coutu',
        'type': 'Pharmacy'
      },
      {
        'id': '366084010',
        'name': 'Uniprix',
        'type': 'Pharmacy'
      },
      {
        'id': '366084010',
        'name': 'Pharmaprix',
        'type': 'Pharmacy'
      },
      {
        'id': '366084010',
        'name': 'Clsc Plateau mont-royal',
        'type': 'Clsc'
      }
    ],
    'index': 'test_health_facility',
    'perPage': 20,
    'total': 4,
    'numPages': 1,
    'page': 0,
    'processingTimeMS': 5,
    'disjunctiveFacets': [
      {
        'name': 'type',
        'data': {
          'Clsc': 1,
          'Pharmacy': 3
        },
        'exhaustive': false
      }
    ],
    'facets': [],
    'exhaustiveFacetsCount': true,
    'exhaustiveTotalRecords': true
  };

  return {
    response: response,
    searchParams: searchParams,
    responseHelper: responseHelper
  };
}
