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
  'src/inventory/inventory.gvm',
  'src/inventory/enter.barcode.vm',
  'src/core/layers.vm',
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
  InventoryGridViewModel,
  EnterBarcodeViewModel,
  LayersViewModel,
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
    },
    PackingSlipNumber: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('PackingSlipNumber ID is required')
      ]
    }
  };


  function InventoryViewModel(options) {
    var _this = this;

    InventoryViewModel.super_.call(_this, options);

    _this.title = 'Inventory';

    _this.focusFirst = ko.observable(false);

    _this.data = ukov.wrap(_this.item || {
      PurchaseOrderID: null,
      PackingSlipNumber: null
    }, schema);


    _this.layersVm = new LayersViewModel({
      controller: _this,
    });


    //Display Inventory Grid
    _this.inventoryListGvm = new InventoryGridViewModel({

      enterBarcode: function(part) {

        //console.log(JSON.stringify(part));
        //Go to Enter Barcodes screen
        _this.layersVm.show(new EnterBarcodeViewModel({
          title: 'Enter Barcodes',
          poNumber: part.PurchaseOrderId,
          packingSlipID: _this.data.PackingSlipNumber,
          count: part.Received,
          enteredBarcode: 0,
          purchaseOrderItemID: part.PurchaseOrderItemID,
        }), function onClose(result) {
          if (!result) {
            return;
          }
        });

      },

    });


    //events
    //
    //Search PO by PurchaseOrderID
    _this.cmdSearch = ko.command(function(cb, vm) {
      _this.search(vm, cb);
    });

    //For testing only
    /*
    _this.showEnterBarcode = ko.command(function(cb) {

      _this.layersVm.show(new EnterBarcodeViewModel({
        title: 'Enter Barcodes',
      }), function onClose(result) {
        if (!result) {
          cb();
          return;
        }
      });

    });*/

    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the po#
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
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
        dataservice.inventoryenginesrv.PackingSlip.read({
            id: purchaseOrder.PurchaseOrderID,
            link: 'POID'
          },
          null, utils.safeCallback(cb, function(err, resp) {
            if (resp.Code === 0) {
              var param, packingSlip = resp.Value;

              if (packingSlip.PackingSlipNumber == null) {


                if (vm.data.PackingSlipNumber() == null) {
                  //alert(vm.data.PackingSlipNumber());
                  notify.notify('info', 'Please input a Packing Slip#!');

                } else {

                  param = {
                    PurchaseOrderId: purchaseOrder.PurchaseOrderID,
                    PackingSlipNumber: vm.data.PackingSlipNumber()
                  };

                  //alert(JSON.stringify(param));

                  dataservice.inventoryenginesrv.PackingSlip.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

                    if (err) {
                      cb(err);
                      return;
                    }

                    if (resp.Code === 0) {
                      //alert("PackingSlip-Post:"+JSON.stringify(resp.Value));
                    }

                  }, utils.no_op));

                }


              } else {
                vm.data.PackingSlipNumber.setValue(packingSlip.PackingSlipNumber);
              }


            } else {
              notify.notify('warn', 'PurchaseOrderID not found', 10);
            }
          }, utils.no_op));

      } else {
        notify.notify('warn', 'PurchaseOrderID not found', null, 3);
      }
    }));

    //Purchange Order Items
    dataservice.inventoryenginesrv.PurchaseOrderItems.read({
      id: iePurchaseOrder.PurchaseOrderID
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Code === 0) {

        //Empty grid before inserting new data
        vm.inventoryListGvm.list([]);

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
