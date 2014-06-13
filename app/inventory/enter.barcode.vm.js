define('src/inventory/enter.barcode.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  //'src/ukov',
  //'src/dataservice', 
], function(
  notify,
  utils,
  BaseViewModel,
  ko
 // ukov,
 // dataservice,
 
) {
  "use strict";

  function EnterBarcodeViewModel(options) {
    var _this = this;
    EnterBarcodeViewModel.super_.call(_this, options);
    alert(_this.title);
    _this.title = _this.title || 'Enter Barcodes';

    _this.repResult = ko.observable(null);
    //
    // events
    //
    
    _this.clickClose = function() {
      if (_this.layer) {
        _this.layer.close(_this.repResult());
      }
    };

/*
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });*/

  }
  
  utils.inherits(EnterBarcodeViewModel, BaseViewModel);
  EnterBarcodeViewModel.prototype.viewTmpl = 'tmpl-inventory-enter-barcode';
  EnterBarcodeViewModel.prototype.width = 400;
  EnterBarcodeViewModel.prototype.height = 'auto';

  return EnterBarcodeViewModel;
});
