define('src/inventory/inventory.gvm', [
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

  function numberFieldValidator(value) {
    if (isNaN(value)) {
      notify.notify('error', 'Please input a number only.');
      return {
        valid: false,
        msg: "Please input a number only."
      };
    } else {
      return {
        valid: true,
        msg: null
      };
    }
  }

  function InventoryGridViewModel(options) {
    var _this = this;  
    SlickGridViewModel.ensureProps(options, ['enterBarcode']);
    InventoryGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },

      columns: [ //
        {
          id: 'ProductSkwId',
          name: 'SKU',
          field: 'ProductSkwId',
        }, {
          id: 'Quantity',
          name: 'Quantity',
          field: 'Quantity',
        }, {
          id: 'WithoutBarcodeCount',
          name: 'Remain',
          field: 'WithoutBarcodeCount',
        }, {
          id: 'Received',
          name: 'Received',
          field: 'Received',
          editor: Slick.Editors.Text,
          validator: numberFieldValidator
        }, {
          id: 'ItemDesc',
          name: 'Description',
          field: 'ItemDesc',
        },
        new ButtonsColumn({
          id: 'enterBarcode',
          name: 'Enter Barcode',
          buttons: [ //
            {
              text: 'Submit',
              fn: options.enterBarcode,
              cssClass: 'btn small btn-black',
            },
          ]
        }),
      ],

    });

  }

  utils.inherits(InventoryGridViewModel, SlickGridViewModel);

  return InventoryGridViewModel;
});
