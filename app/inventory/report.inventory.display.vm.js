define('src/inventory/report.inventory.display.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
  'src/inventory/inventory-report-scanned.gvm',
  'src/inventory/inventory-report-unscanned.gvm',
  //'src/core/joiner',
  'ko',
  //'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ControllerViewModel,
  InventoryReportScannedGridViewModel,
  InventoryReportUnScannedGridViewModel,
  // joiner,
  ko
  // ukov
) {
  "use strict";

  function DisplayReportInventoryViewModel(options) {
    var _this = this;

    DisplayReportInventoryViewModel.super_.call(_this, options);

    //Display Inventory Grids
    _this.scannedListGvm = new InventoryReportScannedGridViewModel({

    });

    _this.unScannedListGvm = new InventoryReportUnScannedGridViewModel({

    });


    _this.dispResult = ko.observable(null);
    //events
    //

    _this.clickClose = function() {
      if (_this.layer) {
        _this.layer.close(_this.dispResult());
      }
    };

    //  _this.active.subscribe(function(active) {
    //   if (active) {
    //     // this timeout makes it possible to focus the barcode field
    //     setTimeout(function() {
    //       _this.focusFirst(true);
    //     }, 100);
    //   }
    // });

  }

  utils.inherits(DisplayReportInventoryViewModel, BaseViewModel);
  DisplayReportInventoryViewModel.prototype.viewTmpl = 'tmpl-inventory-report-display';
  DisplayReportInventoryViewModel.prototype.width = '100%';
  DisplayReportInventoryViewModel.prototype.height = '100%';

  return DisplayReportInventoryViewModel;
});
