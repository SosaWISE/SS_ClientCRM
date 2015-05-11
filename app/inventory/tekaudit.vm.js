define("src/inventory/tekaudit.vm", [
  "src/inventory/tekaudit.gvm",
  "src/inventory/tekinventory.gvm",
  "src/inventory/invcache",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/combo.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  TekAuditGridViewModel,
  TekInventoryGridViewModel,
  invcache,
  dataservice,
  ukov,
  ko,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

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
    Barcode: {
      validators: [
        ukov.validators.isRequired("Please enter a barcode"),
      ],
    },
  };

  function TekAuditViewModel(options) {
    var _this = this;
    TekAuditViewModel.super_.call(_this, options);
    // utils.assertPropFuncs(_this, [
    //   "save",
    // ]);
    _this.initFocusFirst();
    _this.initHandler();

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

    _this.data.LocationTypeId.subscribe(function(id) {
      load_locations(id, function(list) {
        // check that it has not since changed
        if (_this.data.LocationTypeId.getValue() === id) {
          _this.data.LocationCvm.setList(list);
        }
      }, notify.iferror);
    });

    _this.auditsGvm = new TekAuditGridViewModel();

    _this.onhandGvm = new TekInventoryGridViewModel({
      showScanned: true,
    });
    _this.excessGvm = new TekInventoryGridViewModel();

    //
    // events
    //
  }

  utils.inherits(TekAuditViewModel, ControllerViewModel);
  TekAuditViewModel.prototype.viewTmpl = "tmpl-inventory-tekaudit";

  TekAuditViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    // var _this = this;
    invcache.ensure("locationTypes", join.add());
  };

  function load_locations(locationTypeId, setter, cb) {
    if (!locationTypeId) {
      setter([]);
      return cb();
    }
    dataservice.api_inv.locationTypes.read({
      id: locationTypeId,
      link: "Locations",
    }, setter, cb);
  }

  return TekAuditViewModel;
});
