(function() {
  "use strict";

  // define gmaps
  define('gmaps', ['async!https://maps.google.com/maps/api/js?v=3.12&libraries=geometry&sensor=false'], function() {
    return window.google.maps;
  });

  define([
  // load main libs
    'jquery',
    'ko',
    'gmaps',

  // load plugins
    'knockout/ko.debug.helpers',
    'knockout/ko.command',
    'knockout/ko.bindingHandlers.all'
  ], function() {
    console.log('--loadDependencies complete');
  });
})();
