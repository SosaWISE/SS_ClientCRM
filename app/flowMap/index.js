// define gmaps
define('gmaps', ['jsonp!https://maps.google.com/maps/api/js?v=3.12&libraries=geometry&sensor=false'], function() {
  "use strict";
  return window.google.maps;
});

define('src/flowMap/index', [
  './flowUtil',
  './map',
  './rectangle',
  './marker'
], function(flowUtil, Map, Rectangle, Marker) {
  "use strict";
  return {
    util: flowUtil,
    Map: Map,
    Rectangle: Rectangle,
    Marker: Marker,
  };
});
