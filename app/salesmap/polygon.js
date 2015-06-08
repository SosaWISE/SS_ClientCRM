define("src/salesmap/polygon", [
  "gmaps",
  "src/core/notify",
  "src/core/utils",
], function(
  gmaps,
  notify,
  utils
) {
  "use strict";
  utils = utils;

  var _count = 0;

  function Polygon(map, data) {
    var _this = this;
    // _this.id = 0;
    // _this.salesRepId = 0;
    // _this.officeId = 0;
    // _this.startTimestamp = null;
    // _this.endTimestamp = null;
    _this.id = ++_count;
    _this.data = data;

    _this._polygon = new gmaps.Polygon(polygonOptions);
    _this._polygon.setOptions({
      clickable: false,
    });
    _this._polyline = new gmaps.Polyline(highlightedPolylineOptions);
    _this._polyline.setOptions({
      clickable: false,
    });

    _this._paths = [];
    _this._map = map;

    _this._labelDiv = makeLabel(_this, "");

    _this._polygon.setMap(map);
  }
  Polygon.prototype.setLabel = function(txt) {
    var _this = this;
    _this._labelDiv.innerHTML = txt;
  };
  Polygon.prototype.getPaths = function() {
    var _this = this;
    return _this._paths;
  };
  Polygon.prototype.setPaths = function(p) {
    var _this = this;
    _this._paths = p;
    _this._polygon.setOptions(polygonOptions);
    _this._polygon.setPaths(p.slice(0));
    _this._polygon.setMap(_this._map);
  };

  // updates the private paths array to contain the changes made to the native Google Path
  Polygon.prototype.commitPathChanges = function() {
    var _this = this;
    var new_paths = [];
    var ps = _this._polygon.getPaths();
    for (var i = 0; i < ps.getLength(); i++) {
      var p = ps.getAt(i).getArray();
      var new_path = [];
      for (var j = 0; j < p.length; j++) {
        new_path.push({
          lat: p[j].lat(),
          lng: p[j].lng()
        });
      }
      new_paths.push(new_path);
    }
    _this.setPaths(new_paths);
  };

  Polygon.prototype.onClick = function(fn) {
    var _this = this;
    gmaps.event.removeListener(_this._listener);
    _this._listener = gmaps.event.addListener(_this._polygon, "click", function() {
      fn(_this);
    });

    // var ps = _this._polygon.getPaths(); //
    // function polyChanged() {
    //   console.log("polygon changed");
    // }
    // for (var i = 0; i < ps.getLength(); i++) {
    //   gmaps.event.addListener(ps.getAt(i), "set_at", polyChanged);
    // }
  };

  Polygon.prototype.addPoint = function(latLng) {
    var _this = this;
    if (!_this._currentPath) {
      _this._currentPath = [];
    }
    _this._currentPath.push({
      lat: latLng.lat(),
      lng: latLng.lng(),
    });
    _this.updateUI();
  };

  Polygon.prototype.updateUI = function(latLng) { // latLng is an optional paramter used to show a temporary point at the end of the currentPath
    var _this = this;
    var all_paths = this.getPaths().slice(0);
    var currentPath_amended = null;
    if (_this._currentPath) {
      currentPath_amended = _this._currentPath.slice(0);
      if (latLng) {
        currentPath_amended.push(latLng);
      }
      all_paths.push(currentPath_amended);
    }

    //polyline.setMap(map);

    _this._polygon.setPaths(all_paths);
    if (currentPath_amended) {
      _this._polyline.setPath(currentPath_amended);
    }
  };

  Polygon.prototype.endPath = function() {
    var _this = this;
    _this._polyline.setMap(null);
    _this._paths.push(_this._currentPath);
    _this._currentPath = null;
    _this.updateUI();
    //console.log(this.getPaths());
  };

  Polygon.prototype.setClickable = function(clickable) {
    var _this = this;
    _this._polygon.setOptions({
      clickable: clickable,
    });
  };
  Polygon.prototype.setOutlineClickable = function(clickable) {
    var _this = this;
    _this._polyline.setOptions({
      clickable: clickable,
    });
  };
  Polygon.prototype.setEditable = function(editable) {
    var _this = this;
    _this._polygon.setOptions({
      editable: editable,
    });
  };
  Polygon.prototype.hideOutline = function() {
    var _this = this;
    _this._polyline.setMap(null);
  };
  Polygon.prototype.showOutline = function() {
    var _this = this;
    _this._polyline.setMap(_this._map);
  };
  Polygon.prototype.hide = function() {
    var _this = this;
    _this._hidden = true;
    _this._polygon.setMap(null);
    hideLabel(_this);
    _this.hideOutline();
  };
  Polygon.prototype.show = function() {
    var _this = this;
    _this._hidden = false;
    var map = _this._polygon.getMap();
    if (_this._map !== map) {
      _this._polygon.setMap(_this._map);
    }
    showLabel(_this);
    // _this.showOutline();
  };
  Polygon.prototype.destroy = function() {
    var _this = this;
    _this._polygon.setMap(null);
    _this._polyline.setMap(null);
    _this._labelDiv.parentNode.removeChild(_this._labelDiv);
    gmaps.event.removeListener(_this._listener);
  };
  // Polygon.prototype.show = function() {
  //   var _this = this;
  //   _this._polygon.setMap(_this._map);
  // };
  Polygon.prototype.setHighlight = function(highlight) {
    var _this = this;
    if (highlight) {
      _this._polygon.setOptions(highlightedPolygonOptions);
    } else {
      _this._polygon.setOptions(polygonOptions);
    }
  };

  Polygon.prototype.getCentroid = function() {
    var centroid = {
      lat: 0,
      lng: 0,
      pts: 0,
    };
    var pd = this.getPaths();
    if (!pd.length) {
      return null;
    }

    // TODO: This only gets the centroid of the first path - we should probably get all of them and make an array

    var minlat;
    var maxlat;
    var minlng;
    var maxlng;
    for (var c = 0; c < pd[0].length; c++) {
      if (minlat == null || pd[0][c].lat < minlat) {
        minlat = pd[0][c].lat;
      }
      if (maxlat == null || pd[0][c].lat > maxlat) {
        maxlat = pd[0][c].lat;
      }
      if (minlng == null || pd[0][c].lng < minlng) {
        minlng = pd[0][c].lng;
      }
      if (maxlng == null || pd[0][c].lng > maxlng) {
        maxlng = pd[0][c].lng;
      }
      //centroid.lat += Number(pd[0][c].lat);
      //centroid.lng += Number(pd[0][c].lng);
      //centroid.pts++;
    }
    centroid.lat += 3 * minlat + 3 * maxlat;
    centroid.lng += 3 * minlng + 3 * maxlng;
    centroid.lat /= centroid.pts + 6;
    centroid.lng /= centroid.pts + 6;
    //console.log("centroid: " + centroid.lng + ", " + centroid.lat);
    return centroid;
  };

  Polygon.prototype.handleMapCenterChanged = function() {
    var _this = this;
    centerLabel(_this);
  };




  function convertLatLngToXY(map, latLng) {
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var lng_d = ne.lng() - sw.lng();
    var lat_d = ne.lat() - sw.lat();

    //console.log("dimensions- lng:" + lng_d + ", lat:" + lat_d);
    var map_div = map.getDiv();
    var x_px = map_div.offsetWidth;
    var y_px = map_div.offsetHeight;
    //console.log("dimensions- x:" + x_px + ", y:" + y_px);

    var x = (latLng.lng - sw.lng()) / lng_d * x_px;
    //console.log("lng pct: " + (latLng.lng - sw.lng()) / lng_d);
    var y = (latLng.lat - sw.lat()) / lat_d * y_px;
    //console.log("lat pct: " + (latLng.lat - sw.lat()) / lat_d);
    //console.log(x + ", " + y);

    return {
      x: x,
      y: y
    };
  }

  function makeLabel(_this, labelText) {
    var id = "label_" + _this.id;
    var div = document.getElementById(id);
    if (!div) {
      div = document.createElement("DIV");
      div.id = id;
      div.className = "map-label";
      var map_div = _this._map.getDiv();
      map_div.appendChild(div);
    }
    // set text
    div.innerHTML = labelText;
    return div;
  }

  function hideLabel(_this) {
    var style = _this._labelDiv.style;
    if (style.display !== "none") {
      style.display = "none";
    }
  } //
  function showLabel(_this) {
    var style = _this._labelDiv.style;
    if (style.display !== "") {
      style.display = "";
    }
  } //

  function centerLabel(_this) {
    var div = _this._labelDiv;
    var centroid = _this.getCentroid();
    if (!centroid) {
      hideLabel(_this);
      return;
    }
    if (!_this._hidden) {
      showLabel(_this);
    }
    // set position
    var xy = convertLatLngToXY(_this._map, centroid);
    div.style.left = xy.x + "px"; // this only works in the Western Hemisphere
    div.style.bottom = xy.y + "px"; // this only works in the Northern Hemisphere
  }


  var polygonOptions = {
    strokeColor: "#62259D",
    strokeOpacity: 0.25,
    strokeWeight: 2,
    fillColor: "#62259D",
    fillOpacity: 0.1,
  };
  var highlightedPolygonOptions = {
    strokeColor: "#FFC627",
    strokeOpacity: 0.75,
    strokeWeight: 2,
    fillColor: "#FFC627",
    fillOpacity: 0.2,
  };
  var highlightedPolylineOptions = {
    strokeColor: "#FFC627",
    strokeOpacity: 1,
    strokeWeight: 3,
  };

  return Polygon;
});
