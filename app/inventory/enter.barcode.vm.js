define('src/inventory/enter.barcode.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
  'src/dataservice',
  'src/core/joiner',
], function(
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  dataservice,
  joiner
) {
  "use strict";


  var schema; /*, param = {};*/

  schema = {
    _model: true,
    productBarcodeID: {},
    productBarcodeIdList: {}
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
      productBarcodeID: null,
      productBarcodeIdList: null,
    }, schema);

    //Display data  on UI
    _this.PurchaseOrderId = _this.poNumber;
    _this.PackingSlipID = _this.packingSlipID;
    _this.Count = _this.count;
    _this.barcodeCount(0);

    //Add barcode one at a time though tab/enter key
    _this.processBarcode = function(data, event) {

      //Check if barcode is not empty and enter key is hit
      if (_this.data.productBarcodeID() !== null && _this.data.productBarcodeID().trim() !== "") {

        if (event.keyCode === 13 || event.keyCode === 9) {

          var join = joiner(),
            listtype = false,
            count = parseInt(_this.barcodeCount(), 10) + 1;

          if (parseInt(_this.receiveCount(), 10) >= count) {

            //Add barcode to DB
            addBarcode(data, _this.data.productBarcodeID(), join, listtype);

          } else {
            notify.warn('Entered barcode count must not exceed received count.', null, 3);
          }

          if (event.keyCode === 9) {
            return false;
          }

        } //end keycode if
      } //end checking if barcode is null/not

      //default return true
      return true;

    };

    //Update "Enter#" label everytime user hit enter key on barcode textarea
    _this.barcodeUpdateCount = function(data, event) {

      if (event.keyCode === 13 || event.keyCode === 9) {

        var barcodeCount = parseInt(_this.barcodeCount(), 10),
          fCount,
          updatedList;

        if (event.keyCode === 9) {
          updatedList = convertTabToEnter(_this.data.productBarcodeIdList());
          _this.data.productBarcodeIdList(updatedList);
        }

        fCount = getBarcodeCounts(_this.data.productBarcodeIdList(), barcodeCount);

        if (fCount > _this.receiveCount()) {
          notify.warn('Entered barcode count must not exceed received count.', null, 3);
          return;
        }

        if (event.keyCode === 9) {
          return false;
        }

      }

      return true;

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
      _this.processBarcodes(vm, cb);
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

  EnterBarcodeViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me    

    join = join;

  };

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
  EnterBarcodeViewModel.prototype.processBarcodes = function(vm, cb) {

    var barcodeList = vm.data.productBarcodeIdList(), //list of barcodes from textarea
      barcode, //array that holds the list of barcodes after split by return
      barcodeCount = parseInt(vm.barcodeCount(), 10),
      rCount = 0, //holds the received count      
      x,
      listtype = true,
      join = joiner();


    if (barcodeList !== null) {
      //split list by return key
      barcode = barcodeList.split('\n');

    } else {
      cb();
      return;
    }

    //get latest barcode count
    barcodeCount = getBarcodeCounts(barcodeList, barcodeCount);

    //get the current received counts
    rCount = parseInt(vm.receiveCount(), 10);

    if (rCount < barcodeCount) {
      notify.warn('Entered barcode count must not exceed received count.', null, 3);

      cb();
    } else {

      vm.data.productBarcodeIdList.setValue(null);

      for (x = 0; x < barcode.length; x++) {

        if (barcode[x] !== "") {

          //Add barcode to DB
          addBarcode(vm, barcode[x], join, listtype);

        }

      }

    }

    cb();
  };

  //Add barcodes to DB
  function addBarcode(vm, barcode, join, listtype) {

    //Set of parameters used on api call
    var param2 = {
        ProductBarcodeID: barcode,
        PurchaseOrderItemId: vm.purchaseOrderItemID
      },
      badList;

    //This is the api for adding barcodes
    dataservice.inventoryenginesrv.ProductBarcode.post(null, param2, null, utils.safeCallback(join.add(), function( /*err, resp*/ ) {

      var bCount = parseInt(vm.barcodeCount(), 10);

      //increment enter# count
      bCount++;

      vm.barcodeCount(bCount.toString());

      //clear/return bad barcodes
      if (!listtype) {
        vm.data.productBarcodeID.setValue(null);
      }

    }, function(err) {

      //retain bad barcodes on textbox      

      if (listtype) {

        if (vm.data.productBarcodeIdList() === null) {
          badList = "";
        } else {
          badList = vm.data.productBarcodeIdList();
        }

        badList = badList + barcode + "\n";
        vm.data.productBarcodeIdList.setValue(badList);
      }

      notify.error(err);
    }));

  }

  //Get the counts of barcode entered by the user
  function getBarcodeCounts(list, barcodeCount) {

    var count = 0,
      x,
      barcode;

    if (list !== null) {
      barcode = list.split('\n');
    } else {
      return 0;
    }


    for (x = 0; x < barcode.length; x++) {
      if (barcode[x] !== "") {
        count++;
      }
    }

    //return current barcode count + number of barcodes in the list 
    return count + barcodeCount;
  }

  //convert tab to enter on the fly
  function convertTabToEnter(list) {

    if (list !== null) {
      list = list + "\n";
    }

    return list;

  }

  return EnterBarcodeViewModel;
});
