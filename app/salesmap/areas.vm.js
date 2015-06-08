define("src/salesmap/areas.vm", [
  "src/salesmap/polygon",
  "gmaps",
  "ko",
  "src/ukov",
  "dataservice",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  Polygon,
  gmaps,
  ko,
  ukov,
  dataservice,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  // var intConverter = ukov.converters.number(0);
  var areaSchema = {
    _model: true,
    ID: {
      // converter: intConverter,
    },
    Name: {
      validators: [
        ukov.validators.isRequired("Missing area name"),
      ],
    },
    // Paths: {},
    TeamId: {
      // converter: intConverter,
    },
    RepCompanyID: {},
    StartTime: {
      converter: ukov.converters.datetime("Invalid start time"),
    },
    EndTime: {
      converter: ukov.converters.datetime("Invalid end time"),
    },
  };

  function AreasViewModel(options) {
    var _this = this;
    AreasViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "mapMode",
      "gmapVm",
      "teams",
      "salesUsers",
    ]);

    _this.areasMap = {};

    // _this.teams = ko.observableArray([]);
    _this.selTeam = ko.observable();
    // _this.salesUsers = ko.observableArray([]);
    _this.selRep = ko.observable();

    _this.teamReps = ko.computed(function() {
      var selTeam = _this.selTeam();
      var list = _this.salesUsers();
      if (!selTeam || !selTeam.ID) {
        return list;
      }
      var teamId = selTeam.ID;
      return list.filter(function(item) {
        return item.ID === 0 || item.Recruits.some(function(item) {
          return item.TeamId === teamId;
        });
      });
    });

    _this.selTeam.subscribe(function(item) {
      var area = _this.currArea.peek();
      if (area) {
        area.data.TeamId(item.ID);
      }
    });
    _this.selRep.subscribe(function(item) {
      var area = _this.currArea.peek();
      if (area) {
        area.data.RepCompanyID(item.CompanyID || null);
      }
    });

    _this.currArea = ko.observable();
    // Handles clicks on sales areas (polygons)
    _this.handlePolygonClick = function(polygon) {
      if (_this.mapMode.peek() !== "areas") {
        return;
      }
      _this.currArea(polygon);
      _this.mode("edit");
    }; //

    // This method defines the attributes of all the sales areas on the map for each possible mode
    _this.mode = ko.observable("");
    _this._prevMode = "";
    _this.mode.subscribe(function() {
      updateMode(_this);
    });
    _this.mapMode.subscribe(function() {
      updateMode(_this);
    });

    //
    // events
    //
    _this.saveCurrentSalesArea = ko.command(function(cb) {
      var area = _this.currArea.peek();
      area.commitPathChanges();

      var paths = area.getPaths();
      if (!paths || !paths.length) {
        notify.warn("Missing map areas", null, 5);
        return cb();
      }
      if (!area.data.isValid.peek()) {
        notify.warn(area.data.errMsg.peek(), null, 5);
        return cb();
      }
      var model = area.data.getValue();
      model.Paths = paths;
      dataservice.api_sales.areas.save({
        id: model.ID || "", // create or update
        data: model,
      }, function(data) {
        updateArea(area, data);
        // ensure area is in the hash map
        _this.areasMap[data.ID] = area;
        //
        _this.mode("none");
      }, cb);
    }, function(busy) {
      return !busy && _this.currArea();
    });
    _this.newSalesArea = ko.command(function(cb) {
      _this.mode("new");
      cb();
    }, function(busy) {
      return !busy && _this.currArea();
    });
    _this.cancelCurrentSalesArea = ko.command(function(cb) {
      _this.mode("none");
      cb();
    }, function(busy) {
      return !busy && _this.currArea();
    });
    _this.deleteCurrentSalesArea = ko.command(function(cb) {
      var area = _this.currArea.peek();
      var id = area.data.ID.getValue();
      if (!id) {
        notify.warn("Missing map areas", null, 5);
        return cb();
      }
      dataservice.api_sales.areas.del({
        id: id,
      }, function() {
        // remove from areasMap
        delete _this.areasMap[id];
        // remove from gmap
        area.destroy();
        //
        _this.mode("none");
      }, cb);
    }, function(busy) {
      return !busy && _this.currArea();
    });
  }
  utils.inherits(AreasViewModel, BaseViewModel);

  // method to handle clicks on the map
  AreasViewModel.prototype.handleClick = function(mapMode, evt) {
    var _this = this;
    var area = _this.currArea.peek();
    if (_this.mode.peek() === "new" && area) {
      area.addPoint(evt.latLng);
    }
  };
  // Handles double click events on the map
  AreasViewModel.prototype.handleDoubleClick = function(mapMode, evt) {
    var _this = this;
    var area = _this.currArea.peek();
    if (_this.mode.peek() === "new" && area) {
      evt.stop();
      area.endPath();
    }
  };
  // Handles mousemove events on the map
  AreasViewModel.prototype.handleMouseMove = function(mapMode, evt) {
    var _this = this;
    var area = _this.currArea.peek();
    if (_this.mode.peek() === "new" && area) {
      area.updateUI(evt.latLng);
    }
  };
  //
  AreasViewModel.prototype.handleCenterChanged = function( /*mapMode, evt*/ ) {
    var _this = this;
    loopMap(_this.areasMap, function(areaId, area) {
      area.handleMapCenterChanged();
    });
  };

  function updateMode(_this) {
    var mapMode = _this.mapMode.peek(),
      mode = _this.mode.peek(),
      area = _this.currArea.peek(),
      clickable = false,
      hideOutline = false,
      draggableCursor = null,
      editable = false,
      highlight = false;
    if (mapMode === "areas") {
      switch (mode) {
        case "new":
          if (_this._prevMode === "edit") {
            throw new Error("mode cannot change from `edit` to `new`");
          }
          hideOutline = true;
          draggableCursor = "crosshair";
          // create currArea if one doesn't already exist
          area = area || createArea(_this);
          highlight = true;
          _this.currArea(area);
          break;
        case "edit":
          if (_this._prevMode === "new") {
            throw new Error("mode cannot change from `new` to `edit`");
          }
          //
          editable = true;
          highlight = true;
          break;
        default:
        case "none":
          clickable = true;
          hideOutline = true;
          // clear out currArea
          _this.currArea(null);

          if (area) {
            if (_this._prevMode === "new") {
              // remove
              area.destroy();
              area = null;
            } else {
              // revert
              area.updateUI();
              // use updated data if available
              if (area._cleanVal) {
                updateArea(area, area._cleanVal);
                area._cleanVal = null;
              }
            }
          }

          break;
      }
    }

    _this.gmapVm.gmap.setOptions({
      draggableCursor: draggableCursor,
    });
    loopMap(_this.areasMap, function(areaId, area) {
      area.setClickable(clickable);
      if (hideOutline) {
        area.hideOutline();
      }
      area.setHighlight(false);
    });
    if (area) {
      area.setEditable(editable);
      area.setHighlight(highlight);
    }

    //
    _this._prevMode = mode;
  }


  function loopMap(map, fn) {
    for (var key in map) {
      fn(key, map[key]); //, map);
    }
  }

  function createArea(_this, item) {
    var area = new Polygon(_this.gmapVm.gmap);
    area.data = ukov.wrap(item || {
      ID: 0,
    }, areaSchema);
    if (item) {
      updateArea(area, item);
    } else {
      area.showOutline(true);
    }
    area.onClick(_this.handlePolygonClick);
    return area;
  } //
  function updateArea(area, item) {
    area.setPaths(item.Paths);
    area.setLabel(item.Name);
  } //

  // // // Loads all of the company's sales areas within the bounds of the current map
  // // function reloadAreas(_this) {
  // //   var map = _this.gmapVm.gmap;
  // //   var zm = map.getZoom();
  // //   if (zm < 13) {
  // //     for (var i = 0; i < _this.allAreas.length; i++) {
  // //       _this.allAreas[i].hideArea();
  // //     }
  // //     _this.allAreas = [];
  // //     return;
  // //   }
  // //   load_areasInBounds(_this, function(list) {
  // //     // iterate through allAreas and remove any that not in the list
  // //     _this.allAreas.forEach(function(area, index) {
  // //       var found = list.some(function(item) {
  // //         if (area.ID === item.ID) {
  // //           found = true;
  // //           return true;
  // //         }
  // //       });
  // //       if (!found) {
  // //         area.destroy();
  // //         area.hideArea();
  // //         _this.allAreas.splice(index, 1);
  // //       }
  // //     });
  // //
  // //     // iterate through list and add to the map any that aren't in _this.contacts
  // //     list.forEach(function(item) {
  // //       is_found = false;
  // //       for (i = 0; i < _this.allAreas.length; i++) {
  // //         if (_this.allAreas[i].id === data.results[j].id) {
  // //           is_found = true;
  // //           break;
  // //         }
  // //       }
  // //       if (!is_found) {
  // //         // // add to map
  // //         // //console.log("add sales area to map: " + data.results[j].id);
  // //         // var sa = new SalesArea($scope.map);
  // //         // sa.id = data.results[j].id;
  // //         // var pd = JSON.parse(data.results[j].pointData);
  // //         // sa.setPaths(pd);
  // //         // sa.setClickHandler($scope, _this.handleSalesAreaClick);
  // //         //
  // //         // if (data.results[j].salesRepName) {
  // //         //   makeSalesAreaLabel($scope, sa, data.results[j].salesRepName + "'s Area");
  // //         // }
  // //         //
  // //         // sa.salesRepId = data.results[j].salesRepId;
  // //         // sa.officeId = data.results[j].officeId;
  // //         // sa.startTimestamp = new Date(data.results[j].startTimestamp);
  // //         //
  // //         // _this.allAreas.push(sa);
  // //       }
  // //     });
  // //   }, notify.iferror);
  // // } //
  AreasViewModel.prototype.reloadAreasInBounds = function(cb) {
    var _this = this;
    var map = _this.gmapVm.gmap;
    var areasMap = _this.areasMap;
    var zm = map.getZoom();
    if (zm < 13) {
      loopMap(areasMap, function(areaId, area) {
        area.hide();
      });
      if (utils.isFunc(cb)) {
        cb();
      }
      return;
    }

    var bounds = map.getBounds();
    load_areasInBounds(bounds, function(list) {
      var currArea = _this.currArea.peek();
      var currAreaId = currArea ? currArea.data.ID.peek() : 0;
      var updatedMap = {};
      list.forEach(function(item) {
        var areaId = item.ID;
        updatedMap[areaId] = true;
        // var position = new gmaps.LatLng(contact.Latitude, contact.Longitude);
        var area = areasMap[areaId];
        if (!area) {
          // store in map
          areasMap[areaId] = area = createArea(_this, item);
          area.handleMapCenterChanged();
        } else if (currAreaId !== areaId) {
          // update data
          updateArea(area, item);
        } else {
          // don't update if it's being edited, but store incase of edit cancellation
          area._cleanVal = item;
        }
      });

      loopMap(areasMap, function(areaId, area) {
        // remove deleted
        //@TODO: don't remove area's outside of bounds
        if (!updatedMap[areaId]) { // && bounds.contains(obj.lastPosition)) {
          // remove from areasMap
          delete areasMap[areaId];
          // remove from gmap
          area.destroy();
          return;
        }
        // ensure showing
        area.show();
      });

      //
      updateMode(_this);
    }, cb || notify.iferror);
  }; //
  function load_areasInBounds(bounds, setter, cb) {
    // get bounds of map
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // // check permissions and request the right amount of data.
    // // Don't get excited, hackers, the server double checks your authorization
    // var sr_id = 0;
    // var o_id = $site.user.officeId;
    // if ($site.hasPermission(['COMPANY_STATS'])) {
    //   o_id = 0;
    // }

    dataservice.api_sales.areas.read({
      link: "InBounds",
      query: {
        teamId: 0,
        repCompanyID: null,
        minlat: sw.lat(),
        minlng: sw.lng(),
        maxlat: ne.lat(),
        maxlng: ne.lng(),
      },
    }, setter, cb);
  } //

  return AreasViewModel;
});
