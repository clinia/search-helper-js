# search-helper-js

This module is the companion of the [clinia/clinia-client-javascript]((https://github.com/clinia/clinia-client-javascript)). It helps you keep track of the search parameters and provides a higher level API.

[![Version][version-svg]][package-url] [![Build Status][circle-svg]][circle-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url] [![jsDelivr Hits][jsdelivr-badge]][jsdelivr-hits]

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


  - [Features](#features)
  - [Examples](#examples)
    - [Vanilla JavaScript](#vanilla-javascript)
  - [Helper cheatsheet](#helper-cheatsheet)
    - [Add the helper in your project](#add-the-helper-in-your-project)
    - [Regular `<script>` tag](#regular-script-tag)
    - [With NPM](#with-npm)
    - [Init the helper](#init-the-helper)
    - [Helper lifecycle](#helper-lifecycle)
    - [Objects](#objects)
    - [Search](#search)
    - [Events](#events)
    - [Query](#query)
    - [Filtering results](#filtering-results)
    - [Facet utilities](#facet-utilities)
    - [Pagination](#pagination)
    - [Index](#index)
    - [One time query](#one-time-query)
    - [Query parameters](#query-parameters)
    - [Results format](#results-format)
- [Browser support](#browser-support)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features
 - Search parameters management
 - Facets exclusions
 - Pagination
 - Disjunctive faceting (search on two or more values of the same facet)

## Examples

### Vanilla JavaScript
A small example that uses Browserify to manage modules.

```js
var clinia = require('clinia');
var searchHelper = require('@clinia/search-helper');

var client = clinia('appId', 'apiKey');

var helper = searchHelper(client, 'indexName', {
  facets: ['type', 'address.place'],
  disjunctiveFacets: ['services']
});

helper.on('result', function(event){
  console.log(event.results);
});

helper.addDisjunctiveFacetRefinement('services', 'Vaccination');
helper.addDisjunctiveFacetRefinement('services', 'Strep test');

helper.addFacetRefinement('type', 'Pharmacy');

// Search for any health facilities of type pharmacy and offering Vaccination or Strep test services.
helper.search();
```
See more examples in the [examples folder](examples/)

## Helper cheatsheet

### Add the helper in your project

### Regular `<script>` tag

Use our [jsDelivr](http://www.jsdelivr.com/) build:

TODO

### With NPM

`npm install @clinia/search-helper`

### Init the helper

```js
var helper = searchHelper(client, 'indexName'/*, parameters*/);
```

### Helper lifecycle

1. modify the parameters of the search (usually through user interactions)<br/>
        ```
        	helper.setQuery('jean coutu').addFacetRefinement('services', 'Vaccination')
        ```

2. trigger the search (after all the modification have been applied)<br/>
        ```
        helper.search()
        ```

3. read the results (with the event "result" handler) and update the UI with the results<br/>
        ```
        helper.on('result', function(event) {
          updateUI(event.results);
        });
        ```

4. go back to 1

### Objects

**CliniaSearchHelper**: the helper. Keeps the state of the search, makes the queries and calls the handlers when an event happen.

**SearchParameters**: the object representing the state of the search. The current state is stored in `helperInstance.state`.

**SearchResults**: the object in which the Clinia answers are transformed into. This object is passed to the result event handler.
An example of SearchResults in JSON is available at [the end of this readme](#results-format)

### Search

The search is triggered by the `search()` method.

It takes all the previous modifications to the search and uses them to create the queries to Clinia. The search parameters are immutable.

Example:

```js
var helper = searchHelper(client, indexName);

// Let's monitor the results with the console
helper.on('result', function(event) {
  console.log(event.results);
});

// Let's make an empty search
// The results are all sorted using the dashboard configuration
helper.search();

// Let's search for "jean coutu"
helper.setQuery('jean coutu').search();
```

### Events

The helper is a Node.js [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) instance.

`result`: get notified when new results are received. The handler function will receive
two objects (`SearchResults` and `SearchParameters`).

`error`: get notified when errors are received from the API.

`change`: get notified when a property has changed in the helper

`search` : get notified when a request is sent to Clinia

#### Listen to the `result` event

```js
helper.on('result', updateTheResults);
```

#### Listen to a `result` event once

```js
helper.once('result', updateTheResults);
```

#### Remove a `result` listener

```js
helper.removeListener('result', updateTheResults);
```

#### Remove all `result` listeners

```js
helper.removeAllListeners('result');
```

All the methods from Node.js [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) class are available.

### Query

#### Do a search with the query "fruit"

```javscript
helper.setQuery('fruit').search();
```

### Filtering results

Facets are filters to retrieve a subset of an index having a specific value for a given property.

#### Regular (conjunctive) facets

Refinements are ANDed by default (Conjunctive selection).

##### Facet definition

```js
var helper = searchHelper(client, indexName, {
	facets: ['ANDFacet']
});
```

##### Add a facet filter

```js
helper.addFacetRefinement('ANDFacet', 'valueOfANDFacet').search();
```

##### Remove a facet filter

```js
helper.removeFacetRefinement('ANDFacet', 'valueOfANDFacet').search();
```

#### Disjunctive facets

Refinements are ORed by default (Disjunctive selection).

##### Facet definition

```js
var helper = searchHelper(client, indexName, {
	disjunctiveFacets: ['ORFacet']
});
```

##### Add a facet filter

```js
helper.addDisjunctiveFacetRefinement('ORFacet', 'valueOfORFacet').search();
```

##### Remove a facet filter

```js
helper.removeDisjunctiveFacetRefinement('ORFacet', 'valueOfORFacet').search();
```

#### Negative facets

Filter so that we do NOT get a given facet

##### Facet definition (same as "AND" facet)

```js
var helper = searchHelper(client, indexName, {
	facets: ['ANDFacet']
}).search();
```

##### Exclude a value for a facet

```js
helper.addFacetExclusion('ANDFacet', 'valueOfANDFacetToExclude');
```

##### Remove an exclude from the list of excluded values

```js
helper.removeFacetExclusion('ANDFacet', 'valueOfANDFacetToExclude');
```

#### Clearing filters

##### Clear all the refinements for all the refined attributes

```js
helper.clearRefinements().search();
```

##### Clear all the refinements for a specific attribute

```js
helper.clearRefinements('ANDFacet').search();
```

##### [ADVANCED] Clear only the exclusions on the "ANDFacet" attribute

```js
helper.clearRefinements(function(value, attribute, type) {
  return type === 'exclude' && attribute === 'ANDFacet';
}).search();
```

### Facet utilities

#### Get the values of a facet with the default sort

```js
helper.on('result', function(event) {
  // Get the facet values for the attribute age
  event.results.getFacetValues('age');
  // It will be ordered :
  //  - refined facets first
  //  - then ordered by number of occurence (bigger count -> higher in the list)
  //  - then ordered by name (alphabetically)
});
```

#### Get the values of a facet with a custom sort

```js
helper.on('result', function(event) {
  // Get the facet values for the attribute age
  event.results.getFacetValues('age', {sortBy: ['count:asc']});
  // It will be ordered by number of occurence (lower number => higher position)
  // Elements that can be sorted : count, name, isRefined
  // Type of sort : 'asc' for ascending order, 'desc' for descending order
});
```

### Pagination

#### Get the current page

```js
helper.getPage();
```

#### Change page

```js
helper.setPage(3).search();
```

#### Automatic reset to page 0

During a search, changing the parameters will update the result set, which can then change
the number of pages in the result set. Therefore, the behavior has been standardized so
that any operation that may change the number of page will reset the pagination to page 0.

This may lead to some unexpected behavior. For example:

```js
helper.setPage(4);
helper.getPage(); // 4
helper.setQuery('foo');
helper.getPage(); // 0
```

Non exhaustive list of operations that trigger a reset:
 - refinements (conjunctive, exclude, disjunctive)
 - index (setIndex)
 - setQuery
 - setPerPage

### Index

Index can be changed.

#### Change the current index

```js
helper.setIndex('index_xyz').search();
```

#### Get the current index

```js
var currentIndex = helper.getIndex();
```

### One time query

Sometime it's convenient to reuse the current search parameters with small changes
without changing the state stored in the helper. That's why there is a function
called `searchOnce`. This method does not trigger `change` or `error` events.

In the following, we are using `searchOnce` to fetch only a single element using
all the other parameters already set in the search parameters.

#### Using searchOnce with a callback

```js
var state = helper.searchOnce(
  {perPage: 1},
  function(error, content, state) {
    // if an error occured it will be passed in error, otherwise its value is null
    // content contains the results formatted as a SearchResults
    // state is the instance of SearchParameters used for this search
  });
```

#### Using searchOnce with a promise

```js
var state1 = helper.searchOnce({perPage: 1})
                   .then(function(res) {
  // res contains
  // {
  //   content : SearchResults
  //   state : SearchParameters (the one used for this specific search)
  // }
});
```

### Query parameters

There are lots of other parameters you can set.

#### Set a parameter at the initialization of the helper

```js
var helper = searchHelper(client, indexName, {
	perPage: 50
});
```

#### Set a parameter later

```js
helper.setQueryParameter('perPage', 20).search();
```

### Results format

Here is an example of a result object you get with the `result` event.

```js
{
   "perPage": 10,
   "processingTimeMS": 2,
   "facets": [
      {
         "name": "type",
         "data": {
            "Pharmacy": 6627,
            "Clinic": 550,
            "Clsc": 665,
            "Hospital": 131,
            "Community Resource": 456,
            "Other": 1571
         },
         "exhaustive": false
      }
   ],
   "records": [
      {
        "type":"PHARMACY",
        "address":{
          "streetAddress":"947 Boulevard du Séminaire Nord",
          "suiteNumber":null,
          "postalCode":"J3A 1K1",
          "neighborhood":null,
          "locality":null,
          "place":"Saint-Jean-sur-Richelieu",
          "region":null,
          "regionCode":"QC",
          "country":null,
          "countryCode":"CA"
        },
        "geoPoint":{
          "lat":45.33416219999999,
          "lng":-73.2671249
        },
        "onlineBookingUrl":null,
        "distance":null,
        "openingHours":{
          "1":[{"start":"08:00","end":"21:00"}],
          "2":[{"start":"08:00","end":"21:00"}],
          "3":[{"start":"08:00","end":"21:00"}],
          "4":[{"start":"08:00","end":"21:00"}],
          "5":[{"start":"08:00","end":"21:00"}],
          "6":[{"start":"09:00","end":"21:00"}],
          "7":[{"start":"09:00","end":"21:00"}]
        },
        "socials":[
          {
            "url":"https://www.jeancoutu.com/","type":"WEBSITE"
          }
        ],
        "id":"4566e06c-d01b-443d-aadb-21942b781aa0",
        "name":"Jean Coutu - Saint-Jean-sur-Richelieu",
        "phones":[
          {
            "countryCode":"+1",
            "number":"4503489251",
            "extension":null,
            "type":"MAIN"
          },
          {
            "countryCode":"+1",
            "number":"4503486812",
            "extension":null,
            "type":"FAX"
          }
        ]
      }
      ....
   ],
   "total": 10000,
   "disjunctiveFacets": [
      {
         "data": {
            "Vaccination": 142,
            "Strep test": 60,
            ...
         },
         "name": "services",
         "exhaustive": false
      }
   ],
   "query": "",
   "numPages": 100,
   "page": 0,
   "index": "bestbuy"
}
```

# Browser support

This project works on any [ES5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition) browser, basically >= IE9+.

<!-- Links -->

[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/@clinia/search-helper.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=@clinia/search-helper
[version-svg]: https://img.shields.io/npm/v/@clinia/search-helper.svg?style=flat-square
[package-url]: https://npmjs.org/package/@clinia/search-helper
[jsdelivr-badge]: https://data.jsdelivr.com/v1/package/npm/@clinia/search-helper/badge
[jsdelivr-hits]: https://www.jsdelivr.com/package/npm/@clinia/search-helper