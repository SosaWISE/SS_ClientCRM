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
  'slick',
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
  Slick,
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

    function numberFieldValidator(value) {
    if (isNaN(value)) {
      notify.notify('error','Please input a number only.');
      return {valid: false, msg: "Please input a number only."};
    } else {
      return {valid: true, msg: null};
    }
  }


  function InventoryViewModel(options) {
    var _this = this;

    //SlickGridViewModel.ensureProps(options, ['enterBarcode']);

    InventoryViewModel.super_.call(_this, options);

    _this.title = 'Inventory';

    _this.data = ukov.wrap(_this.item || {
      PurchaseOrderID: null,
    }, schema);


    _this.inventoryListGvm = new SlickGridViewModel({
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
          id: 'Remain',
          name: 'Remain',
          field: 'Remain',
        },{
          id: 'Received',
          name: 'Received', 
          field: 'Received',
          editor: Slick.Editors.Text,
          validator: numberFieldValidator
        },{              
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
        for (var x = 0; x < resp.Value.length; x++) {

          console.log(JSON.stringify(resp.Value[x]));

          vm.inventoryListGvm.list.push(resp.Value[x]);
        }


      } else {
        notify.notify('warn', 'PurchaseOrderID not found', null, 3);
      }
    }));

  };



  return InventoryViewModel;
});
