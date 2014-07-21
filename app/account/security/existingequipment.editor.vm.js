define('src/account/security/existingequipment.editor.vm', [
  'src/core/querystring',
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  querystring,
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
    AccountId: {},
    ItemId: {
      validators: [
        ukov.validators.isRequired('Please select the equipment'),
      ],
    },
    Zone: {
      converter: strConverter,
    },
    ZoneEventTypeId: {
      validators: [
        ukov.validators.isRequired('Please select a zone event type'),
      ],
    },
    EquipmentLocationId: {
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
      AccountId: options.AccountId,
      ItemId: null,
      Zone: '',
      ZoneEventTypeId: null,
      EquipmentLocationId: null,
      IsExistingWiring: null,
    }, schema);


    _this.data.ItemCvm = new ComboViewModel({
      selectedValue: _this.data.ItemId,
      fields: {
        value: 'EquipmentID',
        text: 'ShortName',
      },
    });

    _this.data.ZoneEventTypeCvm = new ComboViewModel({
      selectedValue: _this.data.ZoneEventTypeId,
      fields: {
        value: 'ZoneEventTypeID',
        text: 'Descrption',
      },
    });
    _this.data.EquipmentLocationCvm = new ComboViewModel({
      selectedValue: _this.data.EquipmentLocationId,
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

    subscribeEquipment(_this);

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      dataservice.msaccountsetupsrv.equipmentExistings.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        notify.info('Saved Third Party Equipment', '', 3);
        if (resp.Message && resp.Message !== 'Success') {
          notify.error(resp, 3);
        }
        _this.data.markClean(model, true);
        //
        _this.layerResult = resp.Value;
        _this.isDeleted = false;
        closeLayer(_this);
      }, notify.error));
    }, function(busy) {
      return !busy;
    });
  }
  utils.inherits(ExistingEquipmentEditorViewModel, BaseViewModel);
  ExistingEquipmentEditorViewModel.prototype.viewTmpl = 'tmpl-security-existing_equipment_editor';
  ExistingEquipmentEditorViewModel.prototype.width = 290;
  ExistingEquipmentEditorViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  ExistingEquipmentEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  ExistingEquipmentEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = 'Please wait for save to finish.';
    }
    return msg;
  };


  ExistingEquipmentEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    load_equipment(_this.cache, _this.data.ItemCvm.setList, join.add());
    load_equipmentLocation(_this.cache, _this.monitoringStationOsId, _this.data.EquipmentLocationCvm.setList, join.add());
  };

  function load_equipment(cache, setter, cb) {
    readMonitoringStationOS(cache, null, 'equipmentExistingList', {}, setter, cb);
  }

  function load_zoneEventTypes(cache, monitoringStationOsId, equipmentTypeId, setter, cb) {
    readMonitoringStationOS(cache, monitoringStationOsId, 'zoneEventTypes', {
      'equipmentTypeId': equipmentTypeId,
    }, setter, cb);
  }

  function load_equipmentLocation(cache, monitoringStationOsId, setter, cb) {
    readMonitoringStationOS(cache, monitoringStationOsId, 'equipmentLocations', {}, setter, cb);
  }

  function readMonitoringStationOS(cache, id, link, query, setter, cb) {
    var cacheKey = id + link + querystring.toQuerystring(query);
    if (cache[cacheKey]) {
      setter(cache[cacheKey]);
      cb();
      return;
    }
    // get new list
    dataservice.msaccountsetupsrv.monitoringStationOS.read({
      id: id,
      link: link,
      query: query,
    }, function(val) {
      setter(cache[cacheKey] = val);
    }, cb);
  }

  function subscribeEquipment(_this) {
    var lastItem, setter = _this.data.ZoneEventTypeCvm.setList;
    _this.data.ItemCvm.selected.subscribe(function(item) {
      if (item === _this.data.ItemCvm.noItemSelected) {
        return;
      }
      // unwrap item
      item = item.item;
      // store for later use
      lastItem = item;
      // clear list
      setter([]);
      load_zoneEventTypes(_this.cache, _this.monitoringStationOsId, item.EquipmentTypeId, function(val) {
        if (lastItem === item) {
          // set list
          setter(val);
        }
      }, function(err) {
        if (err) {
          notify.error(err);
        }
      });
    });
  }

  return ExistingEquipmentEditorViewModel;
});
