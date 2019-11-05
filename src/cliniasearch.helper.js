'use strict';

var SearchParameters = require('./SearchParameters');
var SearchResults = require('./SearchResults');
var DerivedHelper = require('./DerivedHelper');
var requestBuilder = require('./requestBuilder');

var events = require('events');
var inherits = require('./functions/inherits');

var flatten = require('lodash/flatten');
var forEach = require('lodash/forEach');
var isEmpty = require('lodash/isEmpty');
var map = require('lodash/map');

var url = require('./url');
var version = require('./version');

/**
 * Event triggered when a parameter is set or updated
 * @event CliniaSearchHelper#event:change
 * @property {SearchParameters} state the current parameters with the latest changes applied
 * @property {SearchResults} lastResults the previous results received from Clinia. `null` before
 * the first request
 * @example
 * helper.on('change', function(state, lastResults) {
  *   console.log('The parameters have changed');
  * });
  */
 
 /**
  * Event triggered when a main search is sent to Clinia
  * @event CliniaSearchHelper#event:search
  * @property {SearchParameters} state the parameters used for this search
  * @property {SearchResults} lastResults the results from the previous search. `null` if
  * it is the first search.
  * @example
  * helper.on('search', function(state, lastResults) {
  *   console.log('Search sent');
  * });
  */

/**
 * Event triggered when a search using `searchOnce` is sent to Clinia
 * @event CliniaSearchHelper#event:searchOnce
 * @property {SearchParameters} state the parameters used for this search
 * it is the first search.
 * @example
 * helper.on('searchOnce', function(state) {
  *   console.log('searchOnce sent');
  * });
  */
 
 /**
  * Event triggered when the results are retrieved from Clinia
  * @event CliniaSearchHelper#event:result
  * @property {SearchResults} results the results received from Clinia
  * @property {SearchParameters} state the parameters used to query Clinia. Those might
  * be different from the one in the helper instance (for example if the network is unreliable).
  * @example
  * helper.on('result', function(results, state) {
  *   console.log('Search results received');
  * });
  */
 
 /**
  * Event triggered when Clinia sends back an error. For example, if an unknown parameter is
  * used, the error can be caught using this event.
  * @event CliniaSearchHelper#event:error
  * @property {Error} error the error returned by the Clinia.
  * @example
  * helper.on('error', function(error) {
  *   console.log('Houston we got a problem.');
  * });
  */
 
 /**
  * Event triggered when the queue of queries have been depleted (with any result or outdated queries)
  * @event CliniaSearchHelper#event:searchQueueEmpty
  * @example
  * helper.on('searchQueueEmpty', function() {
  *   console.log('No more search pending');
  *   // This is received before the result event if we're not expecting new results
  * });
  *
  * helper.search();
  */
 

/**
 * Initialize a new CliniaSearchHelper
 * @class
 * @classdesc The CliniaSearchHelper is a class that ease the management of the
 * search. It provides an event based interface for search callbacks:
 *  - change: when the internal search state is changed.
 *    This event contains a {@link SearchParameters} object and the
 *    {@link SearchResults} of the last result if any.
 *  - search: when a search is triggered using the `search()` method.
 *  - result: when the response is retrieved from Clinia and is processed.
 *    This event contains a {@link SearchResults} object and the
 *    {@link SearchParameters} corresponding to this answer.
 *  - error: when the response is an error. This event contains the error returned by the server.
 * @param  {CliniaSearch} client an CliniaSearch client
 * @param  {string} index the index name to query
 * @param  {SearchParameters | object} options an object defining the initial
 * config of the search. It doesn't have to be a {SearchParameters},
 * just an object containing the properties you need from it.
 */
function CliniaSearchHelper(client, index, options) {
  if (client.addCliniaAgent && !doesClientAgentContainsHelper(client)) {
    client.addCliniaAgent('JS Helper (' + version + ')');
  }

  this.setClient(client);
  var opts = options || {};
  opts.index = index;
  this.state = SearchParameters.make(opts);
  this.lastResults = null;
  this._queryId = 0;
  this._lastQueryIdReceived = -1;
  this.derivedHelpers = [];
  this._currentNbQueries = 0;
}

inherits(CliniaSearchHelper, events.EventEmitter);

/**
 * Start the search with the parameters set in the state. When the
 * method is called, it triggers a `search` event. The results will
 * be available through the `result` event. If an error occurs, an
 * `error` will be fired instead.
 * @return {CliniaSearchHelper}
 * @fires search
 * @fires result
 * @fires error
 * @chainable
 */
CliniaSearchHelper.prototype.search = function() {
  this._search();
  return this;
};

/**
 * Gets the search query parameters that would be sent to the Clinia Client
 * for the hits
 * @return {object} Query Parameters
 */
CliniaSearchHelper.prototype.getQuery = function() {
  var state = this.state;
  return requestBuilder._getHitsSearchParams(state);
};

/**
 * Start a search using a modified version of the current state. This method does
 * not trigger the helper lifecycle and does not modify the state kept internally
 * by the helper. This second aspect means that the next search call will be the
 * same as a search call before calling searchOnce.
 * @param {object} options can contain all the parameters that can be set to SearchParameters
 * plus the index
 * @param {function} [callback] optional callback executed when the response from the
 * server is back.
 * @return {promise|undefined} if a callback is passed the method returns undefined
 * otherwise it returns a promise containing an object with two keys :
 *  - content with a SearchResults
 *  - state with the state used for the query as a SearchParameters
 * @example
 * // Changing the number of records returned per page to 1
 * // This example uses the callback API
 * var state = helper.searchOnce({hitsPerPage: 1},
 *   function(error, content, state) {
 *     // if an error occurred it will be passed in error, otherwise its value is null
 *     // content contains the results formatted as a SearchResults
 *     // state is the instance of SearchParameters used for this search
 *   });
 * @example
 * // Changing the number of records returned per page to 1
 * // This example uses the promise API
 * var state1 = helper.searchOnce({hitsPerPage: 1})
 *                 .then(promiseHandler);
 *
 * function promiseHandler(res) {
 *   // res contains
 *   // {
 *   //   content : SearchResults
 *   //   state   : SearchParameters (the one used for this specific search)
 *   // }
 * }
 */
CliniaSearchHelper.prototype.searchOnce = function(options, cb) {
  var tempState = !options ? this.state : this.state.setQueryParameters(options);
  var queries = requestBuilder._getQueries(tempState.index, tempState);
  var self = this;

  this._currentNbQueries++;

  this.emit('searchOnce', tempState);

  if (cb) {
    this.client
      .search(queries)
      .then(function(content) {
        self._currentNbQueries--;
        if (self._currentNbQueries === 0) {
          self.emit('searchQueueEmpty');
        }

        cb(null, new SearchResults(tempState, content.results), tempState);
      })
      .catch(function(err) {
        self._currentNbQueries--;
        if (self._currentNbQueries === 0) {
          self.emit('searchQueueEmpty');
        }

        cb(err, null, tempState);
      });

    return undefined;
  }

  return this.client.search(queries).then(function(content) {
    self._currentNbQueries--;
    if (self._currentNbQueries === 0) self.emit('searchQueueEmpty');
    return {
      content: new SearchResults(tempState, content.results),
      state: tempState,
      _originalResponse: content
    };
  }, function(e) {
    self._currentNbQueries--;
    if (self._currentNbQueries === 0) self.emit('searchQueueEmpty');
    throw e;
  });
};

/**
 * Sets the text query used for the search.
 *
 * This method resets the current page to 0.
 * @param  {string} q the user query
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 */
CliniaSearchHelper.prototype.setQuery = function(q) {
  this._change(this.state.setPage(0).setQuery(q));
  return this;
};

/**
 * Remove all the types of refinements except tags. A string can be provided to remove
 * only the refinements of a specific attribute. For more advanced use case, you can
 * provide a function instead. This function should follow the
 * [clearCallback definition](#SearchParameters.clearCallback).
 *
 * This method resets the current page to 0.
 * @param {string} [name] optional name of the facet / attribute on which we want to remove all refinements
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 * @example
 * // Removing all the refinements
 * helper.clearRefinements().search();
 * @example
 * // Removing all the filters on a the category attribute.
 * helper.clearRefinements('category').search();
 * @example
 * // Removing only the exclude filters on the category facet.
 * helper.clearRefinements(function(value, attribute, type) {
 *   return type === 'exclude' && attribute === 'category';
 * }).search();
 */
CliniaSearchHelper.prototype.clearRefinements = function(name) {
  this._change(this.state.setPage(0).clearRefinements(name));
  return this;
};

/**
 * Increments the page number by one.
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 * @example
 * helper.setPage(0).nextPage().getPage();
 * // returns 1
 */
CliniaSearchHelper.prototype.nextPage = function() {
  return this.setPage(this.state.page + 1);
};

/**
 * Decrements the page number by one.
 * @fires change
 * @return {CliniaSearchHelper}
 * @chainable
 * @example
 * helper.setPage(1).previousPage().getPage();
 * // returns 0
 */
CliniaSearchHelper.prototype.previousPage = function() {
  return this.setPage(this.state.page - 1);
};

/**
 * @private
 */
function setCurrentPage(page) {
  if (page < 0) throw new Error('Page requested below 0.');

  this._change(this.state.setPage(page));
  return this;
}

/**
 * Change the current page
 * @deprecated
 * @param  {number} page The page number
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 */
CliniaSearchHelper.prototype.setCurrentPage = setCurrentPage;

/**
 * Updates the current page.
 * @function
 * @param  {number} page The page number
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 */
CliniaSearchHelper.prototype.setPage = setCurrentPage;

/**
 * Updates the name of the index that will be targeted by the query.
 *
 * This method resets the current page to 0.
 * @param {string} name the index name
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 */
CliniaSearchHelper.prototype.setIndex = function(name) {
  this._change(this.state.setPage(0).setIndex(name));
  return this;
};

/**
 * Update a parameter of the search. This method reset the page
 *
 *
 * This method resets the current page to 0.
 * @param {string} parameter name of the parameter to update
 * @param {any} value new value of the parameter
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 * @example
 * helper.setQueryParameter('perPage', 20).search();
 */
CliniaSearchHelper.prototype.setQueryParameter = function(parameter, value) {
  this._change(this.state.setPage(0).setQueryParameter(parameter, value));
  return this;
};

/**
 * Set the whole state (warning: will erase previous state)
 * @param {SearchParameters} newState the whole new state
 * @return {CliniaSearchHelper}
 * @fires change
 * @chainable
 */
CliniaSearchHelper.prototype.setState = function(newState) {
  this._change(SearchParameters.make(newState));
  return this;
};

/**
 * Get the current search state stored in the helper. This object is immutable.
 * @param {string[]} [filters] optional filters to retrieve only a subset of the state
 * @return {SearchParameters|object} if filters is specified a plain object is
 * returned containing only the requested fields, otherwise return the unfiltered
 * state
 * @example
 * // Get the complete state as stored in the helper
 * helper.getState();
 * @example
 * // Get a part of the state with all the refinements on attributes and the query
 * helper.getState(['query', 'attribute:category']);
 */
CliniaSearchHelper.prototype.getState = function(filters) {
  if (filters === undefined) return this.state;
  return this.state.filter(filters);
};

/**
 * Get the name of the currently used index.
 * @return {string}
 * @example
 * helper.setIndex('health_facility').getIndex();
 * // returns 'highestPrice_products'
 */
CliniaSearchHelper.prototype.getIndex = function() {
  return this.state.index;
};

/**
 * Get a parameter of the search by its name. It is possible that a parameter is directly
 * defined in the index dashboard, but it will be undefined using this method.
 *
 * @param {string} parameterName the parameter name
 * @return {any} the parameter value
 * @example
 * var perPage = helper.getQueryParameter('perPage');
 */
CliniaSearchHelper.prototype.getQueryParameter = function(parameterName) {
  return this.state.getQueryParameter(parameterName);
};

// /////////// PRIVATE

/**
 * Perform the underlying queries
 * @private
 * @return {undefined}
 * @fires search
 * @fires result
 * @fires error
 */
CliniaSearchHelper.prototype._search = function() {
  var state = this.state;
  var mainQueries = requestBuilder._getQueries(state.index, state);

  var states = [{
    state: state,
    queriesCount: mainQueries.length,
    helper: this
  }];

  this.emit('search', state, this.lastResults);

  var derivedQueries = map(this.derivedHelpers, function(derivedHelper) {
    var derivedState = derivedHelper.getModifiedState(state);
    var queries = requestBuilder._getQueries(derivedState.index, derivedState);
    states.push({
      state: derivedState,
      queriesCount: queries.length,
      helper: derivedHelper
    });
    derivedHelper.emit('search', derivedState, derivedHelper.lastResults);
    return queries;
  });

  var queries = mainQueries.concat(flatten(derivedQueries));
  var queryId = this._queryId++;

  this._currentNbQueries++;

  try {
    this.client.search(queries)
      .then(this._dispatchCliniaResponse.bind(this, states, queryId))
      .catch(this._dispatchCliniaError.bind(this, queryId));
  } catch (err) {
    // If we reach this part, we're in an internal error state
    this.emit('error', err);
  }
};

/**
 * Transform the responses as sent by the server and transform them into a user
 * usable object that merge the results of all the batch requests. It will dispatch
 * over the different helper + derived helpers (when there are some).
 * @private
 * @param {array.<{SearchParameters, CliniaQueries, CliniaSearchHelper}>}
 *  state state used for to generate the request
 * @param {number} queryId id of the current request
 * @param {object} content content of the response
 * @return {undefined}
 */
CliniaSearchHelper.prototype._dispatchCliniaResponse = function(states, queryId, content) {
  // FIXME remove the number of outdated queries discarded instead of just one

  if (queryId < this._lastQueryIdReceived) {
    // Outdated answer
    return;
  }

  this._currentNbQueries -= (queryId - this._lastQueryIdReceived);
  this._lastQueryIdReceived = queryId;

  if (this._currentNbQueries === 0) this.emit('searchQueueEmpty');

  var results = content.results.slice();
  forEach(states, function(s) {
    var state = s.state;
    var queriesCount = s.queriesCount;
    var helper = s.helper;
    var specificResults = results.splice(0, queriesCount);

    var formattedResponse = helper.lastResults = new SearchResults(state, specificResults);
    helper.emit('result', formattedResponse, state);
  });
};

CliniaSearchHelper.prototype._dispatchCliniaError = function(queryId, err) {
  if (queryId < this._lastQueryIdReceived) {
    // Outdated answer
    return;
  }

  this._currentNbQueries -= queryId - this._lastQueryIdReceived;
  this._lastQueryIdReceived = queryId;

  this.emit('error', err);

  if (this._currentNbQueries === 0) this.emit('searchQueueEmpty');
};

CliniaSearchHelper.prototype._change = function(newState) {
  if (newState !== this.state) {
    this.state = newState;
    this.emit('change', this.state, this.lastResults);
  }
};

/**
 * Clears the cache of the underlying Clinia client.
 * @return {CliniaSearchHelper}
 */
CliniaSearchHelper.prototype.clearCache = function() {
  this.client.clearCache && this.client.clearCache();
  return this;
};

/**
 * Updates the internal client instance. If the reference of the clients
 * are equal then no update is actually done.
 * @param  {CliniaSearch} newClient an CliniaSearch client
 * @return {CliniaSearchHelper}
 */
CliniaSearchHelper.prototype.setClient = function(newClient) {
  if (this.client === newClient) return this;

  if (newClient.addCliniaAgent && !doesClientAgentContainsHelper(newClient)) {
    newClient.addCliniaAgent('JS Helper (' + version + ')');
  }
  this.client = newClient;

  return this;
};

/**
 * Gets the instance of the currently used client.
 * @return {CliniaSearch}
 */
CliniaSearchHelper.prototype.getClient = function() {
  return this.client;
};

/**
 * Creates an derived instance of the Helper. A derived helper
 * is a way to request other indices synchronised with the lifecycle
 * of the main Helper. This mechanism uses the multiqueries feature
 * of CLinia to aggregate all the requests in a single network call.
 *
 * This method takes a function that is used to create a new SearchParameter
 * that will be used to create requests to Clinia. Those new requests
 * are created just before the `search` event. The signature of the function
 * is `SearchParameters -> SearchParameters`.
 *
 * This method returns a new DerivedHelper which is an EventEmitter
 * that fires the same `search`, `result` and `error` events. Those
 * events, however, will receive data specific to this DerivedHelper
 * and the SearchParameters that is returned by the call of the
 * parameter function.
 * @param {function} fn SearchParameters -> SearchParameters
 * @return {DerivedHelper}
 */
CliniaSearchHelper.prototype.derive = function(fn) {
  var derivedHelper = new DerivedHelper(this, fn);
  this.derivedHelpers.push(derivedHelper);
  return derivedHelper;
};

/**
 * This method detaches a derived Helper from the main one. Prefer using the one from the
 * derived helper itself, to remove the event listeners too.
 * @private
 * @return {undefined}
 * @throws Error
 */
CliniaSearchHelper.prototype.detachDerivedHelper = function(derivedHelper) {
  var pos = this.derivedHelpers.indexOf(derivedHelper);
  if (pos === -1) throw new Error('Derived helper already detached');
  this.derivedHelpers.splice(pos, 1);
};

/**
 * This method returns true if there is currently at least one on-going search.
 * @return {boolean} true if there is a search pending
 */
CliniaSearchHelper.prototype.hasPendingRequests = function() {
  return this._currentNbQueries > 0;
};

/*
 * This function tests if the _ua parameter of the client
 * already contains the JS Helper UA
 */
function doesClientAgentContainsHelper(client) {
  // this relies on JS Client internal variable, this might break if implementation changes
  var currentAgent = client._ua;
  return !currentAgent ? false :
    currentAgent.indexOf('JS Helper') !== -1;
}

module.exports = CliniaSearchHelper;