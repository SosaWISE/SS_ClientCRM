define('src/account/security/inventory.vm', [
  'src/account/security/inventory.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  InventoryGridViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function InventoryViewModel(options) {
    var _this = this;
    InventoryViewModel.super_.call(_this, options);

    _this.gvm = new InventoryGridViewModel();

    //
    // events
    //
    _this.clickAddByBarcode = function() {
      alert('@TODO: add by barcode');
    };
    _this.clickAddByPart = function() {
      alert('@TODO: add by part #');
    };
    _this.clickAddExistingEquipment = function() {
      alert('@TODO: add existing equipment');
    };
    _this.clickEditEquipment = function() {
      alert('@TODO: edit equipment');
    };
    _this.clickRemoveEquipment = function() {
      alert('@TODO: remove equipment');
    };
  }
  utils.inherits(InventoryViewModel, ControllerViewModel);
  InventoryViewModel.prototype.viewTmpl = 'tmpl-security-inventory';

  InventoryViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };

  return InventoryViewModel;
});
