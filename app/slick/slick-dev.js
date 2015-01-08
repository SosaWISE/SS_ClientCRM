// this file is only for dev purposes
// production should have all these joined and minified
define('slick-jquery-deps', [
  // should be added included jquery build
  'jquery',
  '/tparty/jquery-ui-1.10.4.custom',
  '/tparty/jquery.event.drag-2.2',
], function() {});
define('slick', [
  'slick-jquery-deps', // ensure jquery deps are loaded
  'src/slick/tparty/slick.core',
  'src/slick/tparty/slick.grid',
  'src/slick/tparty/slick.rowselectionmodel',
  'src/slick/tparty/slick.editors',
  'src/slick/tparty/slick.dataview',
  // these aren't in the gruntfile and they don't seeem to be referenced anywhere
  // 'src/slick/tparty/slick.cellrangedecorator',
  // 'src/slick/tparty/slick.cellrangeselector',
  // 'src/slick/tparty/slick.cellselectionmodel',
  // 'src/slick/tparty/slick.formatters',
], function() {
  "use strict";
  return window.Slick;
});
