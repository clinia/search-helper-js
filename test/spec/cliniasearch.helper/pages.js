'use strict';

var cliniasearchHelper = require('../../../index');

var fakeClient = {};

test('setChange should change the current page', function() {
  var helper = cliniasearchHelper(fakeClient, null, null);

  expect(helper.getCurrentPage() === 0).toBeTruthy();
  helper.setCurrentPage(3);
  expect(helper.getCurrentPage() === 3).toBeTruthy();
});

test('nextPage should increment the page by one', function() {
  var helper = cliniasearchHelper(fakeClient, null, null);

  expect(helper.getCurrentPage() === 0).toBeTruthy();
  helper.nextPage();
  helper.nextPage();
  helper.nextPage();
  expect(helper.getCurrentPage() === 3).toBeTruthy();
});

test('previousPage should decrement the current page by one', function() {
  var helper = cliniasearchHelper(fakeClient, null, null);

  expect(helper.getCurrentPage() === 0).toBeTruthy();
  helper.setCurrentPage(3);
  expect(helper.getCurrentPage() === 3).toBeTruthy();
  helper.previousPage();
  expect(helper.getCurrentPage() === 2).toBeTruthy();
});
