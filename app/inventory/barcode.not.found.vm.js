define('src/inventory/barcode.not.found.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  notify,
  utils,
  BaseViewModel
) {
  "use strict";


  function BarcodeErrorViewModel(options) {
    var _this = this;
    BarcodeErrorViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Error';

    //
    // events
    //

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };

  }

  utils.inherits(BarcodeErrorViewModel, BaseViewModel);
  BarcodeErrorViewModel.prototype.viewTmpl = 'tmpl-inventory-barcode-error';
  BarcodeErrorViewModel.prototype.width = '50%';
  BarcodeErrorViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  BarcodeErrorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };


  return BarcodeErrorViewModel;
});
