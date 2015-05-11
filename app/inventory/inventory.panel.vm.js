define("src/inventory/inventory.panel.vm", [
  "src/inventory/tekaudit.vm",
  "src/inventory/receive.inventory.vm",
  "src/inventory/transfer.inventory.vm",
  "src/inventory/report.inventory.vm",
  "ko",
  "src/core/layers.vm",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  TekAuditViewModel,
  ReceiveInventoryViewModel,
  TransferInventoryViewModel,
  ReportInventoryViewModel,
  ko,
  LayersViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";

  function InventoryViewModel(options) {
    var _this = this;
    InventoryViewModel.super_.call(_this, options);
    // _this.title = "Inventory";

    _this.showNav = ko.observable(true); // && config.hr.showNav);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

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
    _this.childs([
      new ReceiveInventoryViewModel({
        phil: true,
        pcontroller: _this,
        id: "receive",
        title: "Receive",
      }),
      new TransferInventoryViewModel({
        phil: true,
        pcontroller: _this,
        id: "transfer",
        title: "Transfer",
      }),
      new TekAuditViewModel({
        phil: false,
        pcontroller: _this,
        id: "audit",
        title: "Audit",
      }),
      new ReportInventoryViewModel({
        phil: true,
        pcontroller: _this,
        id: "oldaudit",
        title: "Old Audit",
      }),
    ]);
    join.add()();
  };

  return InventoryViewModel;
});
