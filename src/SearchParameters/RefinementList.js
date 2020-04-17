'use strict';

/**
 * Functions to manipulate refinement lists
 *
 * The RefinementList is not formally defined through a prototype but is based
 * on a specific structure.
 *
 * @module SearchParameters.refinementList
 *
 * @typedef {string[]} SearchParameters.refinementList.Refinements
 * @typedef {Object.<string, SearchParameters.refinementList.Refinements>} SearchParameters.refinementList.RefinementList
 */

var defaultsPure = require('../functions/defaultsPure');
var omit = require('../functions/omit');
var objectHasKeys = require('../functions/objectHasKeys');

var lib = {
  /**
   * Adds a refinement to a RefinementList
   * @param {RefinementList} refinementList the initial list
   * @param {string} property the property to refine
   * @param {string} value the value of the refinement, if the value is not a string it will be converted
   * @return {RefinementList} a new and updated refinement list
   */
  addRefinement: function addRefinement(refinementList, property, value) {
    if (lib.isRefined(refinementList, property, value)) {
      return refinementList;
    }

    var valueAsString = '' + value;

    var facetRefinement = !refinementList[property] ?
      [valueAsString] :
      refinementList[property].concat(valueAsString);

    var mod = {};

    mod[property] = facetRefinement;

    return defaultsPure({}, mod, refinementList);
  },
  /**
   * Removes refinement(s) for an property:
   *  - if the value is specified removes the refinement for the value on the property
   *  - if no value is specified removes all the refinements for this property
   * @param {RefinementList} refinementList the initial list
   * @param {string} property the property to refine
   * @param {string} [value] the value of the refinement
   * @return {RefinementList} a new and updated refinement lst
   */
  removeRefinement: function removeRefinement(refinementList, property, value) {
    if (value === undefined) {
      // we use the "filter" form of clearRefinement, since it leaves empty values as-is
      // the form with a string will remove the property completely
      return lib.clearRefinement(refinementList, function(v, f) {
        return property === f;
      });
    }

    var valueAsString = '' + value;

    return lib.clearRefinement(refinementList, function(v, f) {
      return property === f && valueAsString === v;
    });
  },
  /**
   * Toggles the refinement value for an property.
   * @param {RefinementList} refinementList the initial list
   * @param {string} property the property to refine
   * @param {string} value the value of the refinement
   * @return {RefinementList} a new and updated list
   */
  toggleRefinement: function toggleRefinement(refinementList, property, value) {
    if (value === undefined) throw new Error('toggleRefinement should be used with a value');

    if (lib.isRefined(refinementList, property, value)) {
      return lib.removeRefinement(refinementList, property, value);
    }

    return lib.addRefinement(refinementList, property, value);
  },
  /**
   * Clear all or parts of a RefinementList. Depending on the arguments, three
   * kinds of behavior can happen:
   *  - if no property is provided: clears the whole list
   *  - if an property is provided as a string: clears the list for the specific property
   *  - if an property is provided as a function: discards the elements for which the function returns true
   * @param {RefinementList} refinementList the initial list
   * @param {string} [property] the property or function to discard
   * @param {string} [refinementType] optional parameter to give more context to the property function
   * @return {RefinementList} a new and updated refinement list
   */
  clearRefinement: function clearRefinement(refinementList, property, refinementType) {
    if (property === undefined) {
      if (!objectHasKeys(refinementList)) {
        return refinementList;
      }
      return {};
    } else if (typeof property === 'string') {
      return omit(refinementList, [property]);
    } else if (typeof property === 'function') {
      var hasChanged = false;

      var newRefinementList = Object.keys(refinementList).reduce(function(memo, key) {
        var values = refinementList[key] || [];
        var facetList = values.filter(function(value) {
          return !property(value, key, refinementType);
        });

        if (facetList.length !== values.length) {
          hasChanged = true;
        }
        memo[key] = facetList;

        return memo;
      }, {});

      if (hasChanged) return newRefinementList;
      return refinementList;
    }
  },
  /**
   * Test if the refinement value is used for the property. If no refinement value
   * is provided, test if the refinementList contains any refinement for the
   * given property.
   * @param {RefinementList} refinementList the list of refinement
   * @param {string} property name of the property
   * @param {string} [refinementValue] value of the filter/refinement
   * @return {boolean}
   */
  isRefined: function isRefined(refinementList, property, refinementValue) {
    var containsRefinements = !!refinementList[property] &&
      refinementList[property].length > 0;

    if (refinementValue === undefined || !containsRefinements) {
      return containsRefinements;
    }

    var refinementValueAsString = '' + refinementValue;

    return refinementList[property].indexOf(refinementValueAsString) !== -1;
  }
};

module.exports = lib;
