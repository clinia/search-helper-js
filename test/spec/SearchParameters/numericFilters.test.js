'use strict';

var SearchParameters = require('../../../src/SearchParameters');


/* Ensure that we add and then remove the same value, and get a state equivalent to the initial one */
function testSameValue(value) {
  var property = 'property';
  var operator = '=';

  var state0 = new SearchParameters();
  var state1 = state0.addNumericRefinement(property, operator, value);
  var stateEmpty = new SearchParameters({
    numericRefinements: {
      [property]: {
        [operator]: []
      }
    }
  });
  expect(state1.isNumericRefined(property, operator, value)).toBeTruthy();
  var state2 = state1.removeNumericRefinement(property, operator, value);
  expect(state2.isNumericRefined(property, operator, value)).toBeFalsy();
  expect(state2).toEqual(stateEmpty);
}

test('Should be able to add remove strings', function() {
  testSameValue('40');
});

test('Should be able to add remove numbers', function() {
  testSameValue(40);
});

test('Should be able to add remove arrays', function() {
  testSameValue([40, '30']);
});
