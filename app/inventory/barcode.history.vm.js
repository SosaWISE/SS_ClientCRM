define("src/inventory/barcode.history.vm", [
  'dataservice',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
  'src/inventory/barcode.history.gvm',
  'src/core/layers.vm',
  'src/ukov',
], function(
  dataservice,
  ko,
  utils,
  ControllerViewModel,
  BarcodeHistoryGridViewModel,
  LayersViewModel,
  ukov
) {
  "use strict";

  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,
    BarcodeNumber: {
      converter: nullStrConverter,
      validators: [
        ukov.validators.isRequired('Please enter a PO#')
      ]
    },
  };

  function BarcodeHistoryViewModel(options) {
    var _this = this;
    BarcodeHistoryViewModel.super_.call(_this, options);


    //This a layer for enter barcode screen pop up
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });
    _this.initFocusFirst();
    _this.data = ukov.wrap(_this.item || {}, schema);

    _this.historyListGvm = new BarcodeHistoryGridViewModel();
    //
    // Event Handlers
    //
    this.cmdSearch = ko.command(function(cb) {
      // _this.auditsGvm.setItems(utils.clone(locData.audits));
      dataservice.api_inv.productBarcodeHistory.read({
        id: _this.data.BarcodeNumber()
      }, function(resp) {
        _this.historyListGvm.list(resp);
      }, cb);
    });
    _this.resetPage = function() {
      //clear packing slip#
      _this.data.BarcodeNumber(null);
      //clear grid
      _this.historyListGvm.list([]);
    };

  }
  utils.inherits(BarcodeHistoryViewModel, ControllerViewModel);
  BarcodeHistoryViewModel.prototype.viewTmpl = 'tmpl-inventory-barcode-history';

  //
  // members
  //
  BarcodeHistoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    // var _this = this;

    // _this.historyListGvm.list([]);

    join.add()();
  };

  return BarcodeHistoryViewModel;
});