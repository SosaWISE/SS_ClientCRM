define('src/inventory/receive.inventory.vm', [
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
  ukov
) {
  "use strict";


  var schema;

  schema = {
    _model: true,
    PurchaseOrderID: {
      //converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('PurchaseOrder ID is required')
      ]
    },
    PackingSlipNumber: {
      //converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('PackingSlipNumber ID is required')
      ]
    },
    PackingSlipID: {},
    VendorType: {},
    PurchaseOrderList: {},
  };


  function ReceiveInventoryViewModel(options) {
    var _this = this;

    ReceiveInventoryViewModel.super_.call(_this, options);

    //Set the first focus on PO# field
    _this.focusFirst = ko.observable(false);

    _this.data = ukov.wrap(_this.item || {
      PurchaseOrderID: null,
      PackingSlipNumber: null,
      PackingSlipID: null
    }, schema);

    //This a layer for enter barcode screen pop up
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //This is the dropdown vendor type
    _this.data.vendorTypeCvm = new ComboViewModel({
      selectedValue: _this.data.VendorType,
      nullable: true,
      fields: {
        value: 'VendorID',
        text: 'VendorName',
      },
    });

    //This is the dropdown PO# list
    _this.data.purchaseOrderListCvm = new ComboViewModel({
      selectedValue: _this.data.PurchaseOrderList,
      nullable: true,
      fields: {
        value: 'GPPONumber',
        text: 'GPPONumber',
      },

    });


    //Display Inventory Grid
    _this.inventoryListGvm = new InventoryGridViewModel({

      //This block executes when any of the submit buttons on "Enter Barcode" column is clicked
      enterBarcode: function(part, cb) {

        //parameters for packingslipitems
        var param = {
          PackingSlipId: _this.data.PackingSlipID(),
          ItemId: part.ItemId,
          Quantity: part.Quantity
        };

        //If Enter Qty Received greater than zero, proceed to entering barcode screen
        if (parseInt(part.WithBarcodeCount, 10) > 0) {

          //Add to packing slip items
          addPackingSlipItems(param, cb);

          //Go to Enter Barcodes screen
          _this.layersVm.show(new EnterBarcodeViewModel({
            title: 'Enter Barcodes',
            poNumber: part.PurchaseOrderId,
            packingSlipID: _this.data.PackingSlipNumber,
            count: part.WithBarcodeCount,
            enteredBarcode: 0,
            purchaseOrderItemID: part.PurchaseOrderItemID,
          }), function onClose(result, cb) {
            if (!result) {

              //Once done adding barcode, refresh grid with latest data - still need to simplify
              var updatedList = _this.inventoryListGvm.list();

              dataservice.inventoryenginesrv.PurchaseOrderItems.read({
                id: updatedList[0].PurchaseOrderId
              }, null, utils.safeCallback(cb, function(err, resp) {
                if (resp.Code === 0) {

                  //Empty grid before inserting new data
                  _this.inventoryListGvm.list([]);

                  //Update inventoryListGvm grid
                  for (var x = 0; x < resp.Value.length; x++) {
                    _this.inventoryListGvm.list.push(resp.Value[x]);
                  }

                }

              }));


              return;
            }
          });

        } else {
          notify.warn('Please input quantity received.', null, 3);
        }

      },

    });

    //Clear fields and grid when there's a change on PO#
    _this.resetPage = function() {

      //clear packing slip#
      _this.data.PackingSlipNumber(null);

      //clear grid
      _this.inventoryListGvm.list([]);
    };


    //events
    //
    //Search PO by PurchaseOrderID
    _this.cmdSearch = ko.command(function(cb, vm) {
      _this.search(vm, cb);
      cb();
    });


    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the po#
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

    //Populate PO list when there's a change of vendor
    _this.data.VendorType.subscribe(function(VendorType, cb) {
      if (VendorType) {

        dataservice.inventoryenginesrv.PurchaseOrder.read({
          id: VendorType,
          link: 20,
        }, null, utils.safeCallback(cb, function(err, resp) {
          if (resp.Code === 0) {

            _this.data.purchaseOrderListCvm.setList(resp.Value);

          } else {
            notify.warn('No records found.', null, 3);
          }
        }));

      }
    });

    //Populate PO field when there's a change of vendor
    _this.data.PurchaseOrderList.subscribe(function(purchaseOrderNumber) {
      if (purchaseOrderNumber) {
        _this.data.PurchaseOrderID(purchaseOrderNumber);
        _this.search(_this);
      }

    });


  }

  utils.inherits(ReceiveInventoryViewModel, ControllerViewModel);
  ReceiveInventoryViewModel.prototype.viewTmpl = 'tmpl-inventory-receive';

  //
  // members
  //

  ReceiveInventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me

    this.inventoryListGvm.list([]);

    var _this = this;
    join = join;

    //load vendors
    load_vendorList(_this.data.vendorTypeCvm, join.add());

  };

  ReceiveInventoryViewModel.prototype.onActivate = function(routeData) {

    routeData.action = 'receive';
  };

  ReceiveInventoryViewModel.prototype.search = function(vm) {

    var iePurchaseOrder = vm.data.getValue(),

      //add joiner since we need to call cb when all api calls have returned
      join = joiner();

    //Getting PurchaseOrderID api call
    dataservice.inventoryenginesrv.PurchaseOrder.read({
      id: iePurchaseOrder.PurchaseOrderID.trim(),
      link: 'gppo'
    }, null, utils.safeCallback(join.add(), function(err, resp) {

      if (resp.Code === 0) {
        var param,
          purchaseOrder = resp.Value;

        purchaseOrder = jsonhelpers.parse(jsonhelpers.stringify(purchaseOrder));

        param = {
          PurchaseOrderId: purchaseOrder.PurchaseOrderID,
          PackingSlipNumber: vm.data.PackingSlipNumber()
        };

        //function that calls packing slip api
        loadPackingSlipInfo(param, vm, join.add());

        //Populate grid with PurchaseOrderItems
        loadPurchaseOrderItems(vm, purchaseOrder.PurchaseOrderID, join.add());

      } else {
        notify.warn('PO# not found', null, 3);
      }
    }));

    //since we are using joiner. invoked cb only once
    //cb();

  };


  function loadPurchaseOrderItems(vm, poid, cb) {
    //var iePurchaseOrder = vm.data.getValue();
    //Purchange Order Items
    dataservice.inventoryenginesrv.PurchaseOrderItems.read({
      id: poid
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Code === 0) {

        //Empty grid before inserting new data
        vm.inventoryListGvm.list([]);

        if (resp.Value.length > 0) {

          //Update inventoryListGvm grid
          for (var x = 0; x < resp.Value.length; x++) {

            //console.log(JSON.stringify(resp.Value[x]));

            vm.inventoryListGvm.list.push(resp.Value[x]);
          }

        } else {
          notify.warn('No records found.', null, 3);
        }

      } else {
        notify.warn('PurchaseOrderID not found', null, 3);
      }
    }));
  }


  function loadPackingSlipInfo(param, vm, cb) {

    console.log("Packing slip params:" + JSON.stringify(param));

    dataservice.inventoryenginesrv.PackingSlip.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {}

      console.log("PackingSlip:" + JSON.stringify(resp.Value));

      //vm.data.PackingSlipNumber.setValue(resp.Value.PackingSlipNumber);
      vm.data.PackingSlipID(resp.Value.PackingSlipID);

    }, function(err) {
      notify.error(err);
    }));

  }

  function addPackingSlipItems(param, cb) {

    dataservice.inventoryenginesrv.PackingSlipItem.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        console.log("Add Packing Slip:" + JSON.stringify(resp.Value));
      }

    }, function(err) {
      notify.error(err);
    }));
  }

  //load vendors
  function load_vendorList(cvm, cb) {

    dataservice.inventoryenginesrv.VendorList.read({}, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {

        console.log("VendorList:" + JSON.stringify(resp.Value));

        //set vendor list
        cvm.setList(resp.Value);

      } else {
        notify.warn('No records found.', null, 3);
      }
    }));

  }



  return ReceiveInventoryViewModel;
});
