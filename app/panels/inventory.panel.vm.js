define('src/panels/inventory.panel.vm', [
  'src/inventory/receive.inventory.vm',
  'src/inventory/transfer.inventory.vm',
  'src/inventory/report.inventory.vm',
  'ko',
  'src/core/helpers',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ReceiveInventoryViewModel,
  TransferInventoryViewModel,
  ReportInventoryViewModel,
  ko,
  helpers,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function InventoryViewModel(options) {
    var _this = this;
    InventoryViewModel.super_.call(_this, options);

    _this.title = 'Inventory';
    _this.list = _this.childs;

    //
    //events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(InventoryViewModel, ControllerViewModel);

  //
  // members
  //

  InventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.list([
      new ReceiveInventoryViewModel({
        routeName: 'inventory',
        pcontroller: _this,
        id: 'receive',
        title: 'Receive'
      }),
      new TransferInventoryViewModel({
        routeName: 'inventory',
        pcontroller: _this,
        id: 'transfer',
        title: 'Transfer'
      }),
      new ReportInventoryViewModel({
        routeName: 'inventory',
        pcontroller: _this,
        id: 'audit',
        title: 'Audit'
      }),
    ]);
    join.add()();
  };

  return InventoryViewModel;
});
