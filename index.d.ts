import {
  SearchOptions,
  SearchResponse
} from '@clinia/client-search';
import { EventEmitter } from 'events';

type DummySearchClientV2 = {
  readonly addCliniaAgent: (segment: string, version?: string) => void;
};

type SearchClient = Pick<Client, 'search'>;

/**
 * The searchHelper module is the function that will let its
 * contains everything needed to use the Search
 * Helper. It is a also a function that instantiate the helper.
 * To use the helper, you also need the Clinia JS client v2.
 * @param client a Clinia search client
 * @param index the name of the index to query
 * @param opts
 */
declare function searchHelper(
  client: SearchClient,
  index: string,
  opts?: searchHelper.PlainSearchParameters
): searchHelper.CliniaSearchHelper;

declare namespace searchHelper {
  export const version: string;

  export class CliniaSearchHelper extends EventEmitter {
    state: SearchParameters;
    lastResults: SearchResults | null;
    derivedHelpers: DerivedHelper[];

    on(
      event: 'search',
      cb: (res: { state: SearchParameters; results: SearchResults }) => void
    ): this;
    on(
      event: 'change',
      cb: (res: {
        state: SearchParameters;
        results: SearchResults;
        isPageReset: boolean;
      }) => void
    ): this;
    on(
      event: 'searchOnce',
      cb: (res: { state: SearchParameters }) => void
    ): this;
    on(
      event: 'result',
      cb: (res: { results: SearchResults; state: SearchParameters }) => void
    ): this;
    on(event: 'error', cb: (res: { error: Error }) => void): this;
    on(event: 'searchQueueEmpty', cb: () => void): this;

    /**
     * Start the search with the parameters set in the state. When the
     * method is called, it triggers a `search` event. The results will
     * be available through the `result` event. If an error occurs, an
     * `error` will be fired instead.
     * @return
     * @fires search
     * @fires result
     * @fires error
     * @chainable
     */
    search(): this;

    /**
     * Private method to only search on derived helpers
     */
    searchOnlyWithDerivedHelpers(): this;

    /**
     * Gets the search query parameters that would be sent to the Clinia Client
     * for the hits
     */
    getQuery(): SearchOptions;

    /**
     * Start a search using a modified version of the current state. This method does
     * not trigger the helper lifecycle and does not modify the state kept internally
     * by the helper. This second aspect means that the next search call will be the
     * same as a search call before calling searchOnce.
     * @param options can contain all the parameters that can be set to SearchParameters
     * plus the index
     * @param [callback] optional callback executed when the response from the
     * server is back.
     * @return if a callback is passed the method returns undefined
     * otherwise it returns a promise containing an object with two keys :
     *  - content with a SearchResults
     *  - state with the state used for the query as a SearchParameters
     * @example
     * // Changing the number of hits returned per page to 1
     * // This example uses the callback API
     * var state = helper.searchOnce({perPage: 1},
     *   function(error, content, state) {
     *     // if an error occurred it will be passed in error, otherwise its value is null
     *     // content contains the results formatted as a SearchResults
     *     // state is the instance of SearchParameters used for this search
     *   });
     * @example
     * // Changing the number of hits returned per page to 1
     * // This example uses the promise API
     * var state1 = helper.searchOnce({perPage: 1})
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
    searchOnce(
      options: PlainSearchParameters
    ): Promise<{ content: SearchResults; state: SearchParameters }>;
    searchOnce(
      options: PlainSearchParameters,
      cb: (
        error: Error,
        content: SearchResults,
        state: SearchParameters
      ) => void
    ): void;

    /**
     * Sets the text query used for the search.
     *
     * This method resets the current page to 0.
     * @param  q the user query
     * @return
     * @fires change
     * @chainable
     */
    setQuery(q: string): this;

    /**
     * Remove all the types of refinements. A string can be provided to remove
     * only the refinements of a specific property. For more advanced use case, you can
     * provide a function instead. This function should follow the
     * [clearCallback definition](#SearchParameters.clearCallback).
     *
     * This method resets the current page to 0.
     * @param [name] optional name of the facet / property on which we want to remove all refinements
     * @return
     * @fires change
     * @chainable
     * @example
     * // Removing all the refinements
     * helper.clearRefinements().search();
     * @example
     * // Removing all the filters on a the category property.
     * helper.clearRefinements('category').search();
     * @example
     * // Removing only the exclude filters on the category facet.
     * helper.clearRefinements(function(value, property, type) {
     *   return type === 'exclude' && property === 'category';
     * }).search();
     */
    clearRefinements(name?: string): this;
    clearRefinements(
      func: (value: any, property: string, type: string) => boolean
    ): this;

    /**
     * Updates the name of the index that will be targeted by the query.
     *
     * This method resets the current page to 0.
     * @param name the index name
     * @return
     * @fires change
     * @chainable
     */
    setIndex(name: string): this;

    addDisjunctiveFacetRefinement(...args: any[]): any;
    addNumericRefinement(...args: any[]): any;
    addFacetRefinement(...args: any[]): any;
    addFacetExclusion(...args: any[]): any;
    removeDisjunctiveFacetRefinement(...args: any[]): any;
    removeFacetRefinement(...args: any[]): any;
    removeFacetExclusion(...args: any[]): any;
    toggleFacetExclusion(...args: any[]): any;
    toggleFacetRefinement(...args: any[]): any;
    nextPage(...args: any[]): any;
    previousPage(...args: any[]): any;
    setPage(...args: any[]): any;
    setQueryParameter(...args: any[]): any;

    /**
     * Set the whole state (warning: will erase previous state)
     * @param newState the whole new state
     * @return
     * @fires change
     * @chainable
     */
    setState(newState: PlainSearchParameters): this;

    overrideStateWithoutTriggeringChangeEvent(...args: any[]): any;
    hasRefinements(...args: any[]): any;
    isExcluded(...args: any[]): any;
    isDisjunctiveRefined(...args: any[]): any;
    getIndex(...args: any[]): any;
    getPage(...args: any[]): any;
    getRefinements(...args: any[]): any;
    getNumericRefinement(...args: any[]): any;
    containsRefinement(...args: any[]): any;
    clearCache(...args: any[]): any;
    setClient(client: SearchClient): this;
    getClient(): SearchClient;
    derive(
      deriveFn: (oldParams: SearchParameters) => SearchParameters
    ): DerivedHelper;
    detachDerivedHelper(derivedHelper: DerivedHelper): void;
    hasPendingRequests(...args: any[]): any;
  }

  interface DerivedHelper extends EventEmitter {
    on(
      event: 'search',
      cb: (res: { state: SearchParameters; results: SearchResults }) => void
    ): this;
    on(
      event: 'result',
      cb: (res: { results: SearchResults; state: SearchParameters }) => void
    ): this;
    on(event: 'error', cb: (res: { error: Error }) => void): this;

    lastResults: SearchResults | null;
    detach(): void;
    getModifiedState(): SearchParameters;
  }

  export interface PlainSearchParameters extends SearchOptions {
    /**
     * Targeted index. This parameter is mandatory.
     */
    index?: string;
    
    /**
     * This property contains the list of all the disjunctive facets
     * used. This list will be added to requested facets in the
     * facets attribute sent to clinia.
     */
    disjunctiveFacets?: string[];

    // Refinements
    /**
     * This property contains all the filters that need to be
     * applied on the conjunctive facets. Each facet must be properly
     * defined in the `facets` property.
     *
     * The key is the name of the facet, and the `FacetList` contains all
     * filters selected for the associated facet name.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `facetFilters` property.
     */
    facetsRefinements?: { [facet: string]: SearchParameters.FacetList };
    
    /**
     * This property contains all the filters that need to be
     * excluded from the conjunctive facets. Each facet must be properly
     * defined in the `facets` property.
     *
     * The key is the name of the facet, and the `FacetList` contains all
     * filters excluded for the associated facet name.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `facetFilters` property.
     */
    facetsExcludes?: { [facet: string]: SearchParameters.FacetList };
    
    /**
     * This property contains all the filters that need to be
     * applied on the disjunctive facets. Each facet must be properly
     * defined in the `disjunctiveFacets` property.
     *
     * The key is the name of the facet, and the `FacetList` contains all
     * filters selected for the associated facet name.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `facetFilters` property.
     */
    disjunctiveFacetsRefinements?: {
      [facet: string]: SearchParameters.FacetList;
    };

    /**
     * This attribute contains all the filters that need to be
     * applied on the numeric properties.
     *
     * The key is the name of the property, and the value is the
     * filters to apply to this property.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `numericFilters` property.
     */
    numericRefinements?: { [facet: string]: SearchParameters.OperatorList };
  }

  export class SearchParameters implements PlainSearchParameters {
    managedParameters: [
      'index',
      'facets',
      'disjunctiveFacets',
      'facetsRefinements',
      'facetsExcludes',
      'disjunctiveFacetsRefinements',
      'numericRefinements'
    ];

    constructor(newParameters?: PlainSearchParameters);

    /* Add a disjunctive facet to the disjunctiveFacets property of the helper configuration, if it isn't already present. */
    addDisjunctiveFacet(facet: string): SearchParameters;
    /* Adds a refinement on a disjunctive facet. */
    addDisjunctiveFacetRefinement(
      facet: string,
      value: string
    ): SearchParameters;
    /* Exclude a value from a "normal" facet */
    addExcludeRefinement(facet: string, value: string): SearchParameters;
    /* Add a facet to the facets property of the helper configuration, if it isn't already present. */
    addFacet(facet: string): SearchParameters;
    /* Add a refinement on a "normal" facet */
    addFacetRefinement(facet: string, value: string): SearchParameters;
    addNumericRefinement(
      property: string,
      operator: SearchParameters.Operator,
      value: number | number[]
    ): SearchParameters;
    clearRefinements(
      property?:
        | string
        | ((value: any, property: string, type: string) => void)
    ): SearchParameters;
    getConjunctiveRefinements(facetName: string): string[];
    getDisjunctiveRefinements(facetName: string): string[];
    getExcludeRefinements(facetName: string): string[];
    getNumericRefinements(facetName: string): SearchParameters.OperatorList[];
    getNumericRefinement(
      property: string,
      operator: SearchParameters.Operator
    ): Array<number | number[]>;
    getQueryParams(): SearchOptions;
    getRefinedDisjunctiveFacets(facet: string, value: any): string[];
    getUnrefinedDisjunctiveFacets(): string[];
    isConjunctiveFacet(facet: string): boolean;
    isDisjunctiveFacetRefined(facet: string, value?: string): boolean;
    isDisjunctiveFacet(facet: string): boolean;
    isExcludeRefined(facet: string, value?: string): boolean;
    isFacetRefined(facet: string, value?: string): boolean;
    isNumericRefined(
      property: string,
      operator?: SearchParameters.Operator,
      value?: string
    ): boolean;
    static make(newParameters: PlainSearchParameters): SearchParameters;
    removeExcludeRefinement(facet: string, value: string): SearchParameters;
    removeFacet(facet: string): SearchParameters;
    removeFacetRefinement(facet: string, value?: string): SearchParameters;
    removeDisjunctiveFacet(facet: string): SearchParameters;
    removeDisjunctiveFacetRefinement(
      facet: string,
      value?: string
    ): SearchParameters;
    setDisjunctiveFacets(facets: string[]): SearchParameters;
    setFacets(facets: string[]): SearchParameters;
    setPerPage(n: number): SearchParameters;
    setIndex(index: string): SearchParameters;
    setPage(newPage: number): SearchParameters;
    setQueryParameters(params: PlainSearchParameters): SearchParameters;
    setQueryParameter(parameter: string, value: any): SearchParameters;
    setQuery(newQuery: string): SearchParameters;
    toggleDisjunctiveFacetRefinement(
      facet: string,
      value: any
    ): SearchParameters;
    toggleExcludeFacetRefinement(facet: string, value: any): SearchParameters;
    toggleConjunctiveFacetRefinement(
      facet: string,
      value: any
    ): SearchParameters;
    toggleFacetRefinement(facet: string, value: any): SearchParameters;
    static validate(
      currentState: SearchParameters,
      parameters: PlainSearchParameters
    ): null | Error;

    /**
     * implementation of PlainSearchParameters, copied because it's an interface.
     * Notable difference is that the managed search parameters are not optional,
     * ideally this would be Required<ManagedParameters> where ManagedParameters
     * are the following ones.
     */

    /**
     * Targeted index. This parameter is mandatory.
     */
    index: string;
    /**
     * This property contains the list of all the disjunctive facets
     * used. This list will be added to requested facets in the
     * facets property sent to clinia.
     */
    disjunctiveFacets: string[];

    // Refinements
    /**
     * This property contains all the filters that need to be
     * applied on the conjunctive facets. Each facet must be properly
     * defined in the `facets` property.
     *
     * The key is the name of the facet, and the `FacetList` contains all
     * filters selected for the associated facet name.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `facetFilters` property.
     */
    facetsRefinements: { [facet: string]: SearchParameters.FacetList };
    /**
     * This property contains all the filters that need to be
     * excluded from the conjunctive facets. Each facet must be properly
     * defined in the `facets` property.
     *
     * The key is the name of the facet, and the `FacetList` contains all
     * filters excluded for the associated facet name.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `facetFilters` property.
     */
    facetsExcludes: { [facet: string]: SearchParameters.FacetList };
    /**
     * This property contains all the filters that need to be
     * applied on the disjunctive facets. Each facet must be properly
     * defined in the `disjunctiveFacets` property.
     *
     * The key is the name of the facet, and the `FacetList` contains all
     * filters selected for the associated facet name.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `facetFilters` property.
     */
    disjunctiveFacetsRefinements: {
      [facet: string]: SearchParameters.FacetList;
    };

    /**
     * This property contains all the filters that need to be
     * applied on the numeric properties.
     *
     * The key is the name of the attribute, and the value is the
     * filters to apply to this property.
     *
     * When querying clinia, the values stored in this property will
     * be translated into the `numericFilters` property.
     */
    numericRefinements: { [facet: string]: SearchParameters.OperatorList };

    /* end implementation of PlainSearchParameters */

    /**
     * Implementation of regular search parameters, copied from clinia.QueryParameters
     * Ideally there'd be a way to automatically implement this interface, but that
     * isn't possible.
     */

    /**
     * Query string used to perform the search
     * default: ''
     */
    query?: string;

    /**
     * A string that contains the list of properties you want to retrieve in order to minimize the size of the JSON answer.
     * default: *
     */
    properties?: string[];
    
    /**
     * List of properties you want to use for textual search
     * default: all
     */
    searchProperties?: string[];

    /**
     * You can use facets to retrieve only a part of your properties declared in attributesForFaceting attributes
     * default: []
     */
    facets?: string[];

    /**
     * Filter the query by a set of facets.
     * Default: []
     */
    facetFilters?: string[] | string[][];

    /**
     * Limit the number of facet values returned for each facet.
     * default: 100
     */
    maxValuesPerFacet?: number;

    /**
     * Default list of properties to highlight. If set to null, all indexed properties are highlighted.
     * default: null
     */
    highlightProperties?: string[];

    /**
     * Specify the string that is inserted before the highlighted parts in the query result
     * default: <em>
     */
    highlightPreTag?: string;

    /**
     * Specify the string that is inserted after the highlighted parts in the query result
     * default: </em>
     */
    highlightPostTag?: string;

    /**
     * Pagination parameter used to select the number of hits per page
     * default: 20
     */
    perPage?: number;

    /**
     * Pagination parameter used to select the page to retrieve.
     * default: 0
     */
    page?: number;

    /**
     * Search for entries around a given location
     * default: ""
     */
    aroundLatLng?: string;

    /**
     * Control the radius associated with a geo search. Defined in meters.
     * default: null
     * You can specify aroundRadius=all if you want to compute the geo distance without filtering in a geo area
     */
    aroundRadius?: number | 'all';

    /**
     * Search entries inside a given area defined by the two extreme points of a rectangle
     * default: null
     */
    insideBoundingBox?: number[][];

    /**
     * Selects how the query words are interpreted
     * default: 'prefix_none'
     * 'prefix_last' Only the last word is interpreted as a prefix.
     * 'prefix_none' No query word is interpreted as a prefix. (default behavior)
     */
    queryType?: 'prefix_last' | 'prefix_none' | 'prefix_all';

    

    /* end implementation of clinia.QueryParameters */
  }

  namespace SearchParameters {
    type FacetList = string[];
  }

  export class SearchResults<T = any>
    implements Omit<SearchResponse<T>, 'facets' | 'params'> {
    
      /**
     * query used to generate the results
     */
    query: string;

    /**
     * all the records that match the search parameters. 
     */
    records: (T & {
      readonly id: string;
    })[];

    /**
     * index where the results come from
     */
    index: string;

    /**
     * number of records per page requested
     */
    perPage: number;

    /**
     * total number of records of this query on the index
     */
    total: number;

    /**
     * total number of pages with respect to the number of records per page and the total number of records
     */
    numPages: number;

    /**
     * current page
     */
    page: number;

    /**
     * sum of the processing time of all the queries
     */
    processingTimeMS: number;

    /**
     * The position.
     * @example "48.8637,2.3615",
     */
    aroundLatLng: string;

    /**
     * The radius computed by Clinia.
     * @example "126792922",
     */
    automaticRadius: string;

    /**
     * True if the counts of the facets is exhaustive
     */
    exhaustiveFacetsCount: boolean;

    /**
     * True if the number of records is exhaustive
     */
    exhaustiveTotalRecords: boolean;

    /**
     * queryID is the unique identifier of the query used to generate the current search results.
     * This value is only available if the `clickAnalytics` search parameter is set to `true`.
     */
    queryID: string;

    /**
     * disjunctive facets results
     */
    disjunctiveFacets: SearchResults.Facet[];

    /**
     * other facets results
     */
    facets: SearchResults.Facet[];

    _rawResults: SearchResponse<T>[];
    _state: SearchParameters;

    constructor(state: SearchParameters, results: SearchResponse<T>[]);

    /**
     * Get a facet object with its name
     * @deprecated
     * @param name name of the faceted property
     * @return  the facet object
     */
    getFacetByName(name: string): SearchResults.Facet;

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
     * @param attribute attribute name
     * @param opts configuration options.
     * @param opts.sortBy
     * When using strings, it consists of
     * the name of the [FacetValue](#SearchResults.FacetValue) or the
     * [HierarchicalFacet](#SearchResults.HierarchicalFacet) attributes with the
     * order (`asc` or `desc`). For example to order the value by count, the
     * argument would be `['count:asc']`.
     *
     * If only the attribute name is specified, the ordering defaults to the one
     * specified in the default value for this attribute.
     *
     * When not specified, the order is
     * ascending.  This parameter can also be a function which takes two facet
     * values and should return a number, 0 if equal, 1 if the first argument is
     * bigger or -1 otherwise.
     *
     * The default value for this attribute `['isRefined:desc', 'count:desc', 'name:asc']`
     * @return depending on the type of facet of
     * the attribute requested (hierarchical, disjunctive or conjunctive)
     * @example
     * helper.on('results', function(content){
     *   //get values ordered only by name ascending using the string predicate
     *   content.getFacetValues('city', {sortBy: ['name:asc']});
     *   //get values  ordered only by count ascending using a function
     *   content.getFacetValues('city', {
     *     // this is equivalent to ['count:asc']
     *     sortBy: function(a, b) {
     *       if (a.count === b.count) return 0;
     *       if (a.count > b.count)   return 1;
     *       if (b.count > a.count)   return -1;
     *     }
     *   });
     * });
     */
    getFacetValues(
      attribute: string,
      opts: any
    ): SearchResults.FacetValue[] | SearchResults.HierarchicalFacet | undefined;

    /**
     * Returns the facet stats if attribute is defined and the facet contains some.
     * Otherwise returns undefined.
     * @param attribute name of the faceted attribute
     * @return The stats of the facet
     */
    getFacetStats(attribute: string): any;

    /**
     * Returns all refinements for all filters + tags. It also provides
     * additional information: count and exhausistivity for each filter.
     *
     * See the [refinement type](#Refinement) for an exhaustive view of the available
     * data.
     *
     * @return all the refinements
     */
    getRefinements(): SearchResults.Refinement[];
  }

  namespace SearchResults {
    interface Facet {
      name: string;
      data: object;
      stats: object;
    }

    interface FacetValue {
      name: string;
      count: number;
      isRefined: boolean;
      isExcluded: boolean;
    }

    interface Refinement {
      type: 'facet' | 'exclude' | 'disjunctive';
      propertyName: string;
      name: string;
      count: number;
      exhaustive: boolean;
    }
  }
}

export = searchHelper;
