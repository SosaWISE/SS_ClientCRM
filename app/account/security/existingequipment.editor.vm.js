define('src/account/security/existingequipment.editor.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var searchKeySchema, schema,
    strConverter = ukov.converters.string();

  searchKeySchema = {
    converter: strConverter,
  };

  schema = {
    _model: true,
    EquipmentItem: {},
    Zone: {
      converter: strConverter,
    },
    ZoneEventType: {},
    ItemLocation: {},
    IsExistingWiring: {},
  };


  function ExistingEquipmentEditorViewModel(options) {
    var _this = this;
    ExistingEquipmentEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      // 'customerId',
      'accountId',
      'monitoringStationOS',
    ]);
    _this.mixinLoad();

    _this.searchKey = ukov.wrap('', searchKeySchema);

    _this.data = ukov.wrap(_this.item || {
      EquipmentItem: null,
      Zone: '',
      ZoneEventType: null,
      ItemLocation: null,
      IsExistingWiring: null,
    }, schema);


    _this.data.EquipmentCvm = new ComboViewModel({
      selectedValue: _this.data.EquipmentItem,
      fields: {
        value: 'EquipmentID',
        text: 'ShortName',
      },
    });

    _this.data.ZoneEventTypeCvm = new ComboViewModel({
      selectedValue: _this.data.ZoneEventType,
      fields: {
        value: 'ZoneEventTypeID',
        text: 'Descrption',
      },
    });
    _this.data.ItemLocationCvm = new ComboViewModel({
      selectedValue: _this.data.ItemLocation,
      fields: {
        value: 'AccountZoneTypeID',
        text: 'AccountZoneType',
      },
    });
    _this.data.IsExistingWiringCvm = new ComboViewModel({
      selectedValue: _this.data.IsExistingWiring,
      nullable: true,
      list: _this.yesNoOptions,
    });
    //
    // events
    //
    _this.cmdCancel = ko.command(function(cb) {
      closeLayer(null);
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy();
    });
    _this.cmdSave = ko.command(function(cb) {
      alert("@TODO");
      // closeLayer(result);
      cb();
    });

    function closeLayer(result) {
      if (_this.layer) {
        _this.layer.close(result);
      }
    }
  }
  utils.inherits(ExistingEquipmentEditorViewModel, BaseViewModel);
  ExistingEquipmentEditorViewModel.prototype.viewTmpl = 'tmpl-security-existing_equipment_editor';
  ExistingEquipmentEditorViewModel.prototype.width = 290;
  ExistingEquipmentEditorViewModel.prototype.height = 'auto';


  ExistingEquipmentEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    load_equipment(_this.data.EquipmentCvm, _this.monitoringStationOS, join.add());
    load_zoneEventTypes(_this.data.ZoneEventTypeCvm, _this.monitoringStationOS, join.add());
    load_accountZoneTypes(_this.data.ItemLocationCvm, _this.monitoringStationOS, join.add());
  };

  function load_equipment(cvm, monitoringStationOS, cb) {
    dataservice.msaccountsetupsrv.monitoringStationOS.read({
      link: 'EquipmentList'
    }, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);
    }, utils.no_op));

  }

  function load_zoneEventTypes(cvm, monitoringStationOS, cb) {
    readMonitoringStationOS(cvm, monitoringStationOS, 'zoneEventTypes', {
      'equipmentTypeId': 1,
    }, cb);
  }

  function load_accountZoneTypes(cvm, monitoringStationOS, cb) {
    readMonitoringStationOS(cvm, monitoringStationOS, 'accountZoneTypes', {}, cb);
  }

  function readMonitoringStationOS(cvm, id, link, query, cb) {
    dataservice.msaccountsetupsrv.monitoringStationOS.read({
      id: id,
      link: link,
      query: query,
    }, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);
      // cvm.selectItem(cvm.list()[0]); // select first
    }, utils.no_op));
  }

  return ExistingEquipmentEditorViewModel;
});
