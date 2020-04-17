'use strict';

var SearchParameters = require('../../../src/SearchParameters');

var searchHelper = require('../../../index');

test('searchOnce should call the clinia client according to the number of refinements and call callback with no error and with results when no error', function(done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.resolve(testData.response);
    })
  };

  var helper = searchHelper(client, 'test_clinic');

  var parameters = new SearchParameters({
    disjunctiveFacets: ['services.en']
  })
    .setIndex('test_clinic')
    .addDisjunctiveFacetRefinement('services.en', 'Massage therapy')
    .addDisjunctiveFacetRefinement('services.en', 'Physiotherapy');

  helper.searchOnce(parameters, function(err, data) {
    expect(err).toBe(null);

    // shame deepclone, to remove any associated methods coming from the results
    expect(JSON.parse(JSON.stringify(data))).toEqual(JSON.parse(JSON.stringify(testData.responseHelper)));

    var serviceValues = data.getFacetValues('services.en');
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

    var serviceValuesCustom = data.getFacetValues('services.en', {sortBy: ['count:asc', 'name:asc']});
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

    var serviceValuesFn = data.getFacetValues('services.en', {sortBy: function(a, b) { return a.count - b.count; }});
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
});

test('searchOnce should call the clinia client according to the number of refinements and call callback with error and no results when error', function(done) {
  var error = {message: 'error'};
  var client = {
    search: jest.fn().mockImplementationOnce(function() {
      return Promise.reject(error);
    })
  };

  var helper = searchHelper(client, 'test_health_facility');

  var parameters = new SearchParameters({
    disjunctiveFacets: ['city']
  })
    .setIndex('test_health_facility')
    .addDisjunctiveFacetRefinement('city', 'Paris')
    .addDisjunctiveFacetRefinement('city', 'New York');

  helper.searchOnce(parameters, function(err, data) {
    expect(err).toBe(error);
    expect(data).toBe(null);

    expect(client.search).toHaveBeenCalledTimes(1);

    var queries = client.search.mock.calls[0][0];
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      expect(query.query).toBeUndefined();
      expect(query.params.query).toBeUndefined();
    }

    done();
  });
});
