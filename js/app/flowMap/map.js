define(['gmaps','./marker','./rectangle'],
function (gmaps, Marker, Rectangle) {
	"use strict";

	function Map(mapDiv, opts) {
		gmaps.Map.call(this, mapDiv, opts);
	}
	// inherit from g Map
	Map.prototype = new gmaps.Map(document.createElement("div"));

	Map.defaultOptions = {
		fillColor: "#444444",
		fillOpacity: 0.4,
		// map: this,
		// paths: [],
		strokeColor: "#444444",
		strokeOpacity: 0.75,
		strokeWeight: 4,
		zIndex: 5
	};

	Map.prototype.addRectangle = function (startEdit, model, id, options) {
		var result;

		// add on defaults
		options = extend({
			model: model,
			id: id,
			map: this,
		}, options, Map.defaultPolygonOptions);

		result = new Rectangle(options);
		return result;
	};
	Map.prototype.addMarker = function (point, id, options) {
		var result;

		result = new Marker(this, new gmaps.LatLng(point.lattitude, point.longitude), options);
		result.id = id;
		return result;
	};


	//
	// static functions
	//

	function extend(options /*, defaultOptions... */) {
		var args = Array.prototype.slice.call(arguments, 1);
		// foreach default options argument
		// add the property if it doesn't exist
		// on the options argument
		args.forEach(function (defaultOptions) {
			// make sure defaultOptions is defined
			if (!defaultOptions) { return; }
			Object.keys(defaultOptions).forEach(function (key) {
				if (!options.hasOwnProperty(key)) {
					options[key] = defaultOptions[key];
				}
			});
		});
		return options;
	}

	return Map;
});
