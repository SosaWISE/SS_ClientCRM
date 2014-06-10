define('src/panels/inventory.panel.vm', [
  'src/account/default/address.validate.vm',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/joiner',
  'src/core/jsonhelpers',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
  'src/dataservice',
  'src/core/router',
  'src/slick/slickgrid.vm',
  //'src/config',
  //'src/slick/rowevent',
  //'src/ukov',
], function(
  AddressValidateViewModel,
  ComboViewModel,
  notify,
  joiner,
  jsonhelpers,
  ko,
  utils,
  ControllerViewModel,
  dataservice,
  router,
  SlickGridViewModel
  //config,
  //RowEvent,
  //ukov
) {
  "use strict";

  function InventoryViewModel(options) {
    var _this = this;

    InventoryViewModel.super_.call(_this, options);

    _this.title = 'Inventory';

    _this.inventoryListGvm = new SlickGridViewModel({
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 35,
      },
      columns: [ //
        {
          id: 'SKU',
          name: 'SKU',
          field: 'SKU',
        }, {
          id: 'Quantity',
          name: 'Quantity',
          field: 'Quantity',
        }, {
          id: 'Remain',
          name: 'Remain',
          field: 'Remain',
        }, {
          id: 'Received',
          name: 'Received',
          formatter: SlickGridViewModel.formatters.textbox,
        }, {
          id: 'Description',
          name: 'Description',
          field: 'Description',
        }, {
          id: 'Enter Barcode',
          name: 'Enter Barcode',          
          formatter: SlickGridViewModel.formatters.button,
        },
      ],
    });

    //events
    //

  }

  utils.inherits(InventoryViewModel, ControllerViewModel);

  //
  // members
  //

  InventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    
    //For dummy purposes
    var tempList = [];

    while (tempList.length < 15) {
        tempList.push({
        SKU: 'Dummy' + (tempList.length + 1),
        Quantity: 'Dummy' + (tempList.length + 1),
        Remain: 'Dummy' + (tempList.length + 1),
        Received: 'Dummy' + (tempList.length + 1),
        Description: 'Dummy' + (tempList.length + 1),
        'Enter Barcode': 'Dummy' + (tempList.length + 1),
      });
    }

    //dummy data for grid
    this.inventoryListGvm.list(tempList);

    join = join;

  };
  InventoryViewModel.prototype.onActivate = function(routeData) {

    routeData.action = 'inventory';
  };


  return InventoryViewModel;
});
