define('src/account/security/equipment.editor.vm', [
  'src/dataservice',
  'src/core/strings',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  dataservice,
  strings,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema,
    searchBarcodeSchema, searchPartNumSchema,
    strConverter = ukov.converters.string();

  searchBarcodeSchema = {
    converter: strConverter,
    validators: [
      ukov.validators.isRequired('Please enter a barcode'),
    ],
  };
  searchPartNumSchema = {
    converter: ukov.converters.toUpper(),
    validators: [
      ukov.validators.isRequired('Please enter a part #'),
    ],
  };

  schema = {
    _model: true,
    AccountEquipmentID: {},
    AccountEquipmentUpgradeTypeId: {},
    AccountId: {},
    AccountZoneAssignmentID: {},
    // AccountZoneType: {},
    AccountZoneTypeId: {},
    // ActualPoints: 3,
    BarcodeId: {},
    // EquipmentLocationDesc: null,
    EquipmentLocationId: {},
    GPEmployeeId: {},
    IsExisting: {},
    IsExistingWiring: {},
    IsMainPanel: {},
    IsServiceUpgrade: {},
    ItemDesc: {},
    ItemId: {},
    ItemSKU: {},
    Price: {
      converter: ukov.converters.number(2),
    },
    Zone: {
      converter: strConverter,
    },

    //@NOTE: these are not returned in equipment item array... msaccountsetupsrv/accounts/151147/equipment
    ZoneEventType: {},
  };


  function EquipmentEditorViewModel(options) {
    var _this = this;
    EquipmentEditorViewModel.super_.call(_this, options);
    _this.mixinLoad();
    BaseViewModel.ensureProps(_this, [
      // 'customerId',
      'accountId',
      'monitoringStationOsId',
      'cache',
      'byPart',
    ]);
    BaseViewModel.ensureProps(_this.cache, [
      'reps',
    ]);

    _this.title = _this.byPart ? 'Part #' : 'Barcode';
    _this.searchKey = ukov.wrap('', _this.byPart ? searchPartNumSchema : searchBarcodeSchema);

    _this.item = _this.item || {
      AccountEquipmentID: null,
      AccountEquipmentUpgradeTypeId: null,
      AccountId: null,
      AccountZoneAssignmentID: null,
      AccountZoneTypeId: null,
      BarcodeId: null,
      EquipmentLocationId: null,
      GPEmployeeId: null,
      IsExisting: null,
      IsExistingWiring: null,
      IsMainPanel: null,
      IsServiceUpgrade: null,
      ItemDesc: null,
      ItemId: null,
      ItemSKU: null,
      Price: '',
      Zone: '',

      // see schema
      ZoneEventType: null,

      //IsUpgrade: null,
      //UpgradePrice: '',
      //MainPanel: null,
    };

    _this.data = ukov.wrap(utils.clone(_this.item), schema);
    _this.hasItem = ko.computed(function() {
      return !!_this.data.ItemId();
    });
    _this.data.ZoneEventTypeCvm = new ComboViewModel({
      selectedValue: _this.data.ZoneEventType,
      fields: {
        value: 'ZoneEventTypeID',
        text: 'Descrption',
      },
    });
    _this.data.EquipmentLocationCvm = new ComboViewModel({
      selectedValue: _this.data.EquipmentLocationId,
      nullable: true,
      fields: {
        value: 'EquipmentLocationID',
        text: 'EquipmentLocationDesc',
      },
    });
    _this.data.ZoneTypeCvm = new ComboViewModel({
      selectedValue: _this.data.AccountZoneTypeId,
      fields: {
        value: 'AccountZoneTypeID',
        text: 'AccountZoneType',
      },
    });
    _this.data.AssignToCvm = new ComboViewModel({
      selectedValue: _this.data.GPEmployeeId,
      nullable: true,
      fields: {
        value: 'CompanyID',
        text: 'FullName',
      },
    });
    _this.data.IsUpgradeCvm = new ComboViewModel({
      selectedValue: _this.data.AccountEquipmentUpgradeTypeId,
      nullable: true,
      list: _this.isUpgradeOptions,
    });
    _this.data.IsExistingWiringCvm = new ComboViewModel({
      selectedValue: _this.data.IsExistingWiring,
      nullable: true,
      list: _this.yesNoOptions,
    });
    _this.data.MainPanelCvm = new ComboViewModel({
      selectedValue: _this.data.IsMainPanel,
      nullable: true,
      list: _this.yesNoOptions,
    });

    //
    // events
    //
    _this.cmdCancel = ko.command(function(cb) {
      closeLayer(_this);
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy();
    });
    _this.cmdAdd = ko.command(function(cb) {
      addEquipment(_this, cb);
    });
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue(),
        tmp = {
          EquipmentLocationDesc: _this.data.EquipmentLocationCvm.selectedItem().EquipmentLocationDesc,
          ItemSKU: model.ItemSKU,
          IsServiceUpgrade: model.IsServiceUpgrade,
          ActualPoints: _this.data.model.ActualPoints,
        };
      dataservice.msaccountsetupsrv.equipments.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.data.markClean(model, true);

        var data = resp.Value;
        //@HACK: fix fields that don't get returned
        data.EquipmentLocationDesc = tmp.EquipmentLocationDesc;
        data.ItemSKU = tmp.ItemSKU;
        data.IsServiceUpgrade = tmp.IsServiceUpgrade;
        data.ActualPoints = tmp.ActualPoints;
        if (_this.byPart) {

        } else {

        }

        _this.layerResult = data;
        _this.isDeleted = false;
        closeLayer(_this);
      }, notify.error, false));
    }, function(busy) {
      return !busy && !_this.cmdAdd.busy() && !_this.cmdDelete.busy();
    });
    _this.cmdDelete = ko.command(function(cb) {
      notify.confirm('Delete?', 'Are you sure you want to delete this equipment item?', function(result) {
        if (result !== 'yes') {
          cb();
          return;
        }
        dataservice.msaccountsetupsrv.equipments.del(_this.item.AccountEquipmentID, null, utils.safeCallback(cb, function(err, resp) {
          if (!resp.Value) {
            console.log('item already deleted or item does not exist');
          }
          _this.layerResult = true;
          _this.isDeleted = true;
          closeLayer(_this);
        }, notify.error, false));
      });
    }, function(busy) {
      return !busy && !_this.cmdAdd.busy() && !_this.cmdSave.busy() && (_this.item.AccountEquipmentID > 0);
    });
  }
  utils.inherits(EquipmentEditorViewModel, BaseViewModel);
  EquipmentEditorViewModel.prototype.viewTmpl = 'tmpl-security-equipment_editor';
  EquipmentEditorViewModel.prototype.width = 550;
  EquipmentEditorViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  EquipmentEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, _this.isDeleted];
  };
  EquipmentEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdAdd.busy() && !_this.layerResult) {
      msg = 'Please wait for add to finish.';
    } else if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = 'Please wait for save to finish.';
    } else if (_this.cmdDelete.busy() && !_this.layerResult) {
      msg = 'Please wait for delete to finish.';
    }
    return msg;
  };


  EquipmentEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    load_zoneEventTypes(_this.cache, _this.data.ZoneEventTypeCvm, _this.monitoringStationOsId, join.add());
    load_accountZoneTypes(_this.cache, _this.data.ZoneTypeCvm, _this.monitoringStationOsId, join.add());
    load_equipmentLocation(_this.cache, _this.data.EquipmentLocationCvm, _this.monitoringStationOsId, join.add());
    load_rep(_this.cache, _this.item.GPEmployeeId, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      //
      _this.data.AssignToCvm.setList(_this.cache.reps);
      // set current data
      if (_this.item) {
        _this.data.setValue(_this.item, true);
      }
      // make everything clean (if item is null everything is clean)
      _this.data.markClean(_this.item, true);
    });
  };
  // EquipmentEditorViewModel.prototype.closeValues = function() {
  //   return [ //
  //   ];
  // };

  // ?????????
  //CUST  Customer
  //SALESREP  Sales Rep
  //TECH  Technician
  //commented by reagan/junryl match upgrade type from crm db
  EquipmentEditorViewModel.prototype.isUpgradeOptions = [ //
    {
      value: 'CUST',
      text: 'Customer',
    }, {
      value: 'SALESREP',
      text: 'Sales Rep',
    }, {
      value: 'TECH',
      text: 'Technician',
    },
  ];
  /*EquipmentEditorViewModel.prototype.isUpgradeOptions = [ //
    {
      value: null,
      text: 'null',
    }, {
      value: true,
      text: 'Tech',
    }, {
      value: false,
      text: 'Rep',
    },
  ];*/

  function load_zoneEventTypes(cache, cvm, monitoringStationOsId, cb) {
    readMonitoringStationOS(cache, cvm, monitoringStationOsId, 'zoneEventTypes', {
      'equipmentTypeId': 1,
    }, cb);
  }

  function load_accountZoneTypes(cache, cvm, monitoringStationOsId, cb) {
    readMonitoringStationOS(cache, cvm, monitoringStationOsId, 'accountZoneTypes', {}, cb);
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

  function load_rep(cache, companyId, cb) {
    if (!companyId || cache.reps.some(function(rep) {
      return companyId === rep.CompanyID;
    })) {
      cb();
      return;
    }

    // ?????
    dataservice.qualify.salesrep.read({
      id: companyId,
    }, function(rep) {
      // normalize data
      rep.FullName = strings.format('{0} - {1}', rep.CompanyID, strings.joinTrimmed(' ', rep.FirstName, rep.LastName));
      cache.reps.push(rep);
    }, cb);
  }

  function addEquipment(_this, cb) {
    var searchKey = _this.searchKey.getValue();
    console.log("accountId:" + _this.accountId);
    console.log("tId:" + _this.tId);

    dataservice.msaccountsetupsrv.equipments.read({
      id: searchKey,
      link: _this.byPart ? 'ByPartNumber' : 'ByBarcode',
      query: {
        id: _this.accountId,
        tid: _this.tId
      }
    }, null, utils.safeCallback(cb, function(err, resp) {
      // //Set Item Name and Part# to UI
      // _this.itemName(resp.Value.ItemDesc);
      // _this.partNumber(searchKey);

      var data = resp.Value;

      if (_this.byPart) {
        data.ItemSKU = searchKey; //@HACK: to set ItemSKU since it is not returned.....
      } else {
        data.BarcodeId = searchKey; //@HACK: to set BarcodeId since it is not returned.....
        // ActualPoints and ItemSKU are also missing...
      }

      _this.data.setValue(data);
      _this.data.markClean(data, true);

      // set result, but don't close
      // needed incase cancel is pressed after this point
      _this.layerResult = data;
      _this.isDeleted = false;
    }, notify.error));
  }

  return EquipmentEditorViewModel;
});
