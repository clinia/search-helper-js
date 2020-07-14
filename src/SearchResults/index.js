'use strict';

var defaultsPure = require('../functions/defaultsPure');
var orderBy = require('../functions/orderBy');
var compact = require('../functions/compact');
var find = require('../functions/find');
var formatSort = require('../functions/formatSort');

/**
 * @typedef SearchResults.Facet
 * @type {object}
 * @property {string} name name of the property in the record
 * @property {object} data the faceting data: value, number of entries
 * @property {object} stats undefined unless facet_stats is retrieved from clinia
 */

 /**
 * @typedef SearchResults.FacetValue
 * @type {object}
 * @property {string} name the facet value itself
 * @property {number} count times this facet appears in the results
 * @property {boolean} isRefined is the facet currently selected
 * @property {boolean} isExcluded is the facet currently excluded (only for conjunctive facets)
 */

 /**
 * @typedef Refinement
 * @type {object}
 * @property {string} type the type of filter used:
 * `facet`, `exclude`, `disjunctive`
 * @property {string} propertyName name of the property used for filtering
 * @property {string} name the value of the filter
 * @property {number} count the number of computed hits for this filter. Only on facets.
 * @property {boolean} exhaustive if the count is exhaustive
 */

 /**
 * @param {string[]} properties
 */
function getIndices(properties) {
  var indices = {};

  properties.forEach(function(val, idx) {
    indices[val] = idx;
  });

  return indices;
}

/*eslint-disable */
/**
 * Constructor for SearchResults
 * @class
 * @classdesc SearchResults contains the results of a query to Clinia using the
 * {@link CliniaSearchHelper}.
 * @param {SearchParameters} state state that led to the response
 * @param {array.<object>} results the results from clinia client
 * @example <caption>SearchResults of the first query in
 {
   "index": "clinic"
   "query": "",
   "page": 0,
   "perPage": 20,
   "numPages": 50,
   "total": 8904,
   "took": 2,
   "facets": [
     {
       "name": "type",
       "data": {
         "Pharmacy": 2345,
         "CLSC": 200
       },
       "exhaustive": false
     }
   ],
   "disjunctiveFacets": [
     {
       "name": "service",
       "data": {
         "Vaccination": 300,
         ""
       },
       "exhaustive": false
     }
   ]
   "hits": [
     {
       "id": "b1259901-cbd9-422b-8144-b24d84126794",
        "_geoPoint": {
            "lon": -73.5639752,
            "lat": 45.5287923
        },
        "name": "Clinique de Dermatologie - Clinique 1851",
        "phones": [
            {
                "number": "+15145218333",
                "extension": null,
                "type": "MAIN"
            },
            {
                "number": "+15145214175",
                "extension": null,
                "type": "FAX"
            }
        ],
        "services": {
            "en": [
                "Dermatology"
            ],
            "fr": [
                "Dermatologie"
            ]
        },
        "_highlight": {
            "name": {
                "value": "<strong>Clinique</strong> de Dermatologie - <strong>Clinique</strong> <strong>1851</strong>"
            }
        }
     }
   ]
 }
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
   * all the hits that match the search parameters. It also contains _highlight,
   * which describe which and how the properties are matched.
   * @member {object[]}
   */
  this.hits = mainSubResponse.hits;

  /**
   * index where the results come from
   * @member {string}
   */
  this.index = mainSubResponse.meta.index;

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
   * true if the number of hits is exhaustive
   * @member {boolean}
   */
  this.exhaustiveTotal = mainSubResponse.meta.exhaustiveTotal;

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
   * sum of the processing time of all the queries
   * @member {number}
   */
  this.took = results.reduce(function(sum, result) {
    return result.meta.took === undefined
      ? sum
      : sum + result.meta.took;
  }, 0);

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

  /**
   * queryID is the unique identifier of the query used to generate the current search results.
   * This value is only available if the `clickAnalytics` search parameter is set to `true`.
   * @member {string}
   */
  this.queryID = mainSubResponse.meta.queryID;

  /**
   * disjunctive facets results
   * @member {SearchResults.Facet[]}
   */
  this.disjunctiveFacets = [];

  /**
   * other facets results
   * @member {SearchResults.Facet[]}
   */
  this.facets = [];

  var disjunctiveFacets = state.getRefinedDisjunctiveFacets();

  var facetsIndices = getIndices(state.facets);
  var disjunctiveFacetsIndices = getIndices(state.disjunctiveFacets);
  var nextDisjunctiveResult = 1;

  var self = this;
  // Since we send request only for disjunctive facets that have been refined,
  // we get the facets information from the first, general, response.

  var mainFacets = mainSubResponse.facets || {};

  Object.keys(mainFacets).forEach(function(facetKey) {
    var facetValueObject = mainFacets[facetKey];


    var isFacetDisjunctive = state.disjunctiveFacets.indexOf(facetKey) !== -1;
    var isFacetConjunctive = state.facets.indexOf(facetKey) !== -1;
    var position;

    if (isFacetDisjunctive) {
      position = disjunctiveFacetsIndices[facetKey];
      self.disjunctiveFacets[position] = {
        name: facetKey,
        data: facetValueObject,
        exhaustive: mainSubResponse.meta.exhaustiveFacetsCount
      };
    }
    if (isFacetConjunctive) {
      position = facetsIndices[facetKey];
      self.facets[position] = {
        name: facetKey,
        data: facetValueObject,
        exhaustive: mainSubResponse.meta.exhaustiveFacetsCount
      };
    }
  });

  // aggregate the refined disjunctive facets
  disjunctiveFacets.forEach(function() {
    var result = results[nextDisjunctiveResult];
    var facets = result && result.facets ? result.facets : {};

    // There should be only item in facets.
    Object.keys(facets).forEach(function(dfacet) {
      var facetResults = facets[dfacet];

      var position;


      position = disjunctiveFacetsIndices[dfacet];

      var dataFromMainRequest = mainSubResponse.facets && mainSubResponse.facets[dfacet] || {};

      self.disjunctiveFacets[position] = {
        name: dfacet,
        data: defaultsPure({}, facetResults, dataFromMainRequest),
        exhaustive: result.meta.exhaustiveFacetsCount
      };


      if (state.disjunctiveFacetsRefinements[dfacet]) {
        state.disjunctiveFacetsRefinements[dfacet].forEach(function(refinementValue) {
            // add the disjunctive refinements if it is no more retrieved
          if (!self.disjunctiveFacets[position].data[refinementValue] &&
              state.disjunctiveFacetsRefinements[dfacet].indexOf(refinementValue) > -1) {
            self.disjunctiveFacets[position].data[refinementValue] = 0;
          }
        });
      }
    });
    nextDisjunctiveResult++;
  });

  // add the excludes
  Object.keys(state.facetsExcludes).forEach(function(facetName) {
    var excludes = state.facetsExcludes[facetName];
    var position = facetsIndices[facetName];

    self.facets[position] = {
      name: facetName,
      data: mainSubResponse.facets[facetName],
      exhaustive: mainSubResponse.meta.exhaustiveFacetsCount
    };
    excludes.forEach(function(facetValue) {
      self.facets[position] = self.facets[position] || {name: facetName};
      self.facets[position].data = self.facets[position].data || {};
      self.facets[position].data[facetValue] = 0;
    });
  });

  /**
   * @type {Array}
   */
  this.facets = compact(this.facets);

  /**
   * @type {Array}
   */
  this.disjunctiveFacets = compact(this.disjunctiveFacets);

  this._state = state;
}

/**
 * Get a facet object with its name
 * @param {string} name name of the faceted attribute
 * @return {SearchResults.Facet} the facet object
 */
SearchResults.prototype.getFacetByName = function(name) {
  function predicate(facet) {
    return facet.name === name;
  }

  return find(this.facets, predicate) ||
    find(this.disjunctiveFacets, predicate);
};

/**
 * Get the facet values of a specified property from a SearchResults object.
 * @private
 * @param {SearchResults} results the search results to search in
 * @param {string} property name of the faceted property to search for
 * @return {array|object} facet values. For the hierarchical facets it is an object.
 */
function extractNormalizedFacetValues(results, property) {
  function predicate(facet) {
    return facet.name === property;
  }

  if (results._state.isConjunctiveFacet(property)) {
    var facet = find(results.facets, predicate);
    if (!facet) return [];

    return Object.keys(facet.data).map(function(name) {
      return {
        name: name,
        count: facet.data[name],
        isRefined: results._state.isFacetRefined(property, name),
        isExcluded: results._state.isExcludeRefined(property, name)
      };
    });
  } else if (results._state.isDisjunctiveFacet(property)) {
    var disjunctiveFacet = find(results.disjunctiveFacets, predicate);
    if (!disjunctiveFacet) return [];

    return Object.keys(disjunctiveFacet.data).map(function(name) {
      return {
        name: name,
        count: disjunctiveFacet.data[name],
        isRefined: results._state.isDisjunctiveFacetRefined(property, name)
      };
    });
  }
}

SearchResults.DEFAULT_SORT = ['isRefined:desc', 'count:desc', 'name:asc'];

/**
 * Get a the list of values for a given facet property. Those values are sorted
 * refinement first, descending count (bigger value on top), and name ascending
 * (alphabetical order). The sort formula can overridden using either string based
 * predicates or a function.
 *
 * This method will return all the values returned by the Clinia engine plus all
 * the values already refined. This means that it can happen that the
 * `maxValuesPerFacet` configuration
 * might not be respected if you have facet values that are already refined.
 * @param {string} property property name
 * @param {object} opts configuration options.
 * @param {Array.<string> | function} opts.sortBy
 * When using strings, it consists of
 * the name of the [FacetValue](#SearchResults.FacetValue) properties with the
 * order (`asc` or `desc`). For example to order the value by count, the
 * argument would be `['count:asc']`.
 *
 * If only the property name is specified, the ordering defaults to the one
 * specified in the default value for this property.
 *
 * When not specified, the order is
 * ascending.  This parameter can also be a function which takes two facet
 * values and should return a number, 0 if equal, 1 if the first argument is
 * bigger or -1 otherwise.
 *
 * The default value for this property `['isRefined:desc', 'count:desc', 'name:asc']`
 * @return {FacetValue[]|undefined} depending on the type of facet of
 * the property requested (disjunctive or conjunctive)
 * @example
 * helper.on('result', function(event){
 *   //get values ordered only by name ascending using the string predicate
 *   event.results.getFacetValues('city', {sortBy: ['name:asc']});
 *   //get values  ordered only by count ascending using a function
 *   event.results.getFacetValues('city', {
 *     // this is equivalent to ['count:asc']
 *     sortBy: function(a, b) {
 *       if (a.count === b.count) return 0;
 *       if (a.count > b.count)   return 1;
 *       if (b.count > a.count)   return -1;
 *     }
 *   });
 * });
 */
SearchResults.prototype.getFacetValues = function(property, opts) {
  var facetValues = extractNormalizedFacetValues(this, property);
  if (!facetValues) {
    return undefined;
  }

  var options = defaultsPure({}, opts, {sortBy: SearchResults.DEFAULT_SORT});

  if (Array.isArray(options.sortBy)) {
    var order = formatSort(options.sortBy, SearchResults.DEFAULT_SORT);
    if (Array.isArray(facetValues)) {
      return orderBy(facetValues, order[0], order[1]);
    }
  } else if (typeof options.sortBy === 'function') {
    if (Array.isArray(facetValues)) {
      return facetValues.sort(options.sortBy);
    }
  }
  throw new Error(
    'options.sortBy is optional but if defined it must be ' +
    'either an array of string (predicates) or a sorting function'
  );
};

/**
 * Returns all refinements for all filters + tags. It also provides
 * additional information: count and exhaustiveness for each filter.
 *
 * See the [refinement type](#Refinement) for an exhaustive view of the available
 * data.
 *
 * @return {Array.<Refinement>} all the refinements
 */
SearchResults.prototype.getRefinements = function() {
  var state = this._state;
  var results = this;
  var res = [];

  Object.keys(state.facetsRefinements).forEach(function(propertyName) {
    state.facetsRefinements[propertyName].forEach(function(name) {
      res.push(getRefinement(state, 'facet', propertyName, name, results.facets));
    });
  });

  Object.keys(state.facetsExcludes).forEach(function(propertyName) {
    state.facetsExcludes[propertyName].forEach(function(name) {
      res.push(getRefinement(state, 'exclude', propertyName, name, results.facets));
    });
  });

  Object.keys(state.disjunctiveFacetsRefinements).forEach(function(propertyName) {
    state.disjunctiveFacetsRefinements[propertyName].forEach(function(name) {
      res.push(getRefinement(state, 'disjunctive', propertyName, name, results.disjunctiveFacets));
    });
  });

  Object.keys(state.numericRefinements).forEach(function(attributeName) {
    var operators = state.numericRefinements[attributeName];
    Object.keys(operators).forEach(function(operator) {
      operators[operator].forEach(function(value) {
        res.push({
          type: 'numeric',
          attributeName: attributeName,
          name: value,
          numericValue: value,
          operator: operator
        });
      });
    });
  });

  return res;
};

/**
 * @typedef {Object} Facet
 * @property {string} name
 * @property {Object} data
 * @property {boolean} exhaustive
 */

/**
 * @param {*} state
 * @param {*} type
 * @param {string} propertyName
 * @param {*} name
 * @param {Facet[]} resultsFacets
 */
function getRefinement(state, type, propertyName, name, resultsFacets) {
  var facet = find(resultsFacets, function(f) {
    return f.name === propertyName;
  });
  var count = facet && facet.data && facet.data[name] ? facet.data[name] : 0;
  var exhaustive = (facet && facet.exhaustive) || false;

  return {
    type: type,
    propertyName: propertyName,
    name: name,
    count: count,
    exhaustive: exhaustive
  };
}

module.exports = SearchResults;
