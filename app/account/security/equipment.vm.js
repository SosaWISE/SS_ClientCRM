define('src/account/security/equipment.vm', [
  'ko',
  'src/account/security/equipment.editor.vm',
  'src/account/security/existingequipment.editor.vm',
  'src/account/security/equipment.gvm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',

], function(
  ko,
  EquipmentEditorViewModel,
  ExistingEquipmentEditorViewModel,
  EquipmentGridViewModel,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var CompanyId;

  function EquipmentViewModel(options) {
    var _this = this;
    EquipmentViewModel.super_.call(_this, options);
    // ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.layersVm = _this.layersVm || new LayersViewModel({
      controller: _this,
    });


    _this.gvm = new EquipmentGridViewModel();


    //Retrieve the Technician ID to be used for Adding by Barcode/Part#
    CompanyId = _this.repCompanyID;
    console.log("CompanyId: " + JSON.stringify(CompanyId));


    //
    // events
    //



    _this.cmdAddByPart = ko.command(function(cb) {
      showEquipmentEditor(_this, true, cb, CompanyId);
    });
    _this.cmdAddByBarcode = ko.command(function(cb) {
      showEquipmentEditor(_this, false, cb, CompanyId);
    });
    _this.cmdAddExistingEquipment = ko.command(function(cb) {
      showExistingEquipmentEditor(_this, cb);
    });
  }
  utils.inherits(EquipmentViewModel, ControllerViewModel);
  EquipmentViewModel.prototype.viewTmpl = 'tmpl-security-equipment';

  EquipmentViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    _this.accountId = routeData.id;

    setTimeout(function() {
      //@TODO: load real data
      cb();
    }, 0);
  };



  function showEquipmentEditor(_this, byPart, cb, CompanyId) {
    _this.layersVm.show(createEquipmentEditor(_this, byPart, CompanyId), createEquipmentEditorCb(_this, cb));
  }

  function showExistingEquipmentEditor(_this, cb) {
    _this.layersVm.show(createExistingEquipmentEditor(_this), createExistingEquipmentEditorCb(_this, cb));
  }


  function createEquipmentEditor(_this, byPart, CompanyId) {

    return new EquipmentEditorViewModel({
      byPart: byPart,
      accountId: _this.accountId,
      //@TODO: get real monitoringStationOS
      monitoringStationOS: 'MI_DICE',
      //@TODO: get real salesman and technician
      salesman: {
        id: 'SALS001',
        name: 'SALS001',
      },
      tId: CompanyId
      // technician: {
      //   id: 'FRANK002',
      //   name: 'Frank',
      // },
    });
  }


  function createEquipmentEditorCb(_this, cb) {
    return function(result) {
      if (result && result.Items) {
        _this.partsGrid.list(result.Items);
      }
      if (utils.isFunc(cb)) {
        cb();
      }
    };
  }


  function createExistingEquipmentEditor(_this) {
    return new ExistingEquipmentEditorViewModel({

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

  function createExistingEquipmentEditorCb(_this, cb) {
    return function(result) {
      if (result && result.Items) {
        _this.partsGrid.list(result.Items);
      }
      if (utils.isFunc(cb)) {
        cb();
      }
    };
  }

  return EquipmentViewModel;
});
