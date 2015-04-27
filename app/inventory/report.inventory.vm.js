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
  'jquery'
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
  ukov,
  $
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
    _this.initFocusFirst();

    _this.data = ukov.wrap(_this.item || {
      LocationType: null,
      LocationData: null,
      ProductBarcodeID: null
    }, schema);

    //This is the dropdown for location type
    _this.data.LocationTypeCvm = new ComboViewModel({
      selectedValue: _this.data.LocationType,
      fields: {
        value: 'LocationTypeID',
        text: 'LocationTypeName',
      },
    });

    //This is the dropdown for locations
    _this.data.LocationCvm = new ComboViewModel({
      selectedValue: _this.data.LocationData,
      fields: {
        value: 'LocationID',
        text: 'LocationName',
      },
    });


    //Display Inventory Grids

    //Items added on this list are those scanned but not found on inventory list
    _this.scannedListGvm = new InventoryReportScannedGridViewModel({

    });

    //Items added on this list are those items from inventory list but not scanned
    _this.unScannedListGvm = new InventoryReportUnScannedGridViewModel({

    });

    //This block executes when enter/tab key is hit and barcode field is not empty
    _this.processBarcode = function(data, event, cb) {

      //check if barcode is not null/empty
      if (_this.data.ProductBarcodeID() !== null && _this.data.ProductBarcodeID().trim() !== "") {

        //check if enter/tab key is hit
        if (event.keyCode === 13 || event.keyCode === 9) {

          //check if location type and location are specified, otherwise show error
          if (_this.data.LocationType() === null || _this.data.LocationData() === null) {

            notify.warn('Please select location type and location.', null, 3);
            _this.data.ProductBarcodeID(null);
            return;

          }

          var barcodeId = _this.data.ProductBarcodeID(), //this holds the barcode entered by user
            itemList = _this.unScannedListGvm.list(), //this holds the list of un-scanned items from inventory list
            found = false, //flag if barcode is found in "itemList"
            i,
            index; //this holds the index/row to be removed from un-scanned grid list

          console.log(JSON.stringify(itemList));

          if (barcodeId !== null && barcodeId !== "") {

            //Check if barcode exist on the list, if found, remove from list.
            for (i = 0; i < itemList.length; i++) {

              //check if barcode entered/scanned is found in inventory list/un-scanned grid list
              if (itemList[i].ProductBarcodeId === barcodeId) {

                found = true;
                index = i;
                break;

              } else {
                console.log("Not Found");
              }
            }

            //if found, remove from un-scanned grid list
            if (found) {
              _this.unScannedListGvm.deleteRow(index);
            } else {

              //If barcode scanned is not found on inventory list, add to the right grid/scanned grid list.

              //load this api to get the item name of the specific item scanned
              dataservice.inventoryenginesrv.ProductBarcodeLocations.read({
                id: barcodeId,
                link: 'PBID'
              }, null, utils.safeCallback(cb, function(err, resp) {

                if (resp.Code === 0) {
                  console.log("Unknown barcode:" + JSON.stringify(resp.Value));
                  console.log("Unknown barcode:" + resp.Value.ProductBarcodeId);
                  console.log("Unknown barcode:" + resp.Value.ItemDesc);

                  //populate the scanned grid list - items not found in inventory list but scanned
                  _this.scannedListGvm.list.push({
                    ProductBarcodeId: resp.Value.ProductBarcodeId,
                    ItemDesc: resp.Value.ItemDesc
                  });

                } else {
                  notify.warn('Barcode not found.', null, 3);
                }
              }));

            }

            //clear barcode field
            _this.data.ProductBarcodeID(null);

            //if keycode equals tab, return false
            if (event.keyCode === 9) {
              return false;
            }

          }

        } //end keycode if

      } //end checking if barcode is null/not

      //default return true
      return true;
    };

    //Print report using "print preview"
    _this.cmdPrintReport = ko.command(function(cb) {

      //Bug: currently if the user close the print dialog using the "x" button of the pop up, no callback happens

      var toAppend,
        unScanItemList,
        scanItemList,
        unScanItems,
        scanItems,
        gridData,
        printWindow,
        inc;

      //Root element for added elements
      toAppend = "<div class='addedElements'></div>";

      //Get data from grids
      unScanItemList = _this.unScannedListGvm.list();
      scanItemList = _this.scannedListGvm.list();

      //Initialize headers
      unScanItems = "<b><u><div class='inventoryItems'>Items that are in inventory but not scanned</div></u></b><br />";
      scanItems = "<b><u><div class='unknownItems'>Items that are scanned but not in the inventory</div></u></b><br />";


      //loop all inventory items that are unscanned
      for (inc = 0; inc < unScanItemList.length; inc++) {
        unScanItems += "<div class='items'>" + unScanItemList[inc].ProductBarcodeId + "|" + unScanItemList[inc].ItemDesc + "</div>";
      }

      //Add break line for spacing
      unScanItems += "<br />";

      //now for unknown items
      for (inc = 0; inc < scanItemList.length; inc++) {
        scanItems += "<div class='items'>" + scanItemList[inc].ProductBarcodeId + "|" + scanItemList[inc].ItemDesc + "</div>";
      }

      //Add break line for spacing
      scanItems += "<br />";

      //Append data
      $("#printDiv").append(toAppend);
      $(".addedElements").append(unScanItems);
      $(".addedElements").append(scanItems);

      gridData = $("#printDiv").html();
      printWindow = window.open('', '', 'height=' + screen.height + ', width=' + screen.width);
      printWindow.document.write('<html><head><title>Audit Report</title>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(gridData);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      $("#printDiv .addedElements").remove();
      printWindow.close();

      cb();

      return false;

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

        //clear grids when there's a change of location type
        _this.unScannedListGvm.list([]);
        _this.scannedListGvm.list([]);

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

  //Populate location type dropdown
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
