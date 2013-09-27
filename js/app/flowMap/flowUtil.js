define(['gmaps'],
function (gmaps) {
	"use strict";

	gmaps.visualRefresh = true;

	//
	//@TODO: move prototype extensions elsewhere, or make them static functions
	//

	if (typeof (Number.prototype.roundTo) === "undefined") {
		Number.prototype.roundTo = function (n) {
			return Math.round(this * Math.pow(10, n)) / Math.pow(10, n);
		};
	}
	// Converts numeric degrees to radians
	if (typeof (Number.prototype.toRad) === "undefined") {
		Number.prototype.toRad = function () {
			return this * Math.PI / 180;
		};
	}
	// Converts radians to numeric (signed) degrees
	if (typeof (Number.prototype.toDeg) === "undefined") {
		Number.prototype.toDeg = function () {
			return this * 180 / Math.PI;
		};
	}


	// Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function (from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};


	// Poygon getBounds extension - google-maps-extensions
	// http://code.google.com/p/google-maps-extensions/source/browse/google.maps.Polygon.getBounds.js
	if (!gmaps.Polygon.prototype.getBounds) {
		gmaps.Polygon.prototype.getBounds = function () {
			var bounds = new gmaps.LatLngBounds(),
				paths = this.getPaths(),
				path, p, i;

			for (p = 0; p < paths.getLength(); p += 1) {
				path = paths.getAt(p);
				for (i = 0; i < path.getLength(); i += 1) {
					bounds.extend(path.getAt(i));
				}
			}

			return bounds;
		};
		//copy to polyline
		gmaps.Polyline.prototype.getBounds = gmaps.Polygon.prototype.getBounds;
	}

	// LatLng cloneRounded -
	gmaps.LatLng.prototype.cloneRounded = function () {
		var significantDigits = flowUtil.significantDigits;
		return new gmaps.LatLng(this.lat().roundTo(significantDigits), this.lng().roundTo(significantDigits));
	};
	// LatLng toHashKey -
	gmaps.LatLng.prototype.toHashKey = function () {
		return this.lat() + "_" + this.lng();
	};

	// MVCArray isClockwise - determine if the vertices of a polygon go in a mostly clockwise direction
	//		"mostly" meaning the vertices in a polygon that overlap go in a the opposite direction
	//	if the sum of (x2-x1)(y2+y1) for all edges is positive then the polygon is clockwise
	gmaps.MVCArray.prototype.isClockwise = function () {
		var path, nVertices, sum = 0;

		path = this;
		nVertices = path.getLength();

		if (nVertices < 3) {
			return false;
		}

		path.forEach(function (v1, i) {
			var v2 = path.getAt((i + 1) % nVertices);
			//sum (x2-x1)(y2+y1), lng->x, lat->y
			sum += (v2.lng() - v1.lng()) * (v2.lat() + v1.lat());
		});

		return sum > 0;
	};
	// MVCArray reverseRotation - reverses the path but the index 0 at the start
	gmaps.MVCArray.prototype.reverseRotation = function () {
		var i, path, nVertices, iEnd, length, vTemp;

		path = this;
		nVertices = path.getLength();

		iEnd = nVertices - 1;
		length = Math.floor(nVertices / 2);
		if (nVertices % 2 === 1) {
			length += 1;
		}

		//index 0 doesn't move
		//swap first(index 1) with last, second with second to last, etc.,
		//	until all have been swapped once
		for (i = 1; i < length; i += 1, iEnd -= 1) {
			vTemp = path.getAt(i);
			path.setAt(i, path.getAt(iEnd));
			path.setAt(iEnd, vTemp);
		}

		////notify that path was reset
		//gmaps.event.trigger(path, "reset");
	};
	// MVCArray setIndexFirst - removes items before index and place them at the end
	gmaps.MVCArray.prototype.setIndexFirst = function (index) {
		if (index > this.getLength()) {
			throw "invalid index";
		}

		if (index > 0) {
			while (index > 0) {
				this.push(this.removeAt(0));
				index -= 1;
			}

			////notify that the array was reset
			//gmaps.event.trigger(this, "reset");
		}
	};
	// MVCArray copy
	gmaps.MVCArray.prototype.copy = function () {
		var result = new gmaps.MVCArray();

		this.forEach(function (item) {
			result.push(item);
		});

		return result;
	};





	var flowUtil = {}
		, expectIntersect = false
		;

	flowUtil.isDebug = function () { return true; };

	flowUtil.significantDigits = 5; //it appears that 7 decimal places is sufficient to produce the same point

	flowUtil.setExpectIntersect = function (expect) {
		expectIntersect = expect;
	};

	flowUtil.convertToLatLngArray = function (pointArray) {
		var i, item, mvcArray = new gmaps.MVCArray();

		if (pointArray.length === 1) {
			item = pointArray[0];
			mvcArray.push(new gmaps.LatLng(item.lat || 0, item.lng || 0));
		}
		else {
			for (i = 0; i < pointArray.length - 1; i += 1) {
				item = pointArray[i];
				mvcArray.push(new gmaps.LatLng(item.lat || 0, item.lng || 0));
			}
		}

		return mvcArray;
	};

	flowUtil.isBetween = function (i, a, b, tolerance) {
		return (a - tolerance) <= i && i <= (b + tolerance);
	};
	flowUtil.isPointOnLine = function (x1, y1, x2, y2, x, y, tolerance) {
		var run, rise, m, c;
		tolerance = Math.abs(tolerance || 0.00000001);

		if (flowUtil.isBetween(x, x1, x2, tolerance) && flowUtil.isBetween(y, y1, y2, tolerance)) {

			run = (x2 - x1);

			// Vertical line.
			if (run === 0.0) {
				return true;
			}

			rise = (y2 - y1);
			m = rise / run; // Slope
			c = -(m * x1) + y1; // Y intercept

			// Checking if (x, y) is on the line passing through the end points.
			return (Math.abs(y - (m * x + c)) <= tolerance);
		}
		return false;
	};

	//--------------------------------------------------------
	//	Method to determine if two lines intersect, are coincident, or are parallel
	//	www.kevlindev.com/gui/math/intersection/Intersection.js
	//--------------------------------------------------------
	flowUtil.getLineIntersectType = function (a1, a2, b1, b2, adx, ady, bdx, bdy) {
		var result = { intersect: false, pointIntersect: false, coincident: false, parallel: false },
			ua_t, ub_t, u_b, ua, ub, nDigits = 5, isOnLine;

		//if they're all not passed in calculate them
		if (bdy === undefined) {
			adx = (a2.x - a1.x);
			ady = (a2.y - a1.y);
			bdx = (b2.x - b1.x);
			bdy = (b2.y - b1.y);
		}

		ua_t = bdx * (a1.y - b1.y) - bdy * (a1.x - b1.x);
		ub_t = adx * (a1.y - b1.y) - ady * (a1.x - b1.x);
		u_b = bdy * adx - bdx * ady;

		//may we could try rounding u_b also
		if (u_b !== 0) {
			ua = ua_t / u_b;
			ub = ub_t / u_b;

			ua = ua.roundTo(nDigits);
			ub = ub.roundTo(nDigits);

			if (0 < ua && ua < 1 && 0 < ub && ub < 1) {
				isOnLine =
					flowUtil.isPointOnLine(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y) || //	b1 on a
					flowUtil.isPointOnLine(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y) || //	b2 on a
					flowUtil.isPointOnLine(b1.x, b1.y, b2.x, a2.y, a1.x, a1.y) || //	a1 on b
					flowUtil.isPointOnLine(b1.x, b1.y, b2.x, a2.y, a2.x, a2.y); //	a2 on b

				//if (!isOnLine && !expectIntersect) {
				//	debugger;
				//}

				if (isOnLine) {
					//debugger;
					//intersect at one of the points
					result.pointIntersect = true;
					result.point = { x: a1.x + ua * adx, y: a1.y + ua * ady };
				} else {

					//Lines intersect
					result.intersect = true;
					result.point = { x: a1.x + ua * adx, y: a1.y + ua * ady };
				}
			} else if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
				//intersect at one of the points
				result.pointIntersect = true;
				result.point = { x: a1.x + ua * adx, y: a1.y + ua * ady };
				//result.pointB = { x: b1.x + ub * bdx, y: b1.y + ub * bdy };
				//if (result.point.x !== result.pointB.x || result.point.y !== result.pointB.y) {
				//	alert("Point !== PointB");
				//	debugger;
				//}
			} else {
				//No intersection
			}

			//if (0 < ua && ua < 1 && 0 < ub && ub < 1) {
			//	//Lines intersect
			//	result.intersect = true;
			//	result.point = { x: a1.x + ua * adx, y: a1.y + ua * ady };
			//} else if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
			//	//intersect at one of the points
			//	result.pointIntersect = true;
			//	result.point = { x: a1.x + ua * adx, y: a1.y + ua * ady };
			//	//result.pointB = { x: b1.x + ub * bdx, y: b1.y + ub * bdy };
			//	//if (result.point.x !== result.pointB.x || result.point.y !== result.pointB.y) {
			//	//	alert("Point !== PointB");
			//	//	debugger;
			//	//}
			//} else {
			//	//No intersection
			//}
		} else {
			if (ua_t === 0 || ub_t === 0) {
				//Coincident
				result.coincident = true;
			} else {
				//Parallel
				result.parallel = true;
			}
		}

		return result;
	};
	flowUtil.getLatLngLineIntersectType = function (latLngA1, latLngA2, latLngB1, latLngB2) {
		var
			a1 = { y: latLngA1.lat(), x: latLngA1.lng() },
			a2 = { y: latLngA2.lat(), x: latLngA2.lng() },
			b1 = { y: latLngB1.lat(), x: latLngB1.lng() },
			b2 = { y: latLngB2.lat(), x: latLngB2.lng() };
		return flowUtil.getLineIntersectType(a1, a2, b1, b2);
	};

	flowUtil.verticesAreEqual = function (left, right) {
		left = left.cloneRounded();
		right = right.cloneRounded();

		return left.lng() === right.lng() && left.lat() === right.lat();
	};

	flowUtil.calcRadiansBetweenPoints = function (a, b) {
		var dx, dy, result;

		dx = b.x - a.x;
		dy = b.y - a.y;

		if (dx > 0) {
			result = (Math.PI * 0.5) - Math.atan(dy / dx);
		}
		else if (dx < 0) {
			result = (Math.PI * 1.5) - Math.atan(dy / dx);
		}
		else if (dy > 0) {
			result = 0;
		}
		else if (dy < 0) {
			result = Math.PI;
		}
		else {
			result = -999; // the 2 points are equal
		}

		return result;
	};

	flowUtil.rotateLine = function (a, b, degInRad) {
		var aX, aY, bX, bY, x, y;

		aX = a.x;
		aY = a.y;
		bX = b.x;
		bY = b.y;

		// Rotate the line by degInRad about the start point

		// First, set (x,y) to the end
		x = bX;
		y = bY;

		// Now translate by start point (-aX, -aY)
		x -= aX;
		y -= aY;

		// Next perform the rotation
		bX = (x * Math.cos(degInRad)) - (y * Math.sin(degInRad));
		bY = (x * Math.sin(degInRad)) + (y * Math.cos(degInRad));

		// Now translate back by start point (+aX, +aY)
		bX += aX;
		bY += aY;

		return { a: { x: aX, y: aY }, b: { x: bX, y: bY} };
	};


	return flowUtil;
});
