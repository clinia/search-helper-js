'use strict';

var merge = require('lodash/merge');

var requestBuilder = {
  /**
   * Get all the queries to send to the client, those queries can used directly
   * with the Clinia client.
   * @private
   * @return {object[]} The queries
   */
  _getQueries: function getQueries(index, state) {
    var queries = [];

    // One query for the hits
    queries.push({
      indexName: index,
      params: requestBuilder._getHitsSearchParams(state)
    });

    return queries;
  },

  /**
   * Build search parameters used to fetch hits
   * @private
   * @return {object.<string, any>}
   */
  _getHitsSearchParams: function(state) {
    var additionalParams = {}
    return merge(state.getQueryParams(), additionalParams);
  },

};

module.exports = requestBuilder;