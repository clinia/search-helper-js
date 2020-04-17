'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('When removing all numeric refinements of a state without any', function() {
  var state = SearchParameters.make({});
  expect(state._clearNumericRefinements()).toBe(state.numericRefinements);
});

test('When removing numericRefinements of a specific property, and there are no refinements for this property', function() {
  var state = SearchParameters.make({
    numericRefinements: {
      price: {'>': [300]}
    }
  });

  expect(state._clearNumericRefinements('size')).toBe(state.numericRefinements);
});

test('When removing refinements of a specific property, and another refinement is a substring of this property', function() {
  var state = SearchParameters.make({
    numericRefinements: {
      'price': {'>': [300]},
      'price with taxes': {'>': [300]}
    }
  });

  const expectedNumericRefinements = {
    price: {'>': [300]}
  };

  expect(state._clearNumericRefinements('price with taxes')).toEqual(expectedNumericRefinements);
});

test('When removing numericRefinements using a function, and there are no changes', function() {
  var state = SearchParameters.make({
    numericRefinements: {
      price: {'>': [300, 30]},
      size: {'=': [32, 30]}
    }
  });

  function clearNothing() {return false;}
  function clearUndefinedAttribute(v, property) {return property === 'distance';}
  function clearUndefinedOperator(v) {return v.op === '<';}
  function clearUndefinedValue(v) {return v.val === 3;}

  expect(state._clearNumericRefinements(clearNothing)).toBe(state.numericRefinements);
  expect(state._clearNumericRefinements(clearUndefinedAttribute)).toBe(state.numericRefinements);
  expect(state._clearNumericRefinements(clearUndefinedOperator)).toBe(state.numericRefinements);
  expect(state._clearNumericRefinements(clearUndefinedValue)).toBe(state.numericRefinements);
});
