'use strict';

var cliniaSearchHelper = require('../../../index.js');
var version = require('../../../src/version');
var cliniasearch = require('cliniasearch');


function makeFakeClient() {
  var client = cliniasearch('what', 'wait', {});

  client.search = jest.fn(function() {
    return new Promise(function() {});
  });

  return client;
}

test("client without addCliniaAgent() doesn't throw on instanciation", function() {
  var client = {};

  expect(function() {
    cliniaSearchHelper(client);
  }).not.toThrow();
});

test('addCliniaAgent gets called if exists', function() {
  var client = {
    addCliniaAgent: jest.fn()
  };

  expect(client.addCliniaAgent).not.toHaveBeenCalled();

  cliniaSearchHelper(client);

  expect(client.addCliniaAgent).toHaveBeenCalled();
});

test('clearCache gets called if exists', function() {
  var client = {
    clearCache: jest.fn()
  };
  var helper = cliniaSearchHelper(client);

  expect(client.clearCache).toHaveBeenCalledTimes(0);

  helper.clearCache();

  expect(client.clearCache).toHaveBeenCalledTimes(1);
});

test('setting the agent once', function() {
  var client = cliniasearch('what', 'wait', {});
  var originalUA = client._ua;
  cliniaSearchHelper(client, 'IndexName', {});
  cliniaSearchHelper(client, 'IndexName2', {});

  expect(client._ua).toBe(originalUA + '; JS Helper (' + version + ')');
});

test('getClient / setClient', function() {
  var client0 = makeFakeClient();
  var originalUA = client0._ua;
  var helper = cliniaSearchHelper(client0, 'IndexName', {});

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
  var client = cliniasearch('TODO', 'ClM5vDTmS4GWEL0aS7osJaRkowV8McuP', {
    hosts: {
      write: ['api.partner.staging.clinia.ca'],
      read: ['api.partner.staging.clinia.ca']
    }
  });
  var helper = cliniaSearchHelper(client, 'health_facility', {});
  helper.setQuery('sons').search();
  expect(client).toBe(helper.getClient());
});
