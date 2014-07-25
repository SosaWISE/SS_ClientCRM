define('src/account/security/equipment.editor.vm', [
  'src/config',
  'src/core/querystring',
  'src/account/security/securityhelper',
  'src/dataservice',
  'src/core/joiner',
  'src/core/strings',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  config,
  querystring,
  securityhelper,
  dataservice,
  joiner,
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
    strConverter = ukov.converters.string(),
    isRequired = ukov.validators.isRequired();

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

    AccountEquipmentID: {}, //long
    AccountId: {}, //long
    EquipmentId: {}, //string
    EquipmentLocationId: {}, //int?
    GPEmployeeId: {}, //string
    AccountEquipmentUpgradeTypeId: {}, //string
    Points: {}, //int
    ActualPoints: {}, //double?
    Price: { //decimal
      converter: ukov.converters.number(2),
    },
    IsExisting: {
      validators: [isRequired],
    },
    BarcodeId: {}, //string
    IsServiceUpgrade: {
      validators: [isRequired],
    },
    IsExistingWiring: {
      validators: [isRequired],
    },
    IsMainPanel: {
      validators: [isRequired],
    },

    AccountZoneAssignmentID: {}, //long
    AccountZoneTypeId: { //string
      validators: [
        ukov.validators.isRequired('Please enter a Zone Type'),
      ],
    },
    AccountEventId: {}, //int?
    Zone: {
      converter: securityhelper.zoneStringConverter,
    },
    Comments: {},

    // // readonly
    ItemSKU: {},
    ItemDesc: {},
    // ItemDesc
    // AccountZoneType
    // EquipmentLocationDesc
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
      'nextZone',
    ]);
    BaseViewModel.ensureProps(_this.cache, [
      'reps',
    ]);

    _this.title = _this.byPart ? 'Part #' : 'Barcode';
    _this.searchKey = ukov.wrap('', _this.byPart ? searchPartNumSchema : searchBarcodeSchema);

    _this.item = _this.item || {
      AccountEquipmentID: null,
      AccountId: _this.accountId,
      EquipmentId: null,
      EquipmentLocationId: null,
      GPEmployeeId: null,
      AccountEquipmentUpgradeTypeId: null,
      Points: null,
      ActualPoints: null,
      Price: null,
      IsExisting: false,
      BarcodeId: null,
      IsServiceUpgrade: false,
      IsExistingWiring: false,
      IsMainPanel: false,

      AccountZoneAssignmentID: null,
      AccountZoneTypeId: null,
      AccountEventId: null,
      Zone: null,
      Comments: null,
    };

    _this.data = ukov.wrap(utils.clone(_this.item), schema);
    _this.hasItem = ko.computed(function() {
      return !!_this.data.EquipmentId();
    });
    _this.data.AssignToCvm = new ComboViewModel({
      selectedValue: _this.data.GPEmployeeId,
      nullable: true,
      fields: {
        value: 'CompanyID',
        text: 'FullName',
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
        value: 'AccountZoneTypeId',
        text: 'AccountZoneType',
      },
    });
    _this.data.AccountEventCvm = new ComboViewModel({
      selectedValue: _this.data.AccountEventId,
      fields: {
        value: 'AccountEventID',
        // text: 'Description',
        text: function(item) {
          return strings.format('{0} ({1})', item.Description, item.AccountEventID);
        },
      },
    });
    subscribeZoneType(_this);

    _this.data.IsUpgradeCvm = new ComboViewModel({
      selectedValue: _this.data.AccountEquipmentUpgradeTypeId,
      // nullable: true,
      list: _this.isUpgradeOptions,
    });
    _this.data.IsExistingWiringCvm = new ComboViewModel({
      selectedValue: _this.data.IsExistingWiring,
      // nullable: true,
      list: _this.yesNoOptions,
    });
    _this.data.MainPanelCvm = new ComboViewModel({
      selectedValue: _this.data.IsMainPanel,
      // nullable: true,
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
    _this.cmdSearch = ko.command(function(cb) {
      searchEquipment(_this, cb);
    });
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      // tmp = {
      //   EquipmentLocationDesc: _this.data.EquipmentLocationCvm.selectedItem().EquipmentLocationDesc,
      //   ItemSKU: model.ItemSKU,
      //   IsServiceUpgrade: model.IsServiceUpgrade,
      //   ActualPoints: _this.data.model.ActualPoints,
      // };
      dataservice.msaccountsetupsrv.equipments.save({
        id: model.AccountEquipmentID, // if no value create, else update
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.data.markClean(model, true);

        var data = resp.Value;
        // //@HACK: fix fields that don't get returned
        // data.EquipmentLocationDesc = tmp.EquipmentLocationDesc;
        // data.ItemSKU = tmp.ItemSKU;
        // data.IsServiceUpgrade = tmp.IsServiceUpgrade;
        // data.ActualPoints = tmp.ActualPoints;
        // if (_this.byPart) {
        // } else {
        // }

        _this.layerResult = data;
        _this.isDeleted = false;
        closeLayer(_this);
      }, notify.error, false));
    }, function(busy) {
      return !busy && !_this.cmdSearch.busy() && !_this.cmdDelete.busy();
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
      return !busy && !_this.cmdSearch.busy() && !_this.cmdSave.busy() && (_this.item.AccountEquipmentID > 0);
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
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = 'Please wait for save to finish.';
    } else if (_this.cmdDelete.busy() && !_this.layerResult) {
      msg = 'Please wait for delete to finish.';
    }
    return msg;
  };


  EquipmentEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      equipmentId = _this.data.EquipmentId.peek();

    if (equipmentId) {
      load_equipmentAccountZoneTypes(equipmentId, function(val) {
        _this.data.ZoneTypeCvm.setList(val);
      }, join.add());
    }
    load_rep(_this, config.user.peek().GPEmployeeID, join.add());
    load_rep(_this, _this.item.GPEmployeeId, join.add());
    load_equipmentLocation(_this, _this.data.EquipmentLocationCvm, _this.monitoringStationOsId, join.add());

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

  // function load_equipmentAccountZoneTypes(_this, equipmentId, setter, cb) {
  //   readAccountSetupSrv(_this, 'equipments', equipmentId, 'equipmentAccountZoneTypes', {}, setter, cb);
  // }
  function load_equipmentAccountZoneTypes(equipmentId, setter, cb) {
    dataservice.msaccountsetupsrv.equipments.read({
      id: equipmentId,
      link: 'equipmentAccountZoneTypes',
    }, setter, cb);
  }

  function load_equipmentAccountZoneTypeEvents(_this, equipmentId, equipmentAccountZoneTypeId, monitoringStationOSId, setter, cb) {
    readAccountSetupSrv(_this, 'equipments', equipmentId, 'equipmentAccountZoneTypeEvents', {
      'equipmentAccountZoneTypeId': equipmentAccountZoneTypeId,
      'monitoringStationOSId': monitoringStationOSId,
    }, setter, cb);
  }

  function load_equipmentLocation(_this, cvm, monitoringStationOsId, cb) {
    readAccountSetupSrv(_this, 'monitoringStationOS', monitoringStationOsId, 'equipmentLocations', {}, cvm.setList, cb);
  }

  function readAccountSetupSrv(_this, collectionName, id, link, query, setter, cb) {
    var cache = _this.cache,
      cacheKey = id + link + querystring.toQuerystring(query);
    if (cache[cacheKey]) {
      setter(cache[cacheKey]);
      cb();
      return;
    }
    dataservice.msaccountsetupsrv[collectionName].read({
      id: id,
      link: link,
      query: query,
    }, function(val) {
      setter(cache[cacheKey] = val);
    }, cb);
  }

  function subscribeZoneType(_this) {
    var lastItem, data = _this.data,
      setter = data.AccountEventCvm.setList;
    data.ZoneTypeCvm.selected.subscribe(function(item) {
      if (item === data.ZoneTypeCvm.noItemSelected) {
        return;
      }
      // unwrap item
      item = item.item;
      // store for later use
      lastItem = item;
      // clear list
      setter([]);
      load_equipmentAccountZoneTypeEvents(_this, data.EquipmentId.peek(), item.EquipmentAccountZoneTypeID, _this.monitoringStationOsId, function(val) {
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

  function load_rep(_this, companyId, cb) {
    var cache = _this.cache;

    function hasRep(id) {
      return cache.reps.some(function(rep) {
        return id === rep.CompanyID;
      });
    }
    if (!companyId || hasRep(companyId)) {
      cb();
      return;
    }

    // ?????
    dataservice.qualify.salesrep.read({
      id: companyId,
    }, function(rep) {
      // don't add duplicates
      if (!hasRep(rep.CompanyID)) {
        // normalize data
        rep.FullName = strings.format('{0} - {1}', rep.CompanyID, strings.joinTrimmed(' ', rep.FirstName, rep.LastName));
        // add
        cache.reps.push(rep);
      }
    }, cb);
  }

  function searchEquipment(_this, cb) {
    var join = joiner(),
      searchKey = _this.searchKey.getValue();
    join.after(function(err) {
      if (err) {
        notify.error(err);
      }
      cb();
    });
    // load equipment
    dataservice.msaccountsetupsrv.equipments.read({
      id: searchKey,
      link: _this.byPart ? 'ByPartNumber' : 'ByBarcode',
    }, null, utils.safeCallback(join.add(), function(err, resp) {
      if (resp.Message && resp.Message !== "Success") {
        notify.error(resp, 2);
      }
      var item = resp.Value;
      if (!item) {
        notify.warn('', '', 5);
        return;
      }

      // load zone types
      load_equipmentAccountZoneTypes(item.EquipmentID, function(val) {
        _this.data.ZoneTypeCvm.setList(val);

        _this.data.setValue({
          // from item
          EquipmentId: item.EquipmentID,
          Points: item.Points,
          ActualPoints: item.ActualPoints,
          Price: item.RetailPrice,
          AccountZoneTypeId: item.AccountZoneTypeId,
          ItemSKU: item.GPItemNmbr,
          ItemDesc: item.ItemDescription,
          Comments: item.ItemDescription,
          // local data
          BarcodeId: _this.byPart ? null : searchKey,
          AccountId: _this.accountId,
          Zone: _this.nextZone,
          // defaults
          AccountEquipmentUpgradeTypeId: 'CUST',
          EquipmentLocationId: null,
          GPEmployeeId: null,
          IsExisting: false,
          IsServiceUpgrade: false,
          IsExistingWiring: false,
          IsMainPanel: false,
        });
        _this.data.markClean({}, true);
      }, join.add());
    }, utils.noop));
  }

  return EquipmentEditorViewModel;
});
