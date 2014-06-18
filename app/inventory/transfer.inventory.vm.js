define('src/inventory/transfer.inventory.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  //'ko',
  //'src/ukov',
  //'src/dataservice',
], function(
  notify,
  utils,
  BaseViewModel
  //ko,
  //ukov,
  //dataservice
) {
  "use strict";



  function TransferInventoryViewModel(options) {
    var _this = this;
    TransferInventoryViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Transfer Inventory';

    //Set barcode field as first focusable
    //_this.focusFirst = ko.observable(true);


    //_this.repResult = ko.observable(null);
    //
    // events
    //
    /*
    _this.clickClose = function() {
      if (_this.layer) {
        _this.layer.close(_this.repResult());
      }
    };

*/
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the barcode field
        setTimeout(function() {
          //_this.focusFirst(true);
        }, 100);
      }
    });


  }

  utils.inherits(TransferInventoryViewModel, BaseViewModel);
  TransferInventoryViewModel.prototype.viewTmpl = 'tmpl-inventory-transfer';
  //TransferInventoryViewModel.prototype.width = 400;
  //TransferInventoryViewModel.prototype.height = 'auto';

  return TransferInventoryViewModel;
});
