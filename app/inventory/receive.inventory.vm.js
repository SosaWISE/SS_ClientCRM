define('src/inventory/receive.inventory.vm', [
  'src/core/strings',
  'src/account/default/address.validate.vm',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/joiner',
  'src/core/jsonhelpers',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
  'src/dataservice',
  'src/slick/slickgrid.vm',
  'src/slick/buttonscolumn',
  'slick',
  'src/inventory/inventory.gvm',
  'src/inventory/enter.barcode.vm',
  'src/core/layers.vm',
  'src/ukov',
], function(
  strings,
  AddressValidateViewModel,
  ComboViewModel,
  notify,
  joiner,
  jsonhelpers,
  ko,
  utils,
  ControllerViewModel,
  dataservice,
  SlickGridViewModel,
  ButtonsColumn,
  Slick,
  InventoryGridViewModel,
  EnterBarcodeViewModel,
  LayersViewModel,
  ukov
) {
  "use strict";


  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,
    // PurchaseOrderID: {
    GPPO: {
      converter: nullStrConverter,
      validators: [
        ukov.validators.isRequired('Please enter a PO#')
      ]
    },
    PackingSlipNumber: {
      converter: nullStrConverter,
      validators: [
        ukov.validators.isRequired('Please enter a Packing Slip #')
      ]
    },
  };


  function ReceiveInventoryViewModel(options) {
    var _this = this;
    ReceiveInventoryViewModel.super_.call(_this, options);

    //This a layer for enter barcode screen pop up
    _this.layersVm = new LayersViewModel({
      controller: _this,
    });
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap(_this.item || {}, schema);

    //This is the dropdown vendor type
    _this.data.vendorTypeCvm = new ComboViewModel({
      nullable: true,
      fields: {
        value: 'VendorID',
        text: 'VendorName',
      },
    });
    //This is the dropdown PO# list
    _this.data.purchaseOrderListCvm = new ComboViewModel({
      nullable: true,
      fields: {
        value: 'GPPONumber',
        text: 'GPPONumber',
      },
    });
    //This is the dropdown Packing Slip# list
    _this.data.packingSlipListCvm = new ComboViewModel({
      nullable: true,
      fields: {
        value: 'PackingSlipNumber',
        text: 'PackingSlipNumber',
      },
    });
    //Populate PO list when there's a change of vendor
    _this.data.vendorTypeCvm.selectedValue.subscribe(function(vendorType, cb) {
      if (vendorType) {
        dataservice.inventoryenginesrv.PurchaseOrder.read({
          id: vendorType,
          link: 20,
        }, null, utils.safeCallback(cb, function(err, resp) {
          // only set if it hasn't changed again
          if (_this.data.vendorTypeCvm.selectedValue.peek() === vendorType) {
            _this.data.purchaseOrderListCvm.setList(resp.Value);
          }
        }, notify.error));
      }
    });
    //Populate PO field when there's a change of vendor
    _this.data.purchaseOrderListCvm.selectedValue.subscribe(function(gppo) {
      if (gppo) {
        var previousPO = _this.data.GPPO();

        //clear packing slip# if PO# has changed
        if (strings.trim(previousPO) !== strings.trim(gppo)) {
          _this.data.PackingSlipNumber(null);
        }

        _this.data.GPPO(gppo);
        search(_this);

        //populate packing slip# list
        load_packingSlipNumberList(_this.data.packingSlipListCvm, gppo);
      }
    });
    //Populate packing slip# field when user selected a packing slip# from dropdown
    _this.data.packingSlipListCvm.selectedValue.subscribe(function(packingSlipNumber) {
      if (packingSlipNumber) {
        _this.data.PackingSlipNumber(packingSlipNumber);
      }
    });


    //Display Inventory Grid
    _this.inventoryListGvm = new InventoryGridViewModel({
      //This block executes when any of the submit buttons on "Enter Barcode" column is clicked
      enterBarcode: function(part) {
        //parameters for packingslipitems
        var param = {
          PackingSlipId: _this.packingSlipId,
          ItemId: part.ItemId,
          Quantity: part.Quantity
        };

        //If Enter Qty Received greater than Remain, show error message
        if (part.WithBarcodeCount > part.WithoutBarcodeCount) {
          notify.warn("'Enter Qty Received' should not be greater than 'Remain'", null, 5);
          return;
        }
        //Do not launch the Enter Barcode window if the Packing Slip # is blank
        if (!_this.data.PackingSlipNumber()) {
          notify.warn('Please enter Packing Slip #', null, 5);
          return;
        }
        //If Enter Qty Received greater than zero, proceed to entering barcode screen
        if (parseInt(part.WithBarcodeCount, 10) < 1) {
          notify.warn('Please input quantity received.', null, 5);
          return;
        }

        //Add to packing slip items
        addPackingSlipItems(param, function(err /*, resp*/ ) {
          if (err) {
            utils.error(err);
          }
        });

        //Go to Enter Barcodes screen
        _this.layersVm.show(new EnterBarcodeViewModel({
          title: 'Enter Barcodes',
          poNumber: part.PurchaseOrderId,
          packingSlipID: _this.data.PackingSlipNumber,
          count: part.WithBarcodeCount,
          enteredBarcode: 0,
          purchaseOrderItemID: part.PurchaseOrderItemID,
        }), function(result) {
          console.log('asdfasffasfdsdf', result);
          // if (!result) { // result is always undefined so this is always true??
          loadPurchaseOrderItems(_this, part.PurchaseOrderId, function(err /*, resp*/ ) {
            if (err) {
              utils.error(err);
            }
          });
          // }
        });
      },
    });

    //
    //events
    //
    //Search PO by PurchaseOrderID
    _this.cmdSearch = ko.command(function(cb) {
      search(_this, cb);
    });
    //Clear fields and grid when there's a change on PO#
    _this.resetPage = function() {
      //clear packing slip#
      _this.data.PackingSlipNumber(null);
      //clear grid
      _this.inventoryListGvm.list([]);
    };

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
    var _this = this;

    _this.inventoryListGvm.list([]);

    //load vendors
    load_vendorList(_this.data.vendorTypeCvm, join.add());
  };

  function search(_this, cb) {
    if (!utils.isFunc(cb)) {
      cb = utils.noop;
    }

    var gppo = _this.data.GPPO;
    if (!gppo.isValid()) {
      notify.warn(gppo.errMsg(), null, 5);
      cb();
      return;
    }

    var join = joiner();
    //Getting GPPO api call
    dataservice.inventoryenginesrv.PurchaseOrder.read({
      id: gppo.getValue(),
      link: 'gppo'
    }, null, utils.safeCallback(join.add(), function(err, resp) {
      var purchaseOrder = resp.Value;

      //function that calls packing slip api
      loadPackingSlipInfo({
        PurchaseOrderId: purchaseOrder.PurchaseOrderID,
        PackingSlipNumber: _this.data.PackingSlipNumber()
      }, _this, join.add());

      //Populate grid with PurchaseOrderItems
      loadPurchaseOrderItems(_this, purchaseOrder.PurchaseOrderID, join.add());
    }, utils.noop));

    // wait until all api calls have returned
    join.when(function(err) {
      if (err) {
        notify.error(err);
      }
      cb();
    });
  }

  function loadPurchaseOrderItems(_this, poid, cb) {
    //Empty grid before inserting new data
    _this.inventoryListGvm.list([]);
    //Purchange Order Items
    dataservice.inventoryenginesrv.PurchaseOrderItems.read({
      id: poid
    }, _this.inventoryListGvm.list, cb);
  }

  function loadPackingSlipInfo(param, _this, cb) {
    dataservice.inventoryenginesrv.PackingSlip.save({
      data: param,
    }, null, utils.safeCallback(cb, function(err, resp) {
      //_this.data.PackingSlipNumber.setValue(resp.Value.PackingSlipNumber);
      _this.packingSlipId = resp.Value.PackingSlipID;
    }, utils.noop));
  }

  function addPackingSlipItems(param, cb) {
    dataservice.inventoryenginesrv.PackingSlipItem.save({
      data: param,
    }, null, cb);
  }

  //load vendors
  function load_vendorList(cvm, cb) {
    cvm.setList([]);
    dataservice.inventoryenginesrv.VendorList.read({}, cvm.setList, cb);
  }

  //load packing slip# list
  function load_packingSlipNumberList(cvm, packingSlipId) {
    cvm.setList([]);
    dataservice.inventoryenginesrv.PackingSlip.read({
      id: packingSlipId,
      link: 'GPPON'
    }, function(val) {
      // filter out those without a number???
      cvm.setList(val.filter(function(item) {
        return item.PackingSlipNumber;
      }));
    }, notify.iferror);
  }

  return ReceiveInventoryViewModel;
});
