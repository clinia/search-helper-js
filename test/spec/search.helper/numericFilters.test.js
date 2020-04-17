'use strict';

var clinia = require('clinia');
var searchHelper = require('../../../index');

var fakeClient = {};

test('Numeric filters: numeric filters from constructor', function(done) {
  var client = clinia('dsf', 'dsfdf');

  client.search = function(queries) {
    var ps = queries[0].params;

    expect(ps.numericFilters).toEqual([
      'property1>3',
      'property1<=100',
      'property2=42',
      'property2=25',
      'property2=58',
      ['property2=27', 'property2=70']
    ]);

    done();

    return new Promise(function() {});
  };

  var helper = searchHelper(client, 'index', {
    numericRefinements: {
      property1: {
        '>': [3],
        '<=': [100]
      },
      property2: {
        '=': [42, 25, 58, [27, 70]]
      }
    }
  });

  helper.search();
});

test('Numeric filters: numeric filters from setters', function(done) {
  var client = clinia('dsf', 'dsfdf');

  client.search = function(queries) {
    var ps = queries[0].params;

    expect(ps.numericFilters).toEqual([
      'property1>3',
      'property1<=100',
      'property2=42',
      'property2=25',
      'property2=58',
      ['property2=27', 'property2=70']
    ]);

    done();

    return new Promise(function() {});
  };

  var helper = searchHelper(client, 'index');

  helper.addNumericRefinement('property1', '>', 3);
  helper.addNumericRefinement('property1', '<=', 100);
  helper.addNumericRefinement('property2', '=', 42);
  helper.addNumericRefinement('property2', '=', 25);
  helper.addNumericRefinement('property2', '=', 58);
  helper.addNumericRefinement('property2', '=', [27, 70]);

  helper.search();
});

test('Should be able to remove values one by one even 0s', function() {
  var helper = searchHelper(fakeClient, null, null);

  helper.addNumericRefinement('property', '>', 0);
  helper.addNumericRefinement('property', '>', 4);
  expect(helper.state.numericRefinements.property['>']).toEqual([0, 4]);
  helper.removeNumericRefinement('property', '>', 0);
  expect(helper.state.numericRefinements.property['>']).toEqual([4]);
  helper.removeNumericRefinement('property', '>', 4);
  expect(helper.state.numericRefinements.property['>']).toEqual([]);
});

test(
  'Should remove all the numeric values for a single operator if remove is called with two arguments',
  function() {
    var helper = searchHelper(fakeClient, null, null);

    helper.addNumericRefinement('property', '>', 0);
    helper.addNumericRefinement('property', '>', 4);
    helper.addNumericRefinement('property', '<', 4);
    expect(helper.state.numericRefinements.property).toEqual({'>': [0, 4], '<': [4]});
    helper.removeNumericRefinement('property', '>');
    expect(helper.state.numericRefinements.property['>']).toEqual([]);
    expect(helper.state.numericRefinements.property['<']).toEqual([4]);

    expect(helper.getRefinements('property')).toEqual([
      {type: 'numeric', operator: '>', value: []},
      {type: 'numeric', operator: '<', value: [4]}
    ]);
  }
);

test(
  'Should remove all the numeric values for an property if remove is called with one argument',
  function() {
    var helper = searchHelper(fakeClient, null, null);

    helper.addNumericRefinement('property', '>', 0);
    helper.addNumericRefinement('property', '>', 4);
    helper.addNumericRefinement('property', '<', 4);
    expect(helper.state.numericRefinements.property).toEqual({'>': [0, 4], '<': [4]});
    helper.removeNumericRefinement('property');
    expect(helper.state.numericRefinements.property).toEqual({'>': [], '<': []});

    expect(helper.getRefinements('property')).toEqual([
      {
        operator: '>',
        type: 'numeric',
        value: []
      },
      {
        operator: '<',
        type: 'numeric',
        value: []
      }
    ]);
  }
);

test('Should be able to get if an property has numeric filter with hasRefinements', function() {
  var helper = searchHelper(fakeClient, null, null);

  expect(helper.hasRefinements('property')).toBeFalsy();
  helper.addNumericRefinement('property', '=', 42);
  expect(helper.hasRefinements('property')).toBeTruthy();
});

test('Should be able to remove the value even if it was a string used as a number', function() {
  var propertyName = 'attr';
  var n = '42';

  var helper = searchHelper(fakeClient, 'index', {});

  // add string - removes string
  helper.addNumericRefinement(propertyName, '=', n);
  expect(helper.state.isNumericRefined(propertyName, '=', n)).toBeTruthy();
  helper.removeNumericRefinement(propertyName, '=', n);
  expect(helper.state.isNumericRefined(propertyName, '=', n)).toBeFalsy();

  // add number - removes string
  helper.addNumericRefinement(propertyName, '=', 42);
  expect(helper.state.isNumericRefined(propertyName, '=', 42)).toBeTruthy();
  helper.removeNumericRefinement(propertyName, '=', n);
  expect(helper.state.isNumericRefined(propertyName, '=', 42)).toBeFalsy();

  // add string - removes number
  helper.addNumericRefinement(propertyName, '=', n);
  expect(helper.state.isNumericRefined(propertyName, '=', n)).toBeTruthy();
  helper.removeNumericRefinement(propertyName, '=', 42);
  expect(helper.state.isNumericRefined(propertyName, '=', n)).toBeFalsy();
});
