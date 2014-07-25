define('src/account/security/equipment.vm', [
  'src/account/security/securityhelper',
  'ko',
  'src/dataservice',
  'src/account/security/equipment.editor.vm',
  'src/account/security/equipment.gvm',
  'src/core/strings',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  securityhelper,
  ko,
  dataservice,
  EquipmentEditorViewModel,
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
        showEquipmentEditor(_this, '', utils.clone(eqItem), cb);
      },
    });

    //
    // events
    //


    function createReloadGvmCb(cb) {
      return function(result) {
        if (result) { // check if something was posted
          reloadEquipment(_this, cb);
        } else {
          cb();
        }
      };
    }
    _this.cmdAddByPart = ko.command(function(cb) {
      showEquipmentEditor(_this, 'part', null, createReloadGvmCb(cb));
    }, function(busy) {
      return !busy && !_this.cmdAddByBarcode.busy() && !_this.cmdAddExistingEquipment.busy();
    });
    _this.cmdAddByBarcode = ko.command(function(cb) {
      showEquipmentEditor(_this, 'barcode', null, createReloadGvmCb(cb));
    }, function(busy) {
      return !busy && !_this.cmdAddByPart.busy() && !_this.cmdAddExistingEquipment.busy();
    });
    _this.cmdAddExistingEquipment = ko.command(function(cb) {
      showEquipmentEditor(_this, 'existing', null, createReloadGvmCb(cb));
    }, function(busy) {
      return !busy && !_this.cmdAddByPart.busy() && !_this.cmdAddByBarcode.busy();
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

  function showEquipmentEditor(_this, addBy, item, cb) {
    var vm = new EquipmentEditorViewModel({
      addBy: addBy,
      item: item,
      accountId: _this.accountId,
      monitoringStationOsId: _this.accountDetails.MonitoringStationOsId,
      cache: _this.cache,
      nextZone: getNextZone(_this),
    });
    _this.layersVm.show(vm, cb);
  }

  function getNextZone(_this) {
    var max = 0;
    _this.gvm.list.peek().forEach(function(item) {
      var zone = parseInt(item.Zone, 10);
      if (zone > max) {
        max = zone;
      }
    });
    return securityhelper.zoneString(max + 1);
  }

  function reloadEquipment(_this, cb) {
    if (_this.gvm.loading()) {
      cb();
      return;
    }
    _this.gvm.loading(true);
    load_equipment(_this.gvm, _this.accountId, function() {
      _this.gvm.loading(false);
      cb();
    });
  }

  return EquipmentViewModel;
});
