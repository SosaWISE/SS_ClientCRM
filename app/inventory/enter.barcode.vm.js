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

    //this will hold the original receive value - changed to observable
    _this.receiveCount = ko.observable();
    _this.receiveCount(_this.count);

    _this.data = ukov.wrap(_this.item || {
      productBarcodeID: null
    }, schema);

    //Display data  on UI
    _this.PurchaseOrderId = _this.poNumber;
    _this.PackingSlipID = _this.packingSlipID;
    _this.Count = _this.count;
    _this.barcodeCount(0);

    // //Call api for adding barcodes
    // _this.processBarcode = function(data, event, cb) {
    //   //_this.data.productBarcodeID.subscribe(function(barcodeId, cb) {

    //   //Check if barcode is not empty and enter key is hit
    //   if (_this.data.productBarcodeID() !== null && _this.data.productBarcodeID().trim() !== "") {

    //     if (event.keyCode === 13 || event.keyCode === 9) {

    //       var param2 = {
    //         id: _this.data.productBarcodeID().trim(),
    //         link: 'PBID'
    //       };

    //       //Check if barcode exists
    //       dataservice.inventoryenginesrv.ProductBarcode.read(param2, null, utils.safeCallback(cb, function(err, resp) {

    //         if (resp.Code === 0) {
    //           notify.warn('Barcode already in use.', null, 3);
    //           return;
    //         } else {
    //           //Retrieve current barcode counts
    //           var count = parseInt(_this.barcodeCount(), 10) + 1;

    //           //Set of parameters used on api call
    //           param = {
    //             ProductBarcodeID: _this.data.productBarcodeID(),
    //             //ProductBarcodeID: barcodeId,
    //             PurchaseOrderItemId: _this.purchaseOrderItemID
    //           };

    //           if (parseInt(_this.receiveCount, 10) >= count) {
    //             //This is the api for adding barcodes
    //             dataservice.inventoryenginesrv.ProductBarcode.post(null, param, null, utils.safeCallback(cb, function( /*err, resp*/ ) {
    //               //Increment entered barcodes count
    //               _this.barcodeCount(count.toString());
    //               //clear barcode field
    //               _this.data.productBarcodeID.setValue(null);
    //             }, function(err) {
    //               notify.error(err);
    //             }));
    //           } else {
    //             notify.warn('Entered barcode count must not exceed received count.', null, 3);
    //           }
    //         }

    //       }));

    //       //if keycode equals tab, return false
    //       if (event.keyCode === 9) {
    //         return false;
    //       }

    //     } //end keycode if
    //   } //end checking if barcode is null/not

    //   //default return true
    //   return true;

    // };


    //Update "Enter#" label everytime user hit enter key on barcode textarea
    _this.barcodeUpdateCount = function(data, event) {

      if (event.keyCode === 13) {

        var fCount = getBarcodeCounts(_this.data.productBarcodeID());

        _this.barcodeCount(fCount.toString());

        if (fCount > _this.receiveCount) {
          notify.warn('Entered barcode count must not exceed received count.', null, 3);
        }
      }
    };


    _this.repResult = ko.observable(null);
    //
    // events
    //

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };

    //Process list of barcodes
    _this.clickProcessBarcode = ko.command(function(cb, vm) {
      processBarcodes(vm, cb);
    });


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

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  EnterBarcodeViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  //Process list of barcodes
  function processBarcodes(vm, cb) {

    var barcodeList = vm.data.productBarcodeID(), //list of barcodes from textarea
      barcode, //array that holds the list of barcodes after split by return
      barcodeCount = 0, //holds the current barcodes counts
      rCount = 0, //holds the received count
      remaining = 0, //holds the remaing counts received - entered
      x,
      param;

    //split list by return key
    barcode = barcodeList.split('\n');

    //get the current barcode counts
    barcodeCount = parseInt(getBarcodeCounts(barcodeList), 10);

    //get the current received counts
    rCount = parseInt(vm.receiveCount(), 10);

    //update value of "Enter#" label
    vm.barcodeCount(barcodeCount.toString());

    if (rCount < barcodeCount) {
      notify.warn('Entered barcode count must not exceed received count.', null, 3);
      cb();
    } else {

      for (x = 0; x < barcode.length; x++) {

        if (barcode[x] !== "") {

          param = {
            id: barcode[x],
            link: 'PBID'
          };

          //Add barcode to DB
          addBarcode(vm, barcode[x], cb);

        }

      }

      remaining = rCount - barcodeCount;

      //Update "Count#"
      vm.receiveCount(remaining.toString());

      //reset "Enter#" to 0  
      vm.barcodeCount('0');
    }

    cb();
  }

  //Add barcodes to DB
  function addBarcode(vm, barcode, cb) {

    dataservice.inventoryenginesrv.ProductBarcode.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        notify.warn(barcode + ' already in use.', null, 3);
      } else {

        //Set of parameters used on api call
        param = {
          ProductBarcodeID: barcode,
          PurchaseOrderItemId: vm.purchaseOrderItemID
        };

        //This is the api for adding barcodes
        dataservice.inventoryenginesrv.ProductBarcode.post(null, param, null, utils.safeCallback(cb, function( /*err, resp*/ ) {

          //clear barcode field
          vm.data.productBarcodeID.setValue(null);
        }, function(err) {
          notify.error(err);
        }));

      }

    }));

  }

  //Get the counts of barcode entered by the user
  function getBarcodeCounts(list) {
    var count = 0,
      x,
      barcode;

    barcode = list.split('\n');

    for (x = 0; x < barcode.length; x++) {
      if (barcode[x] !== "") {
        count++;
      }
    }

    return count;
  }

  return EnterBarcodeViewModel;
});
