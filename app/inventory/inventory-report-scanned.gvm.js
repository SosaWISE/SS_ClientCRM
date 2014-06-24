define('src/inventory/inventory-report-scanned.gvm', [
  'ko',
  'src/slick/buttonscolumn',
  'src/slick/slickgrid.vm',
  'src/core/utils',
  'slick',
  'src/core/notify',
], function(
  ko,
  ButtonsColumn,
  SlickGridViewModel,
  utils,
  Slick,
  notify
) {
  "use strict";

  function InventoryReportScannedGridViewModel(options) {
    var _this = this;    
    InventoryReportScannedGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },

      columns: [ //
        {
          id: 'Barcode',
          name: 'Barcode (Items that are scanned but not shown in the inventory)',
          field: 'Barcode',
         },
      ],

    });

  }

  utils.inherits(InventoryReportScannedGridViewModel, SlickGridViewModel);

  return InventoryReportScannedGridViewModel;
});
