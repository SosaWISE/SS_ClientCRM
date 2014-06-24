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
        'src/inventory/report.inventory.vm',
      ], function() {
        var args = arguments;
        deps.ReceiveInventoryViewModel = args[0];
        deps.TransferInventoryViewModel = args[1];
        deps.ReportInventoryViewModel = args[2];

        cb();
      });
    });

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

  InventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this,
      cb = join.add();

    ensureDeps(function() {
      _this.list([
        new deps.ReceiveInventoryViewModel({
          routeName: 'inventory',
          pcontroller: _this,
          id: 'receive',
          title: 'Receive'
        }),
        new deps.TransferInventoryViewModel({
          routeName: 'inventory',
          pcontroller: _this,
          id: 'transfer',
          title: 'Transfer'
        }),
        new deps.ReportInventoryViewModel({
          routeName: 'inventory',
          pcontroller: _this,
          id: 'report',
          title: 'Report'
        }),
      ]);
      cb();
    });
  };

  return InventoryViewModel;
});
