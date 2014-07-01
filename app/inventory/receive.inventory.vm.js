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
      //converter: ukov.converters.number(0),
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


  function ReceiveInventoryViewModel(options) {
    var _this = this;

    ReceiveInventoryViewModel.super_.call(_this, options);

    _this.focusFirst = ko.observable(false);

    //holds the packing slip id - to be used on addPackingSlipItems
    _this.PackingSlipID = ko.observable();

    _this.data = ukov.wrap(_this.item || {
      PurchaseOrderID: null,
      PackingSlipNumber: null
    }, schema);


    _this.layersVm = new LayersViewModel({
      controller: _this,
    });


    //Display Inventory Grid
    _this.inventoryListGvm = new InventoryGridViewModel({

      enterBarcode: function(part, cb) {

        //parameters for packingslipitems
        var param = {
          PackingSlipId: _this.PackingSlipID(),
          //ProductSkwId: part.ProductSkwId,
          ItemId: part.ItemId,
          Quantity: part.Quantity
        };

        if (typeof _this.PackingSlipID() === "undefined") {
          //do not call packing slip items api
        } else {
          //add to packing slip items
          addPackingSlipItems(param, cb);
        }


        //Go to Enter Barcodes screen
        _this.layersVm.show(new EnterBarcodeViewModel({
          title: 'Enter Barcodes',
          poNumber: part.PurchaseOrderId,
          packingSlipID: _this.data.PackingSlipNumber,
          count: part.WithBarcodeCount,
          enteredBarcode: 0,
          purchaseOrderItemID: part.PurchaseOrderItemID,
        }), function onClose(result) {
          if (!result) {
            return;
          }
        });

      },

    });

    //Clear fields and grid when there's a change on PO#
    _this.resetPage = function() {

      //clear packing slip# field
      _this.data.PackingSlipNumber(null);

      //clear grid
      _this.inventoryListGvm.list([]);
    };


    //events
    //
    //Search PO by PurchaseOrderID
    _this.cmdSearch = ko.command(function(cb, vm) {
      _this.search(vm, cb);
    });


    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the po#
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
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

    join = join;

  };
  ReceiveInventoryViewModel.prototype.onActivate = function(routeData) {

    routeData.action = 'receive';
  };

  ReceiveInventoryViewModel.prototype.search = function(vm, cb) {

    var iePurchaseOrder = vm.data.getValue(),

      //add joiner since we need to call cb when all api calls have returned
      join = joiner();

    //Getting PurchaseOrderID api call
    dataservice.inventoryenginesrv.PurchaseOrder.read({
      id: iePurchaseOrder.PurchaseOrderID,
      link: 'gppo'
    }, null, utils.safeCallback(join.add(), function(err, resp) {

      if (resp.Code === 0) {
        var param,
          purchaseOrder = resp.Value;
        purchaseOrder = jsonhelpers.parse(jsonhelpers.stringify(purchaseOrder));

        //parameters for reading packingslip api
        param = {
          id: purchaseOrder.PurchaseOrderID,
          link: 'POID'
        };

        //Populate PurchaseOrderItems
        loadPurchaseOrderItems(vm, purchaseOrder.PurchaseOrderID, join.add());

        //function that calls packing slip api
        loadPackingSlipInfo(param, vm, join.add());

      } else {
        notify.warn('PurchaseOrderID not found', null, 3);
      }
    }));

    //since we are using joiner. invoked cb only once
    cb();

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

        //Update inventoryListGvm grid
        for (var x = 0; x < resp.Value.length; x++) {

          //console.log(JSON.stringify(resp.Value[x]));

          vm.inventoryListGvm.list.push(resp.Value[x]);
        }


      } else {
        notify.warn('PurchaseOrderID not found', null, 3);
      }
    }));
  }


  function loadPackingSlipInfo(param, vm, cb) {

    dataservice.inventoryenginesrv.PackingSlip.read(param, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Code === 0) {

        console.log("PackingSlipRead-Result:" + JSON.stringify(resp.Value));

        //Get value of packing slip Id from api
        vm.PackingSlipID(resp.Value.PackingSlipID);

        var packingSlip = resp.Value;

        //If packing slip # from api not equal to null, set value.
        if (packingSlip.PackingSlipNumber !== null) {
          vm.data.PackingSlipNumber.setValue(packingSlip.PackingSlipNumber);
        } else {

          //Create packing slip # if packing slip# from UI not empty
          if (packingSlip.PackingSlipNumber === null) {
            console.log("Packing slip number is empty. Creating packing slip number...");
            //Create packing slip#
            packingSlipNumberIsEmpty(vm, param.id, cb);
          }

        }


      } else {
        notify.warn('PurchaseOrderID not found', null, 10);
      }
    }, function( /*err*/ ) {

      //Create packing slip#
      packingSlipNumberIsEmpty(vm, param.id, cb);

      // var param2, packingSlipNumber;

      // packingSlipNumber = vm.data.PackingSlipNumber();
      // param2 = {
      //   PurchaseOrderId: param.id,
      //   PackingSlipNumber: packingSlipNumber
      // };

      // alert(packingSlipNumber);

      // if (packingSlipNumber !== null && packingSlipNumber !== "") {
      //   //alert(JSON.stringify(param2));
      //   createPackingSlipNumber(param2, cb);
      // } else {
      //   notify.warn('Please input a Packing Slip#!');
      // }

    }));


  } //end function loadPackingSlipInfo

  function packingSlipNumberIsEmpty(vm, purchaseOrderID, cb) {

    var param2, packingSlipNumberUI;

    packingSlipNumberUI = vm.data.PackingSlipNumber();

    //alert(packingSlipNumberUI);

    param2 = {
      PurchaseOrderId: purchaseOrderID,
      PackingSlipNumber: packingSlipNumberUI
    };

    console.log("createPackingSlipNumber-param:" + JSON.stringify(param2));

    if (packingSlipNumberUI !== null && packingSlipNumberUI !== "") {
      createPackingSlipNumber(param2, vm, cb);
    } else {
      notify.warn('Please input a Packing Slip#!');
    }

  }


  //Create packing slip number if not available - pull this from UI
  function createPackingSlipNumber(param, vm, cb) {

    dataservice.inventoryenginesrv.PackingSlip.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {}
      console.log("createPackingSlipNumber-Result:" + JSON.stringify(resp.Value));
      vm.data.PackingSlipNumber.setValue(resp.Value.PackingSlipNumber);

    }, function(err) {
      notify.error(err);
    }));


  } //end createPackingSlipNumber

  //add to packing slip items
  function addPackingSlipItems(param, cb) {

    dataservice.inventoryenginesrv.PackingSlipItem.post(null, param, null, utils.safeCallback(cb, function(err, resp) {

      if (resp.Code === 0) {
        console.log("PackingSlipItems-Result:" + JSON.stringify(resp.Value));
      }

    }, function(err) {
      notify.error(err);
    }));
  }


  return ReceiveInventoryViewModel;
});
