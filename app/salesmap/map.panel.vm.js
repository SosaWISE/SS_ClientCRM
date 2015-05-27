define("src/salesmap/map.panel.vm", [
  "src/salesmap/contact.editor.vm",
  "src/salesmap/maphelper",
  "src/salesmap/gmap.vm",
  "src/sales/dataservice",
  "gmaps",
  "ko",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
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

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.categorys = ko.observableArray([]);
    _this.systemTypes = ko.observableArray([]);
    _this.contactMap = {};
    _this.contactVm = ko.observable(null);
    _this.gmapVm = new GmapViewModel();
    _this.mapMode = ko.observable("knocking");

    //
    // events
    //
    // function bindEvent(name) {
    //   ...
    // }
    // bindEvent("click"); //handleClick(evt, evt.latLng);
    // bindEvent("dblclick"); //handleDoubleClick(evt, evt.latLng);
    // bindEvent("mousemove"); //handleMouseMove(evt, evt.latLng);
    // bindEvent("idle");
    // bindEvent("drag");

    _this.gmapVm.on("click", function(evt) {
      var mode = _this.mapMode.peek();
      switch (mode) {
        case "areas":
          // SalesArea.handleMapEvent(mode, name, evt, evt.latLng);
          break;
        case "knocking":
          contactMarker(_this, evt.latLng);
          break;
      }
    });
    _this.gmapVm.on("idle", function( /*evt*/ ) {
      var mode = _this.mapMode.peek();
      switch (mode) {
        case "areas":
          break;
        case "knocking":
          reloadContactsInBounds(_this);
          break;
      }
    });
  }
  utils.inherits(MapPanelViewModel, ControllerViewModel);

  MapPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.categorys([]);
    _this.systemTypes([]);
    load_categorys(_this, _this.categorys, join.add());
    load_systemTypes(_this, _this.systemTypes, join.add());
  };

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
            marker: createContactMark(_this, contact.ID, position),
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
      for (var contactId in contactMap) {
        if (!updatedMap[contactId] && bounds.contains(contactMap[contactId].lastPosition)) {
          // remove from contactMap
          var item = contactMap[contactId];
          delete contactMap[contactId];
          // remove from gmap
          removeMarker(item.marker);
        }
      }
    }, notify.iferror);
  } //
  function load_contactsInBounds(bounds, setter, cb) {
    // get bounds of map
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // // check permissions and request the right amount of data.
    // var userId = $site.user.userId;
    // var officeId = $site.user.officeId;
    // if ($site.hasPermission(['OFFICE_STATS', 'COMPANY_STATS'])) {
    //   userId = 0;
    // }
    // if ($site.hasPermission(['COMPANY_STATS'])) {
    //   officeId = 0;
    // }

    dataservice.api_sales.contacts.read({
      // id: ????
      link: "InBounds",
      query: {
        // salesRepId: 0,
        // officeId: 0,
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
  }


  var IMG_PATH = "/stuff/img/";

  function createContactMark(_this, contactId, position) {
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
      contactVm.marker = createContactMark(_this, -1, position);
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
    var marker = contactVm.marker;
    if (!contact) {
      // reset to before edit
      var item = _this.contactMap[marker._contactId];
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
