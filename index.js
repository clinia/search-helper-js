'use strict';

var CliniaSearchHelper = require('./src/cliniasearch.helper');

var SearchParameters = require('./src/SearchParameters');
var SearchResults = require('./src/SearchResults');

/**
 * The cliniasearchHelper module is the function that will let its
 * contains everything needed to use the Cliniasearch
 * Helper. It is a also a function that instanciate the helper.
 * To use the helper, you also need the Clinia JS client v1.
 * @example
 * //using the UMD build
 * var client = cliniasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
 * var helper = cliniasearchHelper(client, 'bestbuy', {
 *   facets: ['shipping'],
 * });
 * helper.on('result', function(result) {
 *   console.log(result);
 * });
 * helper
 *   .toggleFacetRefinement('category', 'Movies & TV Shows')
 *   .toggleFacetRefinement('shipping', 'Free shipping')
 *   .search();
 * @example
 * // The helper is an event emitter using the node API
 * helper.on('result', updateTheResults);
 * helper.once('result', updateTheResults);
 * helper.removeListener('result', updateTheResults);
 * helper.removeAllListeners('result');
 * @module cliniasearchHelper
 * @param  {CliniaSearch} client an CliniaSearch client
 * @param  {string} index the name of the index to query
 * @param  {SearchParameters|object} opts an object defining the initial config of the search. It doesn't have to be a {SearchParameters}, just an object containing the properties you need from it.
 * @return {CliniaSearchHelper}
 */
function cliniasearchHelper(client, index, opts) {
  return new CliniaSearchHelper(client, index, opts);
}

/**
 * The version currently used
 * @member module:cliniasearchHelper.version
 * @type {number}
 */
cliniasearchHelper.version = require('./src/version.js');

/**
 * Constructor for the Helper.
 * @member module:cliniasearchHelper.CliniaSearchHelper
 * @type {CliniaSearchHelper}
 */
cliniasearchHelper.CliniaSearchHelper = CliniaSearchHelper;

/**
 * Constructor for the object containing all the parameters of the search.
 * @member module:cliniasearchHelper.SearchParameters
 * @type {SearchParameters}
 */
cliniasearchHelper.SearchParameters = SearchParameters;

/**
 * Constructor for the object containing the results of the search.
 * @member module:cliniasearchHelper.SearchResults
 * @type {SearchResults}
 */
cliniasearchHelper.SearchResults = SearchResults;

/**
 * URL tools to generate query string and parse them from/into
 * SearchParameters
 * @member module:cliniasearchHelper.url
 * @type {object} {@link url}
 *
 */
cliniasearchHelper.url = require('./src/url');

module.exports = cliniasearchHelper;