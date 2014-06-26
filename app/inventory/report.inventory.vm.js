define('src/inventory/report.inventory.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
  'src/inventory/inventory-report-scanned.gvm',
  'src/inventory/inventory-report-unscanned.gvm',
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
  InventoryReportScannedGridViewModel,
  InventoryReportUnScannedGridViewModel,
  joiner,
  ko,
  ukov
) {
  "use strict";

  var schema = {
    _model: true,
    LocationType: {},
    LocationData: {},
    ProductBarcodeID: {},
  };



  function ReportInventoryViewModel(options) {
    var _this = this;

    ReportInventoryViewModel.super_.call(_this, options);

    //Set barcode field as first focusable
    _this.focusFirst = ko.observable(true);

    _this.data = ukov.wrap(_this.item || {
      LocationType: null,
      LocationData: null,
      ProductBarcodeID: null
    }, schema);


    _this.data.LocationTypeCvm = new ComboViewModel({
      selectedValue: _this.data.LocationType,
      nullable: true,
      fields: {
        value: 'LocationTypeID',
        text: 'LocationTypeName',
      },
    });

    _this.data.LocationCvm = new ComboViewModel({
      selectedValue: _this.data.LocationData,
      nullable: true,
      fields: {
        value: 'LocationID',
        text: 'LocationName',
      },
    });


    //Display Inventory Grids
    _this.scannedListGvm = new InventoryReportScannedGridViewModel({

    });

    _this.unScannedListGvm = new InventoryReportUnScannedGridViewModel({

    });

    //subscribe to change on value for product barcode, if not empty do the some scan barcode stuff
    _this.data.ProductBarcodeID.subscribe(function(ProductBarcodeID /*, cb*/ ) {

      if (ProductBarcodeID) {

        if (_this.data.LocationType() === null || _this.data.LocationData() === null) {
          notify.warn('Please select location type and location.', null, 3);
          return;
        }

        var barcodeId = ProductBarcodeID,
          itemList = _this.unScannedListGvm.list(),
          found = false,
          i,
          index;

        console.log(JSON.stringify(itemList));

        if (barcodeId !== null && barcodeId !== "") {

          //Check if barcode exist on the list, if found, remove from list.
          for (i = 0; i < itemList.length; i++) {

            if (itemList[i].ProductBarcodeId === barcodeId) {

              found = true;
              index = i;
              break;

            } else {
              console.log("Not Found");
            }
          }

          if (found) {
            _this.unScannedListGvm.deleteRow(index);
          } else {
            //If barcode scanned is not found on inventory list, add to the right grid.

            // dataservice.inventoryenginesrv.ProductBarcode.read({
            //   id: barcodeId,
            //   link: 'PBID'
            // }, null, utils.safeCallback(cb, function(err, resp) {
            //   if (resp.Code === 0 && resp.Value.length > 0) {

            //     console.log("Unknown barcode:" + JSON.stringify(resp.Value));         

            //   } else {
            //     notify.warn('Barcode not found.', null, 3);          
            //   }
            // }));

            _this.scannedListGvm.list.push({
              Barcode: barcodeId
            });
          }

          //clear barcode field
          _this.data.ProductBarcodeID(null);

        }

      }
    });

    //Print report
    _this.cmdPrintReport = ko.command(function(cb) {
      alert("@TODO print report.");
      cb();
    });

    //events
    //

    //subscribe to change on LocationCvm and populate grid
    _this.data.LocationData.subscribe(function(location, cb) {
      if (location) {

        //clear grids when there's a change of location
        _this.unScannedListGvm.list([]);
        _this.scannedListGvm.list([]);

        dataservice.inventoryenginesrv.ProductBarcodeLocations.read({
          id: location
        }, null, utils.safeCallback(cb, function(err, resp) {
          if (resp.Code === 0 && resp.Value.length > 0) {

            console.log("DataGrid:" + JSON.stringify(resp.Value));

            //Populate Data grid
            for (var x = 0; x < resp.Value.length; x++) {
              _this.unScannedListGvm.list.push(resp.Value[x]);
            }

          } else {
            notify.warn('No records found', null, 3);
          }
        }));


      }
    });

    //subscribe to change on LocationType and populate Location dropdown
    _this.data.LocationType.subscribe(function(locationType, cb) {
      if (locationType) {

        dataservice.inventoryenginesrv.Locations.read({
          id: locationType
        }, null, utils.safeCallback(cb, function(err, resp) {
          if (resp.Code === 0) {

            console.log("Locations:" + JSON.stringify(resp.Value));

            //Populate Locations dropdown
            _this.data.LocationCvm.setList(resp.Value);

          } else {
            notify.warn('Location Type not found', null, 3);
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

  utils.inherits(ReportInventoryViewModel, ControllerViewModel);
  ReportInventoryViewModel.prototype.viewTmpl = 'tmpl-inventory-report';

  //
  // members
  //

  ReportInventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;
    join = join;

    load_locationTypeList(_this.data.LocationTypeCvm, join.add());

  };

  //load LocationTypeList
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

  return ReportInventoryViewModel;
});
