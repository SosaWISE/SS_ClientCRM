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
    EquipmentItem: {
      validators: [
        ukov.validators.isRequired('Please select the equipment'),
      ],
    },
    Zone: {
      converter: strConverter,
    },
    ZoneEventType: {
      validators: [
        ukov.validators.isRequired('Please select a zone event type'),
      ],
    },
    ItemLocation: {
      validators: [
        ukov.validators.isRequired('Please select a location'),
      ],
    },
    IsExistingWiring: {},
  };


  function ExistingEquipmentEditorViewModel(options) {
    var _this = this;
    ExistingEquipmentEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      // 'customerId',
      'accountId',
      'monitoringStationOsId',
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
        value: 'EquipmentLocationID',
        text: 'EquipmentLocationDesc',
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

    load_equipment(_this.cache, _this.data.EquipmentCvm, join.add());
    load_zoneEventTypes(_this.cache, _this.data.ZoneEventTypeCvm, _this.monitoringStationOsId, join.add());
    load_equipmentLocation(_this.cache, _this.data.ItemLocationCvm, _this.monitoringStationOsId, join.add());
  };

  function load_equipment(cache, cvm, cb) {
    readMonitoringStationOS(cache, cvm, null, 'equipmentList', {}, cb);
  }

  function load_zoneEventTypes(cache, cvm, monitoringStationOsId, cb) {
    readMonitoringStationOS(cache, cvm, monitoringStationOsId, 'zoneEventTypes', {
      'equipmentTypeId': 1,
    }, cb);
  }

  function load_equipmentLocation(cache, cvm, monitoringStationOsId, cb) {
    readMonitoringStationOS(cache, cvm, monitoringStationOsId, 'equipmentLocations', {}, cb);
  }

  function readMonitoringStationOS(cache, cvm, id, link, query, cb) {
    if (cache[link]) {
      cvm.setList(cache[link]);
      cb();
      return;
    }
    dataservice.msaccountsetupsrv.monitoringStationOS.read({
      id: id,
      link: link,
      query: query,
    }, function(val) {
      cvm.setList(cache[link] = val);
    }, cb);
  }

  return ExistingEquipmentEditorViewModel;
});
