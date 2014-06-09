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
        rowHeight: 27,
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
          text: 'Received',
        }, {
          id: 'Description',
          name: 'Description',
          field: 'Description',
        }, {
          id: 'Enter Barcode',
          name: 'Enter Barcode',
          field: 'Enter Barcode',
        },
      ],
    });


    //For dummy purposes
    //while (_this.inventoryListGvm.list().length < 15) {
    //_this.inventoryListGvm.list().push({
    //SKU: 'Dummy' + (_this.inventoryListGvm.list().length + 1),
    //Quantity: 'Dummy' + (_this.inventoryListGvm.list().length + 1),
    //Remain: 'Dummy' + (_this.inventoryListGvm.list().length + 1),
    //Received: 'Dummy' + (_this.inventoryListGvm.list().length + 1),
    //Description: 'Dummy' + (_this.inventoryListGvm.list().length + 1),
    //});
    //}

    //events
    //

  }

  utils.inherits(InventoryViewModel, ControllerViewModel);

  //
  // members
  //

  InventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    this.inventoryListGvm.list([]);

    join = join;

  };
  InventoryViewModel.prototype.onActivate = function(routeData) {

    routeData.action = 'inventory';
  };


  return InventoryViewModel;
});
