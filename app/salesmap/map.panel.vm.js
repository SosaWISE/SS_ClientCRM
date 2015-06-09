define("src/salesmap/map.panel.vm", [
  "src/salesmap/areas.vm",
  "src/salesmap/categorys.vm",
  "src/salesmap/contact.editor.vm",
  "src/salesmap/maphelper",
  "src/salesmap/gmap.vm",
  "dataservice",
  "gmaps",
  "ko",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  AreasViewModel,
  CategorysViewModel,
  ContactEditorViewModel,
  maphelper,
  GmapViewModel,
  dataservice,
  gmaps,
  ko,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  // ko.bindingHandlers.datepickervalue = {
  //   init: function(element, valueAccessor) {
  //     ko.utils.registerEventHandler(element, "change", function() {
  //       var value = valueAccessor();
  //       value(new Date(element.value));
  //     });
  //   },
  //   update: function(element, valueAccessor) {
  //     var value = ko.unwrap(valueAccessor());
  //     // element.value = (value) ? value.toISOString() : "";
  //     if (value) {
  //       element.value = value.toISOString();
  //     }
  //   }
  // };

  function MapPanelViewModel(options) {
    var _this = this;
    MapPanelViewModel.super_.call(_this, options);
    _this.initHandler();

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.categorys = createIconArray(_this, "categories", "Name");
    _this.systemTypes = createIconArray(_this, "systems", "CompanyName");

    _this.contactMap = {};
    _this.contactVm = ko.observable(null);
    _this.gmapVm = new GmapViewModel();
    _this.mapMode = ko.observable("knocking");

    _this.teams = ko.observableArray([]);
    _this.selTeam = ko.observable();
    _this.salesUsers = ko.observableArray([]);
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

    _this.areasVm = new AreasViewModel({
      mapMode: _this.mapMode,
      gmapVm: _this.gmapVm,
      teams: _this.teams,
      salesUsers: _this.salesUsers,
    });

    _this.showSettings = ko.observable();
    _this.showTools = ko.observable();
    _this.showAreas = ko.computed(function() {
      return _this.mapMode() === "areas" && !_this.areasVm.currArea();
    });
    _this.showNewArea = ko.computed(function() {
      return _this.mapMode() === "areas" && _this.areasVm.currArea();
    });

    _this.iconMode = ko.observable("category");
    // _this.iconMode("system");

    //
    // events
    //

    _this.toggleSettings = function() {
      _this.showSettings(!_this.showSettings.peek());
    };
    _this.toggleTools = function() {
      _this.showTools(!_this.showTools.peek());
    };
    _this.canTools = ko.computed(function() {
      return 1;
    });
    _this.editAreas = function() {
      _this.showTools(false);
      _this.mapMode("areas");
    };
    _this.stopEditAreas = function() {
      _this.mapMode("knocking");
    };
    _this.newSalesArea = function() {
      _this.areasVm.mode("new");
    };

    function setAllChecked(list, checked) {
      list.forEach(function(item) {
        item.checked(checked);
      });
      filterContactMap(_this);
    }
    _this.checkAllCategorys = function() {
      setAllChecked(_this.categorys.peek(), true);
    };
    _this.checkNoCategorys = function() {
      setAllChecked(_this.categorys.peek(), false);
    };
    _this.cmdEditCategorys = ko.command(function(cb) {
      var vm = new CategorysViewModel({
        layersVm: _this.layersVm,
        categoryIcons: _this.categoryIcons,
        categorys: _this.categorys,
      });
      _this.layersVm.show(vm, cb);
    });
    _this.checkAllSystemTypes = function() {
      setAllChecked(_this.systemTypes.peek(), true);
    };
    _this.checkNoSystemTypes = function() {
      setAllChecked(_this.systemTypes.peek(), false);
    };


    if (!maphelper.coordsEnabled()) {
      notify.warn("You can't use the app without location services enabled", null, 0);
      return;
    }
    // bindEvent("dblclick"); //handleDoubleClick(evt, evt.latLng);
    // bindEvent("drag");

    _this.gmapVm.on("click", function(evt) {
      var mode = _this.mapMode.peek();
      switch (mode) {
        case "areas":
          _this.areasVm.handleClick(mode, evt);
          break;
        case "knocking":
          contactMarker(_this, evt.latLng);
          break;
      }
    });
    _this.gmapVm.on("dblclick", function(evt) {
      var mode = _this.mapMode.peek();
      switch (mode) {
        case "areas":
          _this.areasVm.handleDoubleClick(mode, evt);
          break;
        case "knocking":
          break;
      }
    });
    _this.gmapVm.on("mousemove", function(evt) {
      var mode = _this.mapMode.peek();
      switch (mode) {
        case "areas":
          _this.areasVm.handleMouseMove(mode, evt);
          break;
        case "knocking":
          break;
      }
    });
    _this.gmapVm.on("idle", function( /*evt*/ ) {
      var mode = _this.mapMode.peek();
      switch (mode) {
        case "areas":
          // _this.areasVm.reloadAreasInBounds();
          break;
        case "knocking":
          reloadContactsInBounds(_this);
          break;
      }
      _this.areasVm.reloadAreasInBounds();
    });
    _this.gmapVm.on("center_changed", function(evt) {
      var mode = _this.mapMode.peek();
      switch (mode) {
        case "areas":
          // _this.areasVm.handleCenterChanged(mode, evt);
          break;
        case "knocking":
          break;
      }
      _this.areasVm.handleCenterChanged(mode, evt);
    });
  }
  utils.inherits(MapPanelViewModel, ControllerViewModel);

  function iconPath(iconDir, filename) {
    return IMG_PATH + "map/markers/" + iconDir + "/" + filename;
  }

  function createIconArray(_this, iconDir, sortProp) {
    var ray = ko.observableArray([]);

    function reFilterContacts() {
      filterContactMap(_this);
    } //
    function addProps(item) {
      if (!item.checked) {
        item.checked = ko.observable(true);
        _this.handler.subscribe(item.checked, reFilterContacts, true);
      }
      if (!item.icon) {
        // add icon to each item
        item.icon = {
          url: iconPath(iconDir, item.Filename),
          scaledSize: new gmaps.Size(24, 24),
          origin: new gmaps.Point(0, 0),
          anchor: new gmaps.Point(12, 12),
        };
      }
    } //

    var sorter = createSortByProp(sortProp);

    ray.replaceItem = function(id, newItem) {
      var list = ray.peek();
      var found = list.some(function(item, index) {
        if (item.ID === id) {
          if (newItem) {
            // resuse checked observable
            newItem.checked = item.checked;
            addProps(newItem);
            list.splice(index, 1, newItem);
          } else {
            ray.splice(index, 1);
          }
          return true;
        }
      });
      if (newItem) {
        if (!found) {
          addProps(newItem);
          list.push(newItem);
        }
        ray.sort(sorter);
      }
    };
    ray.removeById = function(id) {
      ray.replaceItem(id);
    };
    ray.updateItem = function(item) {
      ray.replaceItem(item.ID, item);
    };
    ray.setList = function(list) {
      list.forEach(addProps);
      list.sort(sorter);
      ray(list);
    };

    // re-set icons on any change
    ray.subscribe(function() {
      setContactIcons(_this);
    });

    //
    return ray;
  }

  function updateSalesRepMarker(_this, coords) {
    var marker = _this.salesRepMarker || (_this.salesRepMarker = new gmaps.Marker({
      // position: window.defaultLocation,
      map: _this.gmapVm.gmap,
      icon: {
        url: IMG_PATH + "map/salesRep.png",
        scaledSize: new gmaps.Size(50, 50),
        origin: new gmaps.Point(0, 0),
        anchor: new gmaps.Point(25, 25),
      },
      zIndex: 110,
    }));
    if (coords) {
      marker.setPosition(coords);
    }
  }

  MapPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    if (!maphelper.coordsEnabled()) {
      return;
    }

    var firstTime = true; //
    function updateMarkerPostion() {
      maphelper.getCoords(function(coords) {
        updateSalesRepMarker(_this, coords);
        // center the map the first time
        if (coords && firstTime) {
          firstTime = false;
          _this.gmapVm.gmap.setCenter(coords);
        }
      });
    }
    window.clearInterval(_this._coordsIntervalId);
    _this._coordsIntervalId = window.setInterval(updateMarkerPostion, 12000);
    updateMarkerPostion();

    //
    _this.areasVm.load(routeData, extraData, join.add());
    //
    _this.categorys([]);
    load_categorys(_this, function(list) {
      _this.categorys.setList(list);
    }, join.add());
    //
    _this.systemTypes([]);
    load_systemTypes(_this, function(list) {
      _this.systemTypes.setList(list);
    }, join.add());

    //
    function onCheckedChanged() {
      filterContactMap(_this);
    } //
    _this.teams([]);
    _this.handler.subscribe(_this.selTeam, onCheckedChanged, true);
    load_teams(_this, function(list) {
      list = list.map(function(item) {
        return {
          ID: item.TeamId,
          Name: item.Team.Description,
        };
      });
      list.push({
        ID: 0,
        Name: "All offices",
      });
      list.sort(createSortByProp("Name"));
      _this.teams(list);
    }, join.add());
    //
    _this.salesUsers([]);
    _this.handler.subscribe(_this.selRep, onCheckedChanged, true);
    load_salesUsers(_this, function(list) {
      list.push({
        ID: 0,
        FullName: "All reps",
        Recruits: [],
      });
      list.sort(createSortByProp("FullName"));
      _this.salesUsers(list);
    }, join.add());

    //
    function onIconModeChanged() {
      setContactIcons(_this);
    } //
    _this.handler.subscribe(_this.iconMode, onIconModeChanged, true);

    //
    _this.categoryIcons = [];
    load_categoryIcons(_this, function(list) {
      _this.categoryIcons = list;
    }, join.add());
  };

  function createSortByProp(prop) {
    return function(a, b) {
      if (a.ID !== b.ID) {
        // item with ID of zero goes first
        if (a.ID === 0) {
          return -1;
        }
        if (b.ID === 0) {
          return 1;
        }
      }
      // case insensitive
      a = a[prop].toUpperCase();
      b = b[prop].toUpperCase();
      if (a === b) {
        return 0;
      } else {
        return (a < b) ? -1 : 1;
      }
    };
  }

  function filterContactMap(_this, tmpContactMap) {
    var salesUsers = _this.salesUsers.peek();
    var selTeam = _this.selTeam.peek();
    // var teamReps = _this.teamReps.peek();
    var selRep = _this.selRep.peek();
    var categorys = _this.categorys.peek();
    var systemTypes = _this.systemTypes.peek();
    var gmap = _this.gmapVm.gmap;
    loopMap(tmpContactMap || _this.contactMap, function(contactId, obj) {
      var contact = obj.contact;
      var show = (
        // no rep is selected or the selected rep matches the contact's rep
        ((!selRep || !selRep.ID) || contact.RepCompanyID === selRep.CompanyID) &&
        // no team is selected or the selected team matches the contact's team
        ((!selTeam || !selTeam.ID) || repHasTeamId(contact.RepCompanyID, selTeam.ID)) &&
        // category is checked or not found
        (idChecked(categorys, contact.CategoryId)) &&
        // systemType is checked or not found
        (idChecked(systemTypes, contact.SystemId))
      );
      var map = (show ? gmap : null);
      if (map !== obj.marker.getMap()) {
        // only set the map if different, or else the marker will flicker
        obj.marker.setMap(map);
      }
    });

    function repHasTeamId(repCompanyID, teamId) {
      return salesUsers.some(function(item) {
        return item.CompanyID === repCompanyID && item.Recruits.some(function(item) {
          return item.TeamId === teamId;
        });
      });
    } //
    function idChecked(list, id) {
      var found = byID(list, id);
      if (!found) {
        // @NOTE: when the id is not found in the list it is impossible for
        //        it to checked. we should always show those types of items.
        return true;
      }
      return found.checked.peek();
    } //
  } //
  function setContactIcons(_this, tmpContactMap) {
    var list, idName;
    switch (_this.iconMode.peek()) {
      case "category":
        list = _this.categorys.peek();
        idName = "CategoryId";
        break;
      case "system":
        list = _this.systemTypes.peek();
        idName = "SystemId";
        break;
      default:
        list = [];
        idName = "";
        break;
    }

    loopMap(tmpContactMap || _this.contactMap, function(contactId, obj) {
      var item = byID(list, obj.contact[idName]);
      var icon = (item) ? item.icon : null;
      obj.marker.setIcon(icon);
    });
  } //

  function byID(list, id) {
    var result;
    list.some(function(item) {
      if (item.ID === id) {
        result = item;
        return true;
      }
    });
    return result;
  } //

  function reloadContactsInBounds(_this) {
    var contactMap = _this.contactMap;
    var bounds = _this.gmapVm.gmap.getBounds();
    load_contactsInBounds(bounds, function(contacts) {
      var contactVm = _this.contactVm.peek();
      var currContactId = contactVm ? contactVm.marker._contactId : 0;
      var updatedMap = {};
      contacts.forEach(function(contact) {
        var contactId = contact.ID;
        updatedMap[contactId] = true;
        var position = new gmaps.LatLng(contact.Latitude, contact.Longitude);
        var item = contactMap[contactId];
        if (!item) {
          // store in map
          contactMap[contactId] = item = {
            contact: contact,
            marker: createContactMarker(_this, contact.ID, position),
            lastPosition: position,
          };
        } else {
          // if (currContactId === contactId) {
          //   // update values that are being edited
          //   contactVm.data.setValue(contact);
          // }
          // update data
          item.contact = contact;
          if (currContactId !== contactId) {
            // don't move the marker if it's being edited
            item.marker.setPosition(position);
          }
          item.lastPosition = position;
        }
      });

      // remove deleted
      loopMap(contactMap, function(contactId, obj) {
        if (!updatedMap[contactId] && bounds.contains(obj.lastPosition)) {
          // remove from contactMap
          delete contactMap[contactId];
          // remove from gmap
          removeMarker(obj.marker);
        }
      });

      filterContactMap(_this);
      setContactIcons(_this);
    }, notify.iferror);
  } //
  function load_contactsInBounds(bounds, setter, cb) {
    // get bounds of map
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // // check permissions and request the right amount of data.
    // var userId = $site.user.userId;
    // var teamId = $site.user.teamId;
    // if ($site.hasPermission(["OFFICE_STATS", "COMPANY_STATS"])) {
    //   userId = 0;
    // }
    // if ($site.hasPermission(["COMPANY_STATS"])) {
    //   teamId = 0;
    // }

    dataservice.api_sales.contacts.read({
      // id: ????
      link: "InBounds",
      query: {
        // salescompanyId: 0,
        // teamId: 0,
        minlat: sw.lat(),
        minlng: sw.lng(),
        maxlat: ne.lat(),
        maxlng: ne.lng(),
      },
    }, setter, cb);
  }

  function load_categorys(_this, setter, cb) {
    dataservice.api_sales.categorys.read({}, setter, cb);
  } //
  function load_systemTypes(_this, setter, cb) {
    dataservice.api_sales.systemTypes.read({}, setter, cb);
  } //
  function load_teams(_this, setter, cb) {
    dataservice.api_hr.teams.read({
      link: "sales",
    }, setter, cb);
  } //
  function load_salesUsers(_this, setter, cb) {
    dataservice.api_hr.users.read({
      link: "sales",
    }, setter, cb);
  } //
  function load_categoryIcons(_this, setter, cb) {
    dataservice.api_sales.categorys.read({
      link: "icons",
    }, function(filenames) {
      setter(filenames.map(function(filename) {
        return {
          ID: filename,
          Name: iconPath("categories", filename),
        };
      }));
    }, cb);
  } //


  var IMG_PATH = "/stuff/img/";

  function createContactMarker(_this, contactId, position) {
    var marker = new gmaps.Marker({
      _contactId: contactId,
      position: position,
      map: _this.gmapVm.gmap,
      icon: {
        url: IMG_PATH + "map/new-marker.png",
        scaledSize: new gmaps.Size(62, 62),
        origin: new gmaps.Point(0, 0),
        anchor: new gmaps.Point(31, 31),
      },
      zIndex: 99,
    });
    gmaps.event.addListener(marker, "click", function( /*evt*/ ) {
      onMarkerClicked(_this, this); //, evt.latLng);
    });
    window._allMarkers.push(marker);
    return marker;
  } //
  window._allMarkers = []; //
  function removeMarker(marker) {
    marker.setMap(null);
    ko.utils.arrayRemoveItem(window._allMarkers, marker);
  } //
  // Places a marker on the map so the user can input a new contact
  function contactMarker(_this, position) {
    var contactVm = _this.contactVm.peek();
    if (!contactVm) {
      contactVm = new ContactEditorViewModel();
      contactVm.marker = createContactMarker(_this, -1, position);
      _this.contactVm(contactVm);
      showSideLayer(contactVm, function(val) {
        onContactSaved(_this, val);
      });
    } else {
      // change position
      contactVm.marker.setPosition(position);
    }
    reverseGeocodeContact(_this, position);
  } //
  function onContactSaved(_this, contact) {
    var contactVm = _this.contactVm.peek();
    if (!contactVm) {
      return; // not sure how this happened
    }
    // remove current contact editor
    _this.contactVm(null);

    //
    var item;
    var marker = contactVm.marker;
    if (!contact) {
      // reset to before edit
      item = _this.contactMap[marker._contactId];
      if (item) {
        // was editing existing. reset to before edit
        marker.setPosition(item.lastPosition);
      } else {
        // was adding new. remove from map
        removeMarker(marker);
      }
    } else {
      // ensure id is set on marker
      marker._contactId = contact.ID;
      // add to contactMap
      _this.contactMap[contact.ID] = {
        contact: contact,
        marker: marker,
        lastPosition: marker.getPosition(),
      };
    }

    item = _this.contactMap[marker._contactId];
    if (item) {
      // only update this marker
      var tmpContactMap = {};
      tmpContactMap[marker._contactId] = _this.contactMap[marker._contactId];
      filterContactMap(_this, tmpContactMap);
      setContactIcons(_this, tmpContactMap);
      // check if marker is visible on the map
      if (!item.marker.getMap()) {
        notify.warn("Saved contact does not match the current filters and is no longer visible on the map.", null, 5);
      }
    }
  } //
  function onMarkerClicked(_this, marker /*, position*/ ) {
    var contactVm = _this.contactVm.peek();
    // already editing a contact
    if (contactVm) {
      return;
    }
    var item = _this.contactMap[marker._contactId];
    contactVm = new ContactEditorViewModel({
      item: utils.clone(item.contact),
    });
    contactVm.marker = marker;
    _this.contactVm(contactVm);
    showSideLayer(contactVm, function(val) {
      onContactSaved(_this, val);
    });
  } //
  function reverseGeocodeContact(_this, position) {
    var contactVm = _this.contactVm.peek();
    maphelper.reverseGeocode(position, function(errMsg, data, results) {
      if (errMsg) {
        notify.warn(errMsg, null, 2);
        return;
      }
      // ensure the contact hasn't changed
      if (contactVm !== _this.contactVm.peek()) {
        return;
      }
      //
      contactVm.data.setValue(data);
      if (contactVm.fullAddress.peek() !== results[0].formatted_address) {
        console.warn("addresses differ: ");
        console.warn("    formatted_address: ", results[0].formatted_address);
        console.warn("          fullAddress: ", contactVm.fullAddress.peek());
      }
    });
  }

  function loopMap(map, fn) {
    for (var key in map) {
      fn(key, map[key]); //, map);
    }
  }

  function showSideLayer(vm, onClose) {
    var layer = {
      close: function() {
        // check if the layer vm can be closed
        var msg = vm.closeMsg();
        if (msg) {
          notify.warn(msg, null, 7);
          return false;
        }
        if (!vm.canClose()) {
          return false;
        }
        // destroy vm
        vm.destroy();
        // call onClose
        if (utils.isFunc(onClose)) {
          var results = utils.isFunc(vm.getResults) ? vm.getResults() : [];
          onClose.apply(null, results);
        }
      },
    };
    var ctx = createContext(vm, {}, null, function() {
      // console.log("activated layer");
    });
    // vm.layersVm = layersVm;
    vm.layer = layer;
    vm.activate(ctx);
  }
  // mimic how the router works
  function createContext(vm, routeData, extraData, cb) {
    if (!routeData) {
      return;
    }
    var disposed;
    return {
      routeData: routeData,
      extraData: extraData || {},
      dispose: function() {
        disposed = true;
        delete vm.layersVm;
        delete vm.layer;
        vm.deactivate();
      },
      active: function() {
        return !disposed;
      },
      done: function() {
        cb();
      },
    };
  }

  return MapPanelViewModel;
});
