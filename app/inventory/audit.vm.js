define("src/inventory/audit.vm", [
  "src/inventory/audit.gvm",
  "src/inventory/audit-inventory.gvm",
  "src/inventory/invcache",
  "src/dataservice",
  "src/ukov",
  "ko",
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
    _this.data.LocationId.subscribe(function(id) {
      _this._loadedAudit = null;
      _this.auditsGvm.setItems([]);
      _this.onhandGvm.setItems([]);
      _this.excessGvm.setItems([]);
      if (!id) {
        return;
      }
      var join = joiner();
      var productBarcodes, audits;
      load_audits(id, function(list) {
        audits = list;
      }, join.add());
      load_productBarcodes(id, function(list) {
        productBarcodes = list;
      }, join.add());

      join.when(function(err) {
        notify.iferror(err);
        // check that it has not since changed
        if (_this.data.LocationId.getValue() === id) {
          // store data for location
          _this.locationData({
            audits: audits || [],
            productBarcodes: productBarcodes || [],
          });
        } else {
          _this.locationData(null);
        }
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
      cb();
    }, function(busy) {
      return !busy && !!_this.locationData() && !!_this.selectedAudit();
    });
    _this.cmdSaveAudit = ko.command(function(cb) {
      var audit = _this._loadedAudit;
      if (!audit) {
        if (!_this.data.isValid.peek()) {
          notify.warn(_this.data.errMsg.peek(), null, 7);
          return;
        }
        audit = _this.data.getValue();
        audit.ModifiedOn = new Date();
      }
      var barcodes = _this.onhandGvm.getBarcodeIDs();
      if (!barcodes.length) {
        notify.warn("No scanned barcodes", null, 2);
        return cb();
      }
      audit.Barcodes = barcodes;
      save_audit(audit, function(val) {
        if (val) {
          _this.auditsGvm.setItem(val);
          _this._loadedAudit = val;
        }
      }, cb);
    }, function(busy) {
      return !busy && !!_this.locationData();
    });
    _this.clickPrint = function() {
      //
    };
    _this.enterBarcode = function() {
      if (!_this.barcode.isValid.peek()) {
        // notify.warn(_this.barcode.errMsg.peek(), null, 7);
        return;
      }
      if (!_this.data.isValid.peek()) {
        notify.warn(_this.data.errMsg.peek(), null, 7);
        // _this.barcode(null);
        return;
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
    };
  }

  utils.inherits(AuditViewModel, ControllerViewModel);
  AuditViewModel.prototype.viewTmpl = "tmpl-inventory-audit";

  AuditViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this;
    invcache.ensure("locationTypes", join.add());

    ///////////////TESTING/////////////////////////////
    var _this = this;
    _this.data.LocationTypeCvm.selectedValue("Technician");
    _this.data.LocationCvm.selectedValue("1159");
    _this.barcode("714134610");
    ///////////////TESTING/////////////////////////////
  };

  function load_locations(locationTypeId, setter, cb) {
    dataservice.api_inv.locationTypes.read({
      id: locationTypeId,
      link: "Locations",
    }, setter, cb);
  }

  function load_audits(locationId, setter, cb) {
    dataservice.api_inv.locations.read({
      id: locationId,
      link: "Audits",
    }, setter, cb);
  }

  function load_productBarcodes(locationId, setter, cb) {
    dataservice.api_inv.locations.read({
      id: locationId,
      link: "ProductBarcodes",
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
