define('src/inventory/inventory-report-unscanned.gvm', [
  'ko',
  'src/slick/buttonscolumn',
  'src/slick/slickgrid.vm',
  'src/core/utils',
  //'slick',
  //'src/core/notify',
], function(
  ko,
  ButtonsColumn,
  SlickGridViewModel,
  utils
  //Slick,
  //notify
) {
  "use strict";

  function InventoryReportUnScannedGridViewModel( /*options*/ ) {
    var _this = this;
    InventoryReportUnScannedGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },

      columns: [ //
        {
          id: 'ProductBarcodeId',
          name: 'Barcode',
          field: 'ProductBarcodeId',
        }, {
          id: 'ItemDesc',
          name: 'Items that are in inventory but not scanned',
          field: 'ItemDesc',
        },
      ],

    });

  }

  utils.inherits(InventoryReportUnScannedGridViewModel, SlickGridViewModel);

  return InventoryReportUnScannedGridViewModel;
});
