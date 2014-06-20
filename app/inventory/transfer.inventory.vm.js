define('src/inventory/transfer.inventory.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
  'src/core/joiner',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ControllerViewModel,
  joiner,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    TransferLocation: {},
    productBarcodeID: {},
  };


  function TransferInventoryViewModel(options) {
    var _this = this;

    TransferInventoryViewModel.super_.call(_this, options);

    //Set barcode field as first focusable
    _this.focusFirst = ko.observable(true);

    _this.data = ukov.wrap(_this.item || {
      TransferLocation: null,
      productBarcodeID: null,
    }, schema);

    _this.data.TransferLocationCvm = new ComboViewModel({
      selectedValue: _this.data.TransferLocation,
      fields: {
        value: 'TeamLocationID',
        text: 'City',
      },
    });

    //events
    //

    //Call api for adding barcodes
    _this.processBarcode = function(data, event) {

      //when enter key is hit, call the APIs
      if (event.keyCode === 13) {

        var join = joiner(),
          param1 = {},
          param2 = {};


        //set parameters
        param1 = {
          id: _this.data.productBarcodeID(),
          link: 'PBID'
        };

        param2 = {
          TransferToWarehouseSiteId: _this.data.TransferLocation(),
          ProductBarcodeId: _this.data.productBarcodeID()
        };

        //Load product barcode
        load_productBarcode(param1, join.add());

        //Post ProductBarcodeTracking
        post_productBarcodeTracking(param2, join.add());

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

  utils.inherits(TransferInventoryViewModel, ControllerViewModel);
  TransferInventoryViewModel.prototype.viewTmpl = 'tmpl-inventory-transfer';

  //
  // members
  //

  TransferInventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;
    load_transferLocations(_this.data.TransferLocationCvm, join.add());

  };


  function load_transferLocations(cvm, cb) {

    dataservice.humanresourcesrv.RuTeamLocationList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("RuTeamLocationList-transfer:" + JSON.stringify(resp.Value));

        //Set result to Location combo list
        cvm.setList(resp.Value);
      } else {
        notify.notify('warn', 'PurchaseOrderID not found', null, 3);
      }
    }));
  }


  function load_productBarcode(param, cb) {

    dataservice.inventoryenginesrv.ProductBarcode.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        console.log("ProductBarcode:" + JSON.stringify(resp.Value));

        // If ProductBarcodeTrackingID not null, Load ProductBarcodeTracking
        if (resp.Value.ProductBarcodeTrackingID != null) {
          load_productBarcodeTracking(resp.Value.ProductBarcodeTrackingID, cb);
        }


      } else {
        //notify.notify('error', err.Message);
        notify.error({
          Message: 'Barcode not found.'
        });

      }
    }));

  }

  function load_productBarcodeTracking(ProductBarcodeTrackingID, cb) {

    dataservice.inventoryenginesrv.ProductBarcodeTracking.read({
      id: ProductBarcodeTrackingID
    }, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        console.log("ProductBarcodeTracking-Read:" + JSON.stringify(resp.Value));

      } else {
        //notify.notify('error', err.Message);
        notify.error(err);
      }
    }));

  }

  function post_productBarcodeTracking(param, cb) {

    dataservice.inventoryenginesrv.ProductBarcodeTracking.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        console.log("ProductBarcodeTracking-Post:" + JSON.stringify(resp.Value));
      } else {
        //notify.notify('error', err.Message);
        notify.error(err);
      }
    }));

  }

  return TransferInventoryViewModel;
});
