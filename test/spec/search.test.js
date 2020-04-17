'use strict';

var searchHelper = require('../../index');

test('Search should call the clinia client according to the number of refinements', function(done) {
  var testData = require('../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = searchHelper(client, 'test_clinic', {
    disjunctiveFacets: ['services.en']
  });

  helper.addDisjunctiveFacetRefinement('services.en', 'Massage therapy', true);
  helper.addDisjunctiveFacetRefinement('services.en', 'Physiotherapy', true);

  helper.on('result', function(event) {
    var results = event.results;

    // shame deepclone, to remove any associated methods coming from the results
    expect(JSON.parse(JSON.stringify(results))).toEqual(JSON.parse(JSON.stringify(testData.responseHelper)));

    var serviceValues = results.getFacetValues('services.en');
    var expectedServiceValues = [
      {name: 'Physiotherapy', count: 115, isRefined: true},
      {name: 'Massage therapy', count: 12, isRefined: true},
      {name: 'Osteopathy', count: 6, isRefined: false},
      {name: 'Nutrition', count: 4, isRefined: false},
      {name: 'Physiotherapy Consultation', count: 4, isRefined: false},
      {name: 'Chiropractic', count: 3, isRefined: false},
      {name: 'Fertility', count: 3, isRefined: false},
      {name: 'Acupuncture', count: 2, isRefined: false},
      {name: 'Blood samples', count: 2, isRefined: false},
      {name: 'Blood test', count: 2, isRefined: false}
    ];

    expect(serviceValues).toEqual(expectedServiceValues);

    var serviceValuesCustom = results.getFacetValues('services.en', {sortBy: ['count:asc', 'name:asc']});
    var expectedServiceValuesCustom = [
      {name: 'Acupuncture', count: 2, isRefined: false},
      {name: 'Blood samples', count: 2, isRefined: false},
      {name: 'Blood test', count: 2, isRefined: false},
      {name: 'Chiropractic', count: 3, isRefined: false},
      {name: 'Fertility', count: 3, isRefined: false},
      {name: 'Nutrition', count: 4, isRefined: false},
      {name: 'Physiotherapy Consultation', count: 4, isRefined: false},
      {name: 'Osteopathy', count: 6, isRefined: false},
      {name: 'Massage therapy', count: 12, isRefined: true},
      {name: 'Physiotherapy', count: 115, isRefined: true}
    ];


    expect(serviceValuesCustom).toEqual(expectedServiceValuesCustom);

    var serviceValuesFn = results.getFacetValues('services.en', {sortBy: function(a, b) { return a.count - b.count; }});
    var expectedServiceValuesFn = [
      {name: 'Acupuncture', count: 2, isRefined: false},
      {name: 'Blood samples', count: 2, isRefined: false},
      {name: 'Blood test', count: 2, isRefined: false},
      {name: 'Chiropractic', count: 3, isRefined: false},
      {name: 'Fertility', count: 3, isRefined: false},
      {name: 'Nutrition', count: 4, isRefined: false},
      {name: 'Physiotherapy Consultation', count: 4, isRefined: false},
      {name: 'Osteopathy', count: 6, isRefined: false},
      {name: 'Massage therapy', count: 12, isRefined: true},
      {name: 'Physiotherapy', count: 115, isRefined: true}
    ];

    expect(serviceValuesFn).toEqual(expectedServiceValuesFn);

    expect(client.search).toHaveBeenCalledTimes(1);

    var queries = client.search.mock.calls[0][0];
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      expect(query.query).toBeUndefined();
      expect(query.params.query).toBeUndefined();
    }

    done();
  });

  helper.search('');
});

test('Search should not mutate the original client response', function(done) {
  var testData = require('../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = searchHelper(client, 'clinic');

  var originalResponseLength = testData.response.results.length;

  helper.on('result', function() {
    var currentResponseLength = testData.response.results.length;

    expect(currentResponseLength).toBe(originalResponseLength);

    done();
  });

  helper.search('');
});

test('no mutating methods should trigger a search', function() {
  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return new Promise(function() {});
    })
  };

  var helper = searchHelper(client, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  helper.setQuery('');
  helper.clearRefinements();
  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  helper.addFacetExclusion('tower', 'Empire State Building');
  helper.removeFacetExclusion('tower', 'Empire State Building');
  helper.addFacetRefinement('tower', 'Empire State Building');
  helper.removeFacetRefinement('tower', 'Empire State Building');

  expect(client.search).toHaveBeenCalledTimes(0);

  helper.search();

  expect(client.search).toHaveBeenCalledTimes(1);
});
