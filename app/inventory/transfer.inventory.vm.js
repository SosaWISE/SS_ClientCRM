define('src/inventory/transfer.inventory.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
  'src/core/layers.vm',
  'src/core/joiner',
  'src/inventory/barcode.not.found.vm',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ControllerViewModel,
  LayersViewModel,
  joiner,
  BarcodeErrorViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    LocationType: {},
    TransferLocation: {},
    productBarcodeID: {},
    productBarcodeIdList: {},
  };


  function TransferInventoryViewModel(options) {
    var _this = this,
      join = joiner(),
      tList;

    TransferInventoryViewModel.super_.call(_this, options);

    //Set barcode field as first focusable
    _this.focusFirst = ko.observable(true);

    _this.data = ukov.wrap(_this.item || {
      LocationType: null,
      TransferLocation: null,
      productBarcodeID: null,
      productBarcodeIdList: null,
    }, schema);

    //Intially set previous and new locations to NA
    _this.prevLocation = ko.observable('NA');
    _this.newLocation = ko.observable('NA');

    //This is the dropdown for location type
    _this.data.LocationTypeCvm = new ComboViewModel({
      selectedValue: _this.data.LocationType,
      fields: {
        value: 'LocationTypeID',
        text: 'LocationTypeName',
      },
    });

    //This is the dropdown for "transfer to"/location
    _this.data.TransferLocationCvm = new ComboViewModel({
      selectedValue: _this.data.TransferLocation,
      fields: {
        value: 'LocationID',
        text: 'LocationName',
      },
    });


    //This is the layer for the "Barcode not found!" error
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //events
    //

    //Transfer list of barcodes
    _this.clickTransferBarcode = ko.command(function(cb) {

      tList = _this.data.productBarcodeIdList();

      if (!tList) {
        notify.warn("List of barcodes is empty.", null, 3);
        cb();
        return;
      }

      //empty the list box to display the invalid barcodes
      _this.data.productBarcodeIdList(null);

      //Transfer barcode only if transfer location is not empty.      
      if (_this.data.TransferLocation()) {

        tList = tList.split('\n');

        for (var x = 0; x < tList.length; x++) {

          if (tList[x]) {

            //transfer to DB one by one
            load_productBarcode({
              id: tList[x],
              link: 'PBID'
            }, _this.data.TransferLocation(), _this.data.LocationType, _this, true, join.add());

          }
        }

      } else {
        notify.warn('Please select transfer location.', null, 3);
      }

      cb();

    });

    //update barcode list and convert tab to return on the fly
    _this.updateBarcodeList = function(data, event) {

      if (event.keyCode === 13 || event.keyCode === 9) {

        if (event.keyCode === 9) {
          var updatedList = convertTabToEnter(_this.data.productBarcodeIdList());
          _this.data.productBarcodeIdList(updatedList);
        }

        if (event.keyCode === 9) {
          return false;
        }

      }

      return true;
    };


    //This block executes when enter/tab key is hit and barcode field is not empty
    _this.processBarcode = function(data, event) {

      //Process barcode only if transfer location is not empty.      
      if (_this.data.TransferLocation()) {

        //when enter key is hit and barcode is not empty, call the APIs for adding barcode        
        if (_this.data.productBarcodeID() !== null && _this.data.productBarcodeID().trim() !== "") {

          if (event.keyCode === 13 || event.keyCode === 9) {

            //set new/previous locations to NA
            _this.newLocation('NA');
            _this.prevLocation('NA');

            var join = joiner(),
              param1 = {},
              param2 = {};

            //set parameters
            param1 = {
              id: _this.data.productBarcodeID(),
              link: 'PBID'
            };

            //probably, this parameter is no longer used
            param2 = {
              TransferToWarehouseSiteId: _this.data.TransferLocation(),
              ProductBarcodeId: _this.data.productBarcodeID()
            };

            //Check if the barcode entered does exist
            load_productBarcode(param1, _this.data.TransferLocation(), _this.data.LocationType, _this, false, join.add());

            //if keycode equals tab, return false
            if (event.keyCode === 9) {
              return false;
            }

          } //end of keycode event

        } //end checking if barcode is null/not

      } else {
        notify.warn('Please select transfer location.', null, 3);
        _this.data.productBarcodeID(null);
      }

      //default return true
      return true;
    };

    //subscribe to change on LocationType and populate Location dropdown
    _this.data.LocationType.subscribe(function(locationType, cb) {
      if (locationType) {

        //When there's a change on location type, set to NA first the previous and new location
        _this.prevLocation('NA');
        _this.newLocation('NA');

        //Populate transfer to location here        
        dataservice.inventoryenginesrv.Locations.read({
          id: locationType
        }, null, utils.safeCallback(cb, function(err, resp) {
          if (resp.Code === 0) {
            //set transfer location list
            _this.data.TransferLocationCvm.setList(resp.Value);
          } else {
            notify.warn('Location not found', null, 3);
          }
        }));

      }
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

  utils.inherits(TransferInventoryViewModel, ControllerViewModel);
  TransferInventoryViewModel.prototype.viewTmpl = 'tmpl-inventory-transfer';

  //
  // members
  //

  TransferInventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;

    //load location type
    load_locationTypeList(_this.data.LocationTypeCvm, join.add());

  };


  function load_productBarcode(param, transferLocation, locationType, _this, listType, cb) {

    var barcodeId = param.id;

    //Check if barcode entered does exist
    dataservice.inventoryenginesrv.ProductBarcode.read(param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("ProductBarcode:" + JSON.stringify(resp.Value));

        //If tracking id is not null, display previous location
        if (resp.Value.LastProductBarcodeTrackingId != null) {
          load_productBarcodeTracking(resp.Value.LastProductBarcodeTrackingId, _this, listType, cb);
        }

        //parameters for reading/inserting record to ProductBarcodeTracking table
        var param = {
          LocationTypeID: locationType,
          LocationID: transferLocation,
          ProductBarcodeId: resp.Value.ProductBarcodeID
        };

        //Read/insert record in ProductBarcodeTracking table
        post_productBarcodeTracking(param, _this, cb);

      } else {

        if (listType) {
          notify.warn('Barcode: ' + barcodeId + ' is not found.', null, 3);

          //display on list box the invalid barcodes
          var invalidBarcodeList = [_this.data.productBarcodeIdList()];
          invalidBarcodeList = invalidBarcodeList + barcodeId + "\n";
          _this.data.productBarcodeIdList(invalidBarcodeList);

        } else {

          //Show big error "Barcode not found."
          _this.layersVm.show(new BarcodeErrorViewModel({
            title: 'Error',
          }), function onClose(result) {
            if (!result) {
              return;
            }
          });

          //clear barcode field
          _this.data.productBarcodeID(null);

        }

      }
    }));

  }

  function load_productBarcodeTracking(ProductBarcodeTrackingID, _this, listType, cb) {
    dataservice.inventoryenginesrv.ProductBarcodeTracking.read({
      id: ProductBarcodeTrackingID
    }, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("ProductBarcodeTracking-Read:" + JSON.stringify(resp.Value));

        //Populate previous location
        if (resp.Value.LocationID !== null && !listType) {
          _this.prevLocation(resp.Value.LocationID);
        } else {
          _this.prevLocation('NA');
        }

      } else {
        notify.error(err);
      }
    }));

  }

  function post_productBarcodeTracking(param, _this, cb) {

    console.log(JSON.stringify(param));

    dataservice.inventoryenginesrv.ProductBarcodeTracking.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("ProductBarcodeTracking-Post:" + JSON.stringify(resp.Value));

        //Populate new location
        if (resp.Value.LocationID !== null) {
          _this.newLocation(resp.Value.LocationID);
        }

        //clear barcode field
        _this.data.productBarcodeID(null);

      } else {
        notify.error(err);
      }
    }));

  }

  //load/populate location type dropdown
  function load_locationTypeList(cvm, cb) {

    dataservice.inventoryenginesrv.LocationTypeList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("LocationTypeList:" + JSON.stringify(resp.Value));

        //Set result to Location combo list
        var x,
          data = [],
          locList = resp.Value;

        for (x = 0; x < locList.length; x++) {
          data.push({
            LocationTypeID: locList[x].LocationTypeID,
            LocationTypeName: locList[x].LocationTypeName,
          });
        }

        cvm.setList(data);

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }

  //convert tab to enter on the fly
  function convertTabToEnter(list) {

    if (list !== null) {
      list = list + "\n";
    }

    return list;

  }

  return TransferInventoryViewModel;
});
