define('src/account/security/equipment.editor.vm', [
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
    Zone: {
      converter: strConverter,
    },
    ZoneEventType: {},
    ItemLocation: {},
    AssignTo: {},
    UpgradePrice: {},
    MainPanel: {},
  };


  function EquipmentEditorViewModel(options) {
    var _this = this;
    EquipmentEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      // 'customerId',
      'accountId',
      'monitoringStationOS',
    ]);
    _this.mixinLoad();

    _this.searchKey = ukov.wrap('', searchKeySchema);

    _this.data = ukov.wrap(_this.item || {
      Zone: '',
      ZoneEventType: '',
      ItemLocation: '',
      AssignTo: '',
      UpgradePrice: '',
      MainPanel: '',
    }, schema);

    _this.data.ZoneEventTypeCvm = new ComboViewModel({
      selectedValue: _this.data.ZoneEventType,
      list: _this.relationshipOptions,
      fields: _this.relationshipOptionFields,
    });
    _this.data.ItemLocationCvm = new ComboViewModel({
      selectedValue: _this.data.ItemLocation,
    });
    _this.data.AssignToCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
      nullable: true,
    });
    _this.data.IsUpgradeCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
      nullable: true,
      list: _this.isUpgradeOptions,
    });
    _this.data.IsExistingWiringCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
      nullable: true,
      list: _this.yesNoOptions,
    });
    _this.data.MainPanelCvm = new ComboViewModel({
      selectedValue: _this.data.asdf,
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
      // closeLayer(result);
      cb();
    });

    function closeLayer(result) {
      if (_this.layer) {
        _this.layer.close(result);
      }
    }
  }
  utils.inherits(EquipmentEditorViewModel, BaseViewModel);
  EquipmentEditorViewModel.prototype.viewTmpl = 'tmpl-security-equipment_editor';
  EquipmentEditorViewModel.prototype.width = 550;
  EquipmentEditorViewModel.prototype.height = 'auto';

  // ?????????
  EquipmentEditorViewModel.prototype.isUpgradeOptions = [
    {
      value: null,
      text: 'null',
    },
    {
      value: true,
      text: 'Tech',
    },
    {
      value: false,
      text: 'Rep',
    },
  ];

  EquipmentEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    load_zoneEventTypes(_this.data.ZoneEventTypeCvm, _this.monitoringStationOS, join.add());
    load_accountZoneTypes(_this.ItemLocationCvm, _this.monitoringStationOS, join.add());
  };

  function load_zoneEventTypes(cvm, monitoringStationOS, cb) {
    readMonitoringStationOS(cvm, monitoringStationOS, 'zoneEventTypes', cb);
  }

  function load_accountZoneTypes(cvm, monitoringStationOS, cb) {
    readMonitoringStationOS(cvm, monitoringStationOS, 'accountZoneTypes', cb);
  }

  function readMonitoringStationOS(cvm, id, link, cb) {
    dataservice.monitoringstation.monitoringStationOS.read({
      id: id,
      link: link,
    }, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);
      cvm.selectItem(cvm.list()[0]); // select first
    }, utils.no_op));
  }

  return EquipmentEditorViewModel;
});
