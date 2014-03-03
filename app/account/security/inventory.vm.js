define('src/account/security/inventory.vm', [
  'ko',
  'src/account/security/inventory.editor.vm',
  'src/account/security/inventory.gvm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  InventoryEditorViewModel,
  InventoryGridViewModel,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function InventoryViewModel(options) {
    var _this = this;
    InventoryViewModel.super_.call(_this, options);
    // ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.gvm = new InventoryGridViewModel();

    //
    // events
    //
    _this.cmdAddByPart = ko.command(function(cb) {
      showInventoryEditor(_this, true, null, cb);
    });
    _this.cmdAddByBarcode = ko.command(function(cb) {
      showInventoryEditor(_this, false, null, cb);
    });
    _this.cmdAddExistingEquipment = ko.command(function(cb) {
      alert('@TODO: add existing equipment');
      cb();
    });
  }
  utils.inherits(InventoryViewModel, ControllerViewModel);
  InventoryViewModel.prototype.viewTmpl = 'tmpl-security-inventory';

  InventoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    _this.accountId = routeData.id;

    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };


  function showInventoryEditor(_this, byPart, cb) {
    _this.layersVm.show(createInventoryEditor(_this, byPart), createInventoryEditorCb(_this, cb));
  }

  function createInventoryEditor(_this, byPart) {
    return new InventoryEditorViewModel({
      byPart: byPart,
      accountId: _this.accountId,
      //@TODO: get real monitoringStationOS
      monitoringStationOS: 'MI_DICE',
      //@TODO: get real salesman and technician
      salesman: {
        id: 'SALS001',
        name: 'SALS001',
      },
      // technician: {
      //   id: 'FRANK002',
      //   name: 'Frank',
      // },
    });
  }

  function createInventoryEditorCb(_this, cb) {
    return function(result) {
      if (result && result.Items) {
        _this.partsGrid.list(result.Items);
      }
      if (utils.isFunc(cb)) {
        cb();
      }
    };
  }

  return InventoryViewModel;
});
