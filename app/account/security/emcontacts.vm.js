define('src/account/security/emcontacts.vm', [
  'src/account/security/emcontacts.gvm',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
], function(
  EmContactsGridViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function EmContactsViewModel(options) {
    var _this = this;
    EmContactsViewModel.super_.call(_this, options);

    _this.gvm = new EmContactsGridViewModel();

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
  utils.inherits(EmContactsViewModel, ControllerViewModel);
  EmContactsViewModel.prototype.viewTmpl = 'tmpl-security-emcontacts';

  EmContactsViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };

  return EmContactsViewModel;
});
