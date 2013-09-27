define(['./flowUtil','gmaps'],
function (flowUtil, gmaps) {
	"use strict";

	function Marker(fmap, latLng, options) {
		options = options || {};
		gmaps.Marker.call(this, {
			draggable: false,
			flat: true,
			icon: options.icon || Marker.defaultIcon,
			map: fmap,
			position: latLng,
			raiseOnDrag: false,
			zIndex: 100,
			shape: { type: "circle", coords: [7, 7, 7] }
		});
	}
	// inherits from g Marker
	Marker.prototype = new gmaps.Marker();

	Marker.prototype.dispose = function () {
		gmaps.event.clearListeners(this, "changed");
		gmaps.event.clearInstanceListeners(this);
		this.setMap(null);
	};

	// pre-load marker images
	var defaultImg = new Image();

	Marker.defaultIcon = new gmaps.MarkerImage(
        defaultImg.src = "/img/marker-default.png",
        new gmaps.Size(14, 14),
        new gmaps.Point(0, 0),
        new gmaps.Point(7, 7)
    );

    Marker.blackIcon = new gmaps.MarkerImage(
        "/img/marker-black.png",
        new gmaps.Size(14, 14),
        new gmaps.Point(0, 0),
        new gmaps.Point(7, 7)
    );

	return Marker;
});
