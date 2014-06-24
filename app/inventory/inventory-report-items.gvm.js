define('src/inventory/inventory-report-items.gvm', [
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

  function InventoryItemsReportGridViewModel( /*options*/ ) {
    var _this = this;
    InventoryItemsReportGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },

      columns: [ //
        {
          id: 'Barcode',
          name: 'Barcode (Inventory Items)',
          field: 'Barcode',
        }, {
          id: 'Scanned',
          name: 'Scanned',
          field: 'Yes/No',
        },
      ],

    });

  }

  utils.inherits(InventoryItemsReportGridViewModel, SlickGridViewModel);

  return InventoryItemsReportGridViewModel;
});
