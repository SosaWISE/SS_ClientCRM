// this file is only for dev purposes
// production should have all these joined and minified
define('slick', [
  '/tparty/jquery.event.drag-2.2',
  '/tparty/slick.core',
  '/tparty/slick.grid',
  '/tparty/slick.rowselectionmodel',
  '/tparty/slick.cellrangedecorator',
  '/tparty/slick.cellrangeselector',
  '/tparty/slick.cellselectionmodel',
  '/tparty/slick.editors',
  '/tparty/slick.formatters',
  '/tparty/jquery-ui-1.10.4.custom',
], function() {
  "use strict";
  return window.Slick;
});
