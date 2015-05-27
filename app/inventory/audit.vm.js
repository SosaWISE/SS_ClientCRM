define("src/inventory/audit.vm", [
  "src/inventory/audit.gvm",
  "src/inventory/audit-inventory.gvm",
  "src/inventory/invcache",
  "dataservice",
  "src/ukov",
  "ko",
  "src/core/printer",
  "src/core/joiner",
  "src/core/combo.vm",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  AuditGridViewModel,
  AuditInventoryGridViewModel,
  invcache,
  dataservice,
  ukov,
  ko,
  printer,
  joiner,
  ComboViewModel,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var barcodeSchema = {
    validators: [
      ukov.validators.isRequired("Please enter a barcode"),
    ],
  };
  var schema = {
    _model: true,
    //
    LocationTypeId: {
      validators: [
        ukov.validators.isRequired("Please select a location type"),
      ],
    },
    LocationId: {
      validators: [
        ukov.validators.isRequired("Please select a location"),
      ],
    },
  };

  function AuditViewModel(options) {
    var _this = this;
    AuditViewModel.super_.call(_this, options);
    // utils.assertPropFuncs(_this, [
    //   "save",
    // ]);
    _this.mayReload = ko.observable();
    _this.initFocusFirst();
    _this.initHandler();

    _this.barcode = ukov.wrap("", barcodeSchema);
    _this.data = ukov.wrap({}, schema);
    _this.data.LocationTypeCvm = new ComboViewModel({
      selectedValue: _this.data.LocationTypeId,
      fields: invcache.metadata("locationTypes"),
    }).subscribe(invcache.getList("locationTypes"), _this.handler);
    _this.data.LocationCvm = new ComboViewModel({
      selectedValue: _this.data.LocationId,
      // fields: {
      //   value: "ID",
      //   text: "Name",
      // },
      fields: invcache.metadata("locationTypes"),
    });

    _this.locationData = ko.observable();
    _this.selectedAudit = ko.observable();

    _this.data.LocationTypeId.subscribe(function(id) {
      _this.data.LocationCvm.setList([]);
      _this.data.LocationId(null);
      if (!id) {
        return;
      }
      load_locations(id, function(list) {
        // check that it has not since changed
        if (_this.data.LocationTypeId.getValue() === id) {
          _this.data.LocationCvm.setList(list);
        }
      }, notify.iferror);
    });
    _this.data.LocationId.subscribe(function() {
      _this.canReconcile(false);
      _this._loadedAudit = null;
      _this.auditsGvm.setItems([]);
      _this.onhandGvm.setItems([]);
      _this.excessGvm.setItems([]);
      if (!_this.data.isValid.peek()) {
        return;
      }
      var model = _this.data.getValue();
      loadLocationData(_this, model.LocationId, model.LocationTypeId, function() {
        // immediately start a new audit
        _this.cmdNewAudit.execute();
      });
    });

    _this.auditsGvm = new AuditGridViewModel({
      onSelectedRowsChanged: function(rows) {
        _this.selectedAudit(rows[0]);
      },
    });

    _this.onhandGvm = new AuditInventoryGridViewModel({
      showScanned: true,
    });
    _this.excessGvm = new AuditInventoryGridViewModel();

    //
    // events
    //
    _this.cmdNewAudit = ko.command(function(cb) {
      _this.canReconcile(false);
      // set data for location
      var locData = _this.locationData.peek();
      _this._loadedAudit = null;
      _this.auditsGvm.setItems(utils.clone(locData.audits));
      _this.onhandGvm.setItems(utils.clone(locData.productBarcodes), -1);
      // remove all from excess grid
      _this.excessGvm.setItems([]);
      // // deselect audit
      // _this.auditsGvm.setSelectedRows([]);
      //
      cb();
    }, function(busy) {
      return !busy && !!_this.locationData();
    });
    _this.cmdLoadAudit = ko.command(function(cb) {
      _this.canReconcile(false);
      setAudit(_this);
      cb();
    }, function(busy) {
      var selectedAudit = _this.selectedAudit();
      return !busy && !!_this.locationData() && (selectedAudit && !selectedAudit.IsClosed);
    });
    _this.cmdSaveAudit = ko.command(function(cb) {
      var model = _this._loadedAudit;
      if (!model) {
        if (!_this.data.isValid.peek()) {
          notify.warn(_this.data.errMsg.peek(), null, 7);
          return cb();
        }
        model = _this.data.getValue();
        model.ModifiedOn = new Date();
      }
      var barcodes = _this.onhandGvm.getBarcodeIDs();
      // if (!barcodes.length) {
      //   notify.warn("No scanned barcodes", null, 2);
      //   return cb();
      // }
      model.Barcodes = barcodes;
      var join = joiner();
      save_audit(model, function(val) {
        if (val) {
          _this.canReconcile(true);
          _this.auditsGvm.setItem(val);
          _this.selectedAudit(val);
          loadLocationData(_this, model.LocationId, model.LocationTypeId, utils.safeCallback(join.add(), function() {
            setAudit(_this);
          }, utils.noop));
        }
      }, join.add());
      join.when(cb);
    }, function(busy) {
      return !busy && !!_this.locationData();
    });
    _this.canReconcile = ko.observable(false);
    _this.cmdReconcile = ko.command(function(cb) {
      if (!_this.data.isValid.peek()) {
        notify.warn(_this.data.errMsg.peek(), null, 7);
        return cb();
      }
      var model = _this.data.getValue();
      var join = joiner();
      reconcileEquipment(model.LocationId, model.LocationTypeId, function(reconciledBarcodes) {
        if (!reconciledBarcodes || !reconciledBarcodes.length) {
          notify.info("No barcodes were reconciled", null, 7);
        } else {
          loadLocationData(_this, model.LocationId, model.LocationTypeId, join.add());
          notify.info("Barcodes Reconciled", reconciledBarcodes.join(", "), 0);
        }
      }, join.add());
      join.when(cb);
    }, function(busy) {
      return !busy && _this.canReconcile();
    });
    _this.clickPrint = function() {
      var vm = {
        viewTmpl: "tmpl-inventory-print_inventory",
        groups: [ //
          {
            title: "Items that are in inventory but not scanned",
            items: _this.onhandGvm.getItems(),
          }, {
            title: "Items that are scanned but not in the inventory",
            items: _this.excessGvm.getItems(),
          },
        ],
      };
      printer.print("Audit Report", vm, false);
    };
    _this.enterBarcode = function() {
      if (!_this.barcode.isValid.peek()) {
        // notify.warn(_this.barcode.errMsg.peek(), null, 7);
        return true;
      }
      if (!_this.data.isValid.peek()) {
        notify.warn(_this.data.errMsg.peek(), null, 7);
        // _this.barcode(null);
        return true;
      }
      //
      var barcode = _this.barcode.getValue();
      _this.barcode(null); // clear barcode
      //
      if (!_this.onhandGvm.scanItem(barcode)) {
        load_productBarcode(barcode, function(item) {
          if (item) {
            _this.excessGvm.setItem(item);
          } else {
            notify.warn(strings.format("Barcode `{0}` not found.", barcode), null, 3);
            _this.excessGvm.setItem({
              ProductBarcodeID: barcode,
              ItemDesc: "[Unknown barcode]",
              isUnknown: true,
            });
          }
        }, notify.iferror);
      }

      return true; // prevent default browser action
    };
  }

  function setAudit(_this) {
    // set data for location
    var locData = _this.locationData.peek();
    var audit = _this.selectedAudit.peek();
    _this._loadedAudit = audit;
    // _this.auditsGvm.setItems(utils.clone(locData.audits));
    _this.onhandGvm.setItems(utils.clone(locData.productBarcodes), audit.ID);
    // remove all from excess grid
    _this.excessGvm.setItems([]);
    // // deselect audit
    // _this.auditsGvm.setSelectedRows([]);
    //
  }

  function loadLocationData(_this, locationId, locationTypeId, cb) {
    var join = joiner();
    var productBarcodes, audits;
    load_audits(locationId, locationTypeId, function(list) {
      audits = list;
    }, join.add());
    load_productBarcodes(locationId, locationTypeId, function(list) {
      productBarcodes = list;
    }, join.add());

    _this.locationData(null);
    join.when(function(err) {
      notify.iferror(err);
      // check that it has not since changed
      if (_this.data.LocationId.getValue() === locationId) {
        // store data for location
        _this.locationData({
          audits: audits || [],
          productBarcodes: productBarcodes || [],
        });
      }
    }).when(cb);
  }

  utils.inherits(AuditViewModel, ControllerViewModel);
  AuditViewModel.prototype.viewTmpl = "tmpl-inventory-audit";

  AuditViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this;
    invcache.ensure("locationTypes", join.add());

    // ///////////////TESTING/////////////////////////////
    // var _this = this;
    // _this.data.LocationTypeCvm.selectedValue("Technician");
    // _this.data.LocationCvm.selectedValue("1159");
    // _this.barcode("714134610");
    // ///////////////TESTING/////////////////////////////
  };

  function load_locations(locationTypeId, setter, cb) {
    dataservice.api_inv.locationTypes.read({
      id: locationTypeId,
      link: "Locations",
    }, setter, cb);
  }

  function load_audits(locationId, locationTypeId, setter, cb) {
    load_locationTypeLink(locationId, locationTypeId, "Audits", setter, cb);
  }

  function load_productBarcodes(locationId, locationTypeId, setter, cb) {
    load_locationTypeLink(locationId, locationTypeId, "ProductBarcodes", setter, cb);
  }

  function load_locationTypeLink(locationId, locationTypeId, link, setter, cb) {
    dataservice.api_inv.locationTypes.read({
      id: locationTypeId,
      link: strings.format("Locations/{0}/{1}", locationId, link),
    }, setter, cb);
  }

  function reconcileEquipment(locationId, locationTypeId, setter, cb) {
    dataservice.api_inv.locationTypes.save({
      id: locationTypeId,
      link: strings.format("Locations/{0}/Reconcile", locationId),
    }, setter, cb);
  }

  function load_productBarcode(id, setter, cb) {
    dataservice.api_inv.productBarcodes.read({
      id: id,
    }, setter, cb);
  }

  function save_audit(data, setter, cb) {
    dataservice.api_inv.audits.save({
      id: data.ID || "",
      data: data,
    }, setter, cb);
  }

  return AuditViewModel;
});
