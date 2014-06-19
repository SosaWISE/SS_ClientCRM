define('src/panels/inventory.panel.vm', [
  'ko',
  'src/core/helpers',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  helpers,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  //load inventory dependencies    
  var deps = {},
    ensureDeps = helpers.onetimer(function loadDeps(cb) {
      require([
        'src/inventory/receive.inventory.vm',
        'src/inventory/transfer.inventory.vm',
      ], function() {
        var args = arguments;
        deps.ReceiveInventoryViewModel = args[0];
        deps.TransferInventoryViewModel = args[1];

        cb();
      });
    });

  function InventoryViewModel(options) {
    var _this = this;

    InventoryViewModel.super_.call(_this, options);

    _this.title = 'Inventory';

    _this.list = _this.childs;

    //events for tabbing
    _this.clickReceive = function() {
      //alert("clickReceive");
      _this.selectChild(_this.receiveVm);
    };

    _this.clickTransfer = function() {
      //alert("clickTransfer");
      _this.selectChild(_this.transferVm);
    };

    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };


    //events
    //

  }

  utils.inherits(InventoryViewModel, ControllerViewModel);

  //
  // members
  //

  InventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me

    var _this = this,
      cb = join.add();

    ensureDeps(function() {

      _this.transferVm = new deps.TransferInventoryViewModel({
        routeName: 'inventory',
        pcontroller: _this,
        id: 'transfer',
        title: 'Inventory Transfer'
      });

      _this.receiveVm = new deps.ReceiveInventoryViewModel({
        routeName: 'inventory',
        pcontroller: _this,
        route: 'receive',
        id: 'receive',
        title: 'Inventory Receive'
      });
      _this.defaultChild = _this.receiveVm;

      cb();
    });

  };

  InventoryViewModel.prototype.findChild = function(routeData) {

    var _this = this,
      result;

    if (routeData[_this.transferVm.routePart] === _this.transferVm.id) {
      result = _this.transferVm;
    } else {
      result = _this.receiveVm;
    }
    return result;
  };

  return InventoryViewModel;
});
