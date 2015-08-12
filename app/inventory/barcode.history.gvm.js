define("src/inventory/barcode.history.gvm", [
  "slick",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  Slick,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function BarcodeHistoryGridViewModel(options) {
    var _this = this;
    initDataView(_this);
    BarcodeHistoryGridViewModel.super_.call(_this, {
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: false,
      },
      dataView: _this.dv,
      columns: getColumns(options),
      // onSelectedRowsChanged: options.onSelectedRowsChanged,
    });
  }
  utils.inherits(BarcodeHistoryGridViewModel, SlickGridViewModel);

  function getColumns(options) {
    var columns = [ //
      {
        id: "ID",
        name: "ID",
        field: "ProductBarcodeTrackingID",
        width: 50,
      }, {
        id: "ProductBarcodeTrackingTypeName",
        name: "Tracking Type",
        field: "ProductBarcodeTrackingTypeName",
      }, {
        id: "LocationTypeName",
        name: "Location Type",
        field: "LocationTypeName",
      }, {
        id: "LocationId",
        name: "Location Id",
        field: "LocationId",
      }, {
        id: "LocationName",
        name: "Location Name",
        field: "LocationName",
      }, {
        id: "ModifiedOn",
        name: "Transaction Date",
        field: "ModifiedOn",
        formatter: SlickGridViewModel.formatters.datetime,
      },
    ];
    if (options) {
      // columns.unshift({
      //   id: "Scanned",
      //   name: "Scanned",
      //   field: "Scanned",
      //   width: 30,
      // });
    }
    return columns;
  }

  function initDataView(_this) {
    var dv = new Slick.Data.DataView();
    dv.vm = _this.vm; // store pointer to this vm
    _this.dv = dv;
  }

  return BarcodeHistoryGridViewModel;
});