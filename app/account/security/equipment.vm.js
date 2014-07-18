define('src/account/security/equipment.vm', [
  'ko',
  'src/dataservice',
  'src/account/security/equipment.editor.vm',
  'src/account/security/existingequipment.editor.vm',
  'src/account/security/equipment.gvm',
  'src/core/strings',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',

], function(
  ko,
  dataservice,
  EquipmentEditorViewModel,
  ExistingEquipmentEditorViewModel,
  EquipmentGridViewModel,
  strings,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function EquipmentViewModel(options) {
    var _this = this;
    EquipmentViewModel.super_.call(_this, options);
    // ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.layersVm = _this.layersVm || new LayersViewModel({
      controller: _this,
    });


    _this.gvm = new EquipmentGridViewModel({
      edit: function(eqItem, cb) {
        //showDispatchAgencyEditor(_this, agency, cb);
        showEquipmentEditor(_this, false, utils.clone(eqItem), cb);
      },
    });

    //
    // events
    //

    _this.cmdAddByPart = ko.command(function(cb) {
      showEquipmentEditor(_this, true, null, function(model) {
        if (model) {
          _this.gvm.list.push(model);
        }
        cb();
      });
    });
    _this.cmdAddByBarcode = ko.command(function(cb) {
      showEquipmentEditor(_this, false, null, function(model) {
        if (model) {
          _this.gvm.list.push(model);
        }
        cb();
      });
    });
    _this.cmdAddExistingEquipment = ko.command(function(cb) {
      showExistingEquipmentEditor(_this, cb);
    });
  }
  utils.inherits(EquipmentViewModel, ControllerViewModel);
  EquipmentViewModel.prototype.viewTmpl = 'tmpl-security-equipment';

  EquipmentViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.accountId = routeData.id;

    // clear cache
    _this.cache = {};

    load_accountDetails(_this.accountId, function(val) {
      if (!val) {
        _this.accountDetails = {};
        _this.cache.reps = [];
      } else {
        _this.accountDetails = val;
        _this.cache.reps = [ //
          {
            CompanyID: val.SalesRepId,
            FullName: strings.format('{0} - {1}', val.SalesRepId, val.SalesRepFullName),
          }, {
            CompanyID: val.TechId,
            FullName: strings.format('{0} - {1}', val.TechId, val.TechFullName),
          },
        ];
      }
      _this.accountDetails.MonitoringStationOsId = _this.accountDetails.MonitoringStationOsId || 'AG_ALARMSYS'; //@HACK: for null value
    }, join.add());
    load_equipment(_this.gvm, _this.accountId, join.add());
  };

  function load_accountDetails(accountId, setter, cb) {
    dataservice.monitoringstationsrv.accounts.read({
      id: accountId,
      link: 'details'
    }, setter, cb);
  }

  function load_equipment(gvm, accountId, cb) {
    gvm.list([]);
    dataservice.msaccountsetupsrv.accounts.read({
      id: accountId,
      link: 'equipment',
    }, null, utils.safeCallback(cb, function(err, resp) {
      gvm.list(resp.Value);
    }, utils.no_op));
  }

  function showEquipmentEditor(_this, byPart, item, cb) {
    _this.layersVm.show(createEquipmentEditor(_this, byPart, item), createEquipmentEditorCb(_this, cb));
  }

  function showExistingEquipmentEditor(_this, cb) {
    _this.layersVm.show(createExistingEquipmentEditor(_this), createExistingEquipmentEditorCb(_this, cb));
  }


  function createEquipmentEditor(_this, byPart, item) {
    return new EquipmentEditorViewModel({
      byPart: byPart,
      item: item,
      accountId: _this.accountId,
      monitoringStationOsId: _this.accountDetails.MonitoringStationOsId,
      cache: _this.cache,
    });
  }

  function createEquipmentEditorCb(_this, cb) {
    return function(result, deleted) {
      if (result && result.Items) {
        _this.partsGrid.list(result.Items);
      }
      if (utils.isFunc(cb)) {
        cb(result, deleted);
      }
    };
  }

  function createExistingEquipmentEditor(_this) {
    return new ExistingEquipmentEditorViewModel({
      accountId: _this.accountId,
      monitoringStationOsId: _this.accountDetails.MonitoringStationOsId,
      cache: _this.cache,
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
