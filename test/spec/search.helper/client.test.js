'use strict';

var searchHelper = require('../../../index.js');
var version = require('../../../src/version');
var clinia = require('clinia');

function makeFakeClient() {
  var client = clinia('what', 'wait', {});

  client.search = jest.fn(function() {
    return new Promise(function() {});
  });

  client._ua || Object.defineProperty(client, '_ua', {
    get() {
      return client.transporter.userAgent.value;
    }
  });

  return client;
}

test("client without addCliniaAgent() doesn't throw on instanciation", function() {
  var client = {};

  expect(function() {
    searchHelper(client);
  }).not.toThrow();
});

test('addCliniaAgent gets called if exists', function() {
  var client = {
    addCliniaAgent: jest.fn()
  };

  expect(client.addCliniaAgent).not.toHaveBeenCalled();

  searchHelper(client);

  expect(client.addCliniaAgent).toHaveBeenCalled();
});

test("client without clearCache() doesn't throw when clearing cache", function() {
  var client = {};
  var helper = searchHelper(client);

  expect(function() {
    helper.clearCache();
  }).not.toThrow();
});

test('clearCache gets called if exists', function() {
  var client = {
    clearCache: jest.fn()
  };
  var helper = searchHelper(client);

  expect(client.clearCache).toHaveBeenCalledTimes(0);

  helper.clearCache();

  expect(client.clearCache).toHaveBeenCalledTimes(1);
});

test('setting the agent once', function() {
  var client = clinia('what', 'wait', {});
  client._ua || Object.defineProperty(client, '_ua', {
    get() {
      return client.transporter.userAgent.value;
    }
  });

  var originalUA = client._ua;
  searchHelper(client, 'IndexName', {});
  searchHelper(client, 'IndexName2', {});

  expect(client._ua).toBe(originalUA + '; JS Helper (' + version + ')');
});

test('getClient / setClient', function() {
  var client0 = makeFakeClient();
  var originalUA = client0._ua;
  var helper = searchHelper(client0, 'IndexName', {});

  expect(client0.search).toHaveBeenCalledTimes(0);
  helper.search();
  expect(client0.search).toHaveBeenCalledTimes(1);

  expect(helper.getClient()).toBe(client0);

  expect(client0._ua).toBe(originalUA + '; JS Helper (' + version + ')');

  var client1 = makeFakeClient();
  helper.setClient(client1);

  expect(helper.getClient()).toBe(client1);

  expect(client1.search).toHaveBeenCalledTimes(0);
  helper.search();
  expect(client1.search).toHaveBeenCalledTimes(1);
  expect(client0.search).toHaveBeenCalledTimes(1);

  expect(client1._ua).toBe(originalUA + '; JS Helper (' + version + ')');

  helper.setClient(client1);
  expect(client1._ua).toBe(originalUA + '; JS Helper (' + version + ')');
});

test('initial client === getClient', function() {
  var client = clinia('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  var helper = searchHelper(client, 'instant_search', {});
  helper.setQuery('blah').search();
  expect(client).toBe(helper.getClient());
});
