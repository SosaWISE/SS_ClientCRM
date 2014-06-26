define('src/inventory/enter.barcode.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
  'src/dataservice',
], function(
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  dataservice
) {
  "use strict";


  var schema, param = {};

  schema = {
    _model: true,
    productBarcodeID: {},
  };


  function EnterBarcodeViewModel(options) {
    var _this = this;
    EnterBarcodeViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Enter Barcodes';

    //Set barcode field as first focusable
    _this.focusFirst = ko.observable(true);

    //This holds the current barcode count
    _this.barcodeCount = ko.observable();

    //this will hold the original receive value
    _this.receiveCount = _this.count;

    _this.data = ukov.wrap(_this.item || {
      productBarcodeID: null
    }, schema);

    //Display data  on UI
    _this.PurchaseOrderId = _this.poNumber;
    _this.PackingSlipID = _this.packingSlipID;
    _this.Count = _this.count;
    _this.barcodeCount(0);

    //Call api for adding barcodes
    //_this.processBarcode = function(cb) {
    _this.data.productBarcodeID.subscribe(function(barcodeId, cb) {

      //Check if barcode is not empty
      if (barcodeId) {

        //Retrieve current barcode counts
        var count = parseInt(_this.barcodeCount()) + 1;

        //Set of parameters used on api call
        param = {
          //ProductBarcodeID: _this.data.productBarcodeID(),
          ProductBarcodeID: barcodeId,
          PurchaseOrderItemId: _this.purchaseOrderItemID
        };

        if (parseInt(_this.receiveCount) >= count) {
          //This is the api for adding barcodes
          dataservice.inventoryenginesrv.ProductBarcode.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

            if (err) {
              cb(err);
              return;
            }

            if (resp.Code === 0) {

              //Increment entered barcodes count

              _this.barcodeCount(count.toString());

              //clear barcode field            
              _this.data.productBarcodeID.setValue(null);

            } else {
              notify.warn('Error adding barcode...', null, 3);
            }

          }, utils.no_op));

        } else {
          notify.warn('Entered barcode count must not exceed received count.');
        }

      }

    });


    _this.repResult = ko.observable(null);
    //
    // events
    //

    _this.clickClose = function() {
      if (_this.layer) {
        _this.layer.close(_this.repResult());
      }
    };


    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the barcode field
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

  }

  utils.inherits(EnterBarcodeViewModel, BaseViewModel);
  EnterBarcodeViewModel.prototype.viewTmpl = 'tmpl-inventory-enter-barcode';
  EnterBarcodeViewModel.prototype.width = 400;
  EnterBarcodeViewModel.prototype.height = 'auto';

  return EnterBarcodeViewModel;
});
