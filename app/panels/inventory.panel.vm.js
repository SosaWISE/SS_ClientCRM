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
  'src/ukov',
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
  SlickGridViewModel,
  //config,
  //RowEvent,
  ukov
) {
  "use strict";


 var schema;

  schema = {
    _model: true,
    PurchaseOrderID: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('PurchaseOrder ID is required')
      ]
    }
  };



  function InventoryViewModel(options) {
    var _this = this;

    InventoryViewModel.super_.call(_this, options);

    _this.title = 'Inventory';

    _this.data = ukov.wrap(_this.item || {
      PurchaseOrderID: null,
    }, schema);


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
      //Search PO by PurchaseOrderID
    _this.cmdSearch = ko.command(function(cb, vm) {
      _this.search(vm, cb);
    });


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

  InventoryViewModel.prototype.search = function(vm ,cb) {
      var iePurchaseOrder = vm.data.getValue();
      //alert(iePurchaseOrder.PurchaseOrderID);
      dataservice.inventoryenginesrv.PurchaseOrder.read({
        id: iePurchaseOrder.PurchaseOrderID
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (resp.Code === 0) {
          var purchaseOrder = resp.Value;
          purchaseOrder = jsonhelpers.parse(jsonhelpers.stringify(purchaseOrder));
          alert(JSON.stringify(purchaseOrder));
        }else{
          notify.notify('warn', 'PurchaseOrderID not found', null, 3);
        }
      }));

  };



  return InventoryViewModel;
});
