'use strict';

var searchHelper = require('../../../index');

function makeFakeClient() {
  return {
    search: jest.fn(function() {
      return new Promise(function() {});
    }),
    searchForFacetValues: jest.fn(function() {
      return new Promise(function() {});
    })
  };
}

function runAllMicroTasks() {
  return new Promise(setImmediate);
}

test('Change events should be emitted with reset page to true on implicit reset methods', function() {
  var changed = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index');

  helper.on('change', changed);

  expect(changed).toHaveBeenCalledTimes(0);

  // Trigger a page reset
  helper.setQuery('Apple');

  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(searchHelper.SearchParameters),
    results: null,
    isPageReset: true
  });

  // Trigger a page reset
  helper.setQueryParameter('hitsPerPage', 10);

  expect(changed).toHaveBeenCalledTimes(2);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(searchHelper.SearchParameters),
    results: null,
    isPageReset: true
  });
});

test('Change events should be emitted with reset page to false on regular methods', function() {
  var changed = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index');

  helper.on('change', changed);

  expect(changed).toHaveBeenCalledTimes(0);

  // Don't trigger a page reset
  helper.setPage(22);

  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(searchHelper.SearchParameters),
    results: null,
    isPageReset: false
  });

  // Don't trigger a page reset
  helper.setState({
    query: 'Apple',
    page: 22
  });

  expect(changed).toHaveBeenCalledTimes(2);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(searchHelper.SearchParameters),
    results: null,
    isPageReset: false
  });
});

test('Change events should be emitted as soon as the state change, but search should be triggered (refactored)', function() {
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    disjunctiveFacetsRefinements: {city: ['Paris']},
    facets: ['tower'],
    facetsRefinements: {tower: ['Empire State Building']},
    facetsExcludes: {tower: ['Empire State Building']}
  });

  var changeEventCount = 0;

  helper.on('change', function() {
    changeEventCount++;
  });

  helper.setQuery('a');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.clearRefinements();
  expect(changeEventCount).toBe(2);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  expect(changeEventCount).toBe(3);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  expect(changeEventCount).toBe(4);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addFacetExclusion('tower', 'Empire State Building');
  expect(changeEventCount).toBe(5);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeFacetExclusion('tower', 'Empire State Building');
  expect(changeEventCount).toBe(6);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addFacetRefinement('tower', 'Empire State Building');
  expect(changeEventCount).toBe(7);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeFacetRefinement('tower', 'Empire State Building');
  expect(changeEventCount).toBe(8);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.search();
  expect(changeEventCount).toBe(8);
  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('Change events should only be emitted for meaningful changes', function() {
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index', {
    query: 'a',
    disjunctiveFacets: ['city'],
    disjunctiveFacetsRefinements: {city: ['Paris']},
    facets: ['tower'],
    facetsRefinements: {tower: ['Empire State Building']},
    facetsExcludes: {tower: ['Empire State Building']}
  });

  var changeEventCount = 0;

  helper.on('change', function() {
    changeEventCount++;
  });

  helper.setQuery('a');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addFacetExclusion('tower', 'Empire State Building');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addFacetRefinement('tower', 'Empire State Building');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  // This is an actual change
  helper.clearRefinements();
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.clearRefinements();
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeFacetExclusion('tower', 'Empire State Building');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeFacetRefinement('tower', 'Empire State Building');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.search();
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('search event should be emitted once when the search is triggered and before the request is sent', function() {
  var searched = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  helper.on('search', searched);

  helper.setQuery('');
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.clearRefinements();
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addFacetExclusion('tower', 'Empire State Building');
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeFacetExclusion('tower', 'Empire State Building');
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addFacetRefinement('tower', 'Empire State Building');
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeFacetRefinement('tower', 'Empire State Building');
  expect(searched).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.search();
  expect(searched).toHaveBeenCalledTimes(1);
  expect(searched).toHaveBeenLastCalledWith({
    state: helper.state,
    results: null
  });
  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('searchOnce event should be emitted once when the search is triggered using searchOnce and before the request is sent', function() {
  var searchedOnce = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  helper.on('searchOnce', searchedOnce);

  expect(searchedOnce).toHaveBeenCalledTimes(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.searchOnce({}, function() {});

  expect(searchedOnce).toHaveBeenCalledTimes(1);
  expect(searchedOnce).toHaveBeenLastCalledWith({
    state: helper.state
  });

  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('result event should be emitted once the request is complete', function() {
  var resulted = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  fakeClient.search.mockImplementationOnce(function() {
    return Promise.resolve({
      results: [{
        meta: {}
      }]
    });
  });

  helper.on('result', resulted);

  expect(resulted).toHaveBeenCalledTimes(0);

  helper.search();

  return runAllMicroTasks().then(function() {
    expect(resulted).toHaveBeenCalledTimes(1);
    expect(resulted).toHaveBeenLastCalledWith({
      results: expect.any(searchHelper.SearchResults),
      state: helper.state
    });
  });
});

test('error event should be emitted once the request is complete with errors', function() {
  var errored = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  fakeClient.search.mockImplementationOnce(function() {
    return Promise.reject(new Error('Abort'));
  });

  helper.on('error', errored);

  expect(errored).toHaveBeenCalledTimes(0);

  helper.search();

  return runAllMicroTasks().then(function() {
    expect(errored).toHaveBeenCalledTimes(1);
    expect(errored).toHaveBeenLastCalledWith({
      error: expect.any(Error)
    });
  });
});

test('error event should be emitted if an error happens at request time', function() {
  var errored = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = searchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  fakeClient.search.mockImplementationOnce(function() {
    throw new Error('Unexpected error');
  });

  helper.on('error', errored);

  expect(errored).toHaveBeenCalledTimes(0);

  helper.search();

  expect(errored).toHaveBeenCalledTimes(1);
  expect(errored).toHaveBeenLastCalledWith({
    error: expect.any(Error)
  });
});
