define(['./flowUtil','gmaps'],
function (flowUtil, gmaps) {
	"use strict";

	function Rectangle(options) {
		this.model = options.model;
		this.resetBounds();

		// call parent
		gmaps.Rectangle.apply(this, arguments);
	}
	// inherits from g Polygon
	Rectangle.prototype = new gmaps.Rectangle();

	Rectangle.prototype.resetBounds = function () {
		this.setBounds(new gmaps.LatLngBounds(
			new gmaps.LatLng(this.model.MinLattitude(), this.model.MinLongitude()),
			new gmaps.LatLng(this.model.MaxLattitude(), this.model.MaxLongitude())
		));
	};
	Rectangle.prototype.storeBounds = function () {
		var model = this.model,
			bounds = this.getBounds(),
			sw = bounds.getSouthWest(),
			ne = bounds.getNorthEast();

		model.MinLattitude(sw.lat());
		model.MinLongitude(sw.lng());
		model.MaxLattitude(ne.lat());
		model.MaxLongitude(ne.lng());
	};

	Rectangle.prototype.dispose = function () {
		gmaps.event.clearListeners(this, "changed");
		gmaps.event.clearInstanceListeners(this);
		this.setMap(null);
	};
	Rectangle.prototype.canEdit = function (editing) {
		this.setEditable(editing);
		this.setDraggable(editing);
		this.setOptions({
			zIndex: editing ? 100 : 5,
		});
	};

	Rectangle.prototype.updatePathFromModel = function (path) {
		var model = this.model,
			index = 0;

		if (!path) {
			path = this.getPath();
		}

		// 0 - bottom left (GS point 1)
		path.setAt(index++, new gmaps.LatLng(model.MinLattitude(), model.MinLongitude()));
		// 1 - top left (Laipac point 1)
		path.setAt(index++, new gmaps.LatLng(model.MaxLattitude(), model.MinLongitude()));
		// 2 - top right (GS point 2)
		path.setAt(index++, new gmaps.LatLng(model.MaxLattitude(), model.MaxLongitude()));
		// 3 -  bottom right (Laipac point 2)
		path.setAt(index++, new gmaps.LatLng(model.MinLattitude(), model.MaxLongitude()));

		// GS_AccountGeoFenceRectangle to Laipac
		// Laipac     = GS_AccountGeoFenceRectangle
		// Latitude1  = MaxLattitude
		// Longitude1 = MinLongitude
		// Latitude2  = MinLattitude
		// Longitude2 = MaxLongitude
	};
	Rectangle.prototype.updateModelFromPath = function (path) {
		var model = this.model,
			point,
			index = 0;

		if (!path) {
			path = this.getPath();
		}

		// point 1
		point = path.getAt(index);
		model.MinLattitude(point.lat());
		model.MinLongitude(point.lng());

		// point 2
		point = path.getAt(index + 2);
		model.MaxLattitude(point.lat());
		model.MaxLongitude(point.lng());
	};


	return Rectangle;
});
