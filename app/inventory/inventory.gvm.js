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
      notify.warn('Please input a number only.', null, 5);
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
          id: 'ProductSKU',
          name: 'SKU',
          field: 'ProductSKU',
        }, {
          id: 'Quantity',
          name: 'Quantity',
          field: 'Quantity',
        }, {
          id: 'WithoutBarcodeCount',
          name: 'Remain',
          field: 'WithoutBarcodeCount',
        }, {
          id: 'ItemDesc',
          name: 'Description',
          field: 'ItemDesc',
        }, {
          id: 'WithBarcodeCount',
          name: 'Enter Qty Received',
          field: 'WithBarcodeCount',
          editor: Slick.Editors.Text,
          validator: numberFieldValidator,
          cssClass: 'editable_look',
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
