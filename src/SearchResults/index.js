'use strict';

// var forEach = require('lodash/forEach');
// var compact = require('lodash/compact');
// var indexOf = require('lodash/indexOf');
// var findIndex = require('lodash/findIndex');
// var get = require('lodash/get');

// var sumBy = require('lodash/sumBy');
// var find = require('lodash/find');
// var includes = require('lodash/includes');
// var map = require('lodash/map');
// var orderBy = require('lodash/orderBy');

// var defaults = require('lodash/defaults');
// var merge = require('lodash/merge');

// var isFunction = require('lodash/isFunction');

// var partial = require('lodash/partial');
// var partialRight = require('lodash/partialRight');

// function getIndices(obj) {
//   var indices = {};

//   forEach(obj, function(val, idx) { indices[val] = idx; });

//   return indices;
// }

/* eslint-disable */
/**
 * Constructor for SearchResults
 * @class
 * @classdesc SearchResults contains the results of a query to Clinia using the
 * {@link CliniaSearchHelper}.
 * @param {SearchParameters} state state that led to the response
 * @param {array.<object>} results the results from clinia client
 */
/* eslint-enable */
function SearchResults(state, results) {
  var mainSubResponse = results[0];

  this._rawResults = results;

  /**
   * query used to generate the results
   * @member {string}
   */
  this.query = mainSubResponse.meta.query;

  /**
   * all the records that match the search parameters. It also contains _highlightResult,
   * which describe which and how the attributes are matched.
   * @member {object[]}
   */
  this.records = mainSubResponse.records;

  /**
   * index where the results come from
   * @member {string}
   */
  this.index = mainSubResponse.index;

  /**
   * number of hits per page requested
   * @member {number}
   */
  this.perPage = mainSubResponse.meta.perPage;

  /**
   * total number of hits of this query on the index
   * @member {number}
   */
  this.total = mainSubResponse.meta.total;

  /**
   * total number of pages with respect to the number of hits per page and the total number of hits
   * @member {number}
   */
  this.numPages = mainSubResponse.meta.numPages;

  /**
   * current page
   * @member {number}
   */
  this.page = mainSubResponse.meta.page;

  /**
   * The position if the position was guessed by IP.
   * @member {string}
   * @example "48.8637,2.3615",
   */
  this.aroundLatLng = mainSubResponse.meta.aroundLatLng;

  /**
   * The radius computed by Clinia.
   * @member {string}
   * @example "126792922",
   */
  this.automaticRadius = mainSubResponse.meta.automaticRadius;

  this._state = state;
}

module.exports = SearchResults;
