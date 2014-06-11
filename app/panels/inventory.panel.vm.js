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
  'src/slick/buttonscolumn',  
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
  ButtonsColumn,  
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

    //SlickGridViewModel.ensureProps(options, ['enterBarcode']);

    InventoryViewModel.super_.call(_this, options);

    _this.title = 'Inventory';

    _this.data = ukov.wrap(_this.item || {
      PurchaseOrderID: null,
    }, schema);


      //Notes:
      // app/account/security/clist.salesinfo.gvm.js has an example of using ButtonsColumn
      // and http://mleibman.github.io/SlickGrid/examples/example3-editing.html has examples of editing   

    _this.inventoryListGvm = new SlickGridViewModel({
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
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
          id: 'Remain',
          name: 'Remain',
          field: 'Remain',
        }, {
          id: 'Received',
          name: 'Received',
          field: 'Received', //Still need to change using slickgrid editor          
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
   /* var tempList = [];

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
    */
    this.inventoryListGvm.list([]);

    join = join;

  };
  InventoryViewModel.prototype.onActivate = function(routeData) {

    routeData.action = 'inventory';
  };

  InventoryViewModel.prototype.search = function(vm, cb) {
    var iePurchaseOrder = vm.data.getValue();
    //alert(iePurchaseOrder.PurchaseOrderID);
    dataservice.inventoryenginesrv.PurchaseOrder.read({
      id: iePurchaseOrder.PurchaseOrderID
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Code === 0) {
        var purchaseOrder = resp.Value;
        purchaseOrder = jsonhelpers.parse(jsonhelpers.stringify(purchaseOrder));
        //console.log(JSON.stringify(purchaseOrder));
      } else {
        notify.notify('warn', 'PurchaseOrderID not found', null, 3);
      }
    }));

    //Purchange Order Items
    dataservice.inventoryenginesrv.PurchaseOrderItems.read({
      id: iePurchaseOrder.PurchaseOrderID
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Code === 0) {       

        //Update inventoryListGvm grid
        for(var x=0; x < resp.Value.length; x++){
          vm.inventoryListGvm.list.push(resp.Value[x]);
        }       
        

      } else {
        notify.notify('warn', 'PurchaseOrderID not found', null, 3);
      }
    }));    

  };



  return InventoryViewModel;
});
