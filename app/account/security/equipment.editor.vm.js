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
    AccountId: {},
    ItemId: {},
    ItemDesc: {},

    AccountEquipmentID: {},
    Zone: {
      converter: strConverter,
    },
    ZoneEventType: {},
    //ItemLocation: {},
<<<<<<< HEAD
    EquipmentLocationID:{},
=======
    EquipmentLocationId: {},
>>>>>>> dc83dc39d8b16fdc53f3adcb6a1c20082e8d5933
    AccountZoneTypeId: {},
    //AssignTo: {},
    AccountZoneAssignmentID: {},
    //IsUpgrade: {},
    AccountEquipmentUpgradeTypeId: {},
    //UpgradePrice: {
    //converter: ukov.converters.number(2),
    //},
    Price: {
      converter: ukov.converters.number(2),
    },
    IsExistingWiring: {},
    //MainPanel: {},
    IsMainPanel: {},
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
      AccountId: null,
      ItemId: null,
      ItemDesc: null,
      AccountEquipmentID: null,
      Zone: '',
      ZoneEventType: null,
      //ItemLocation: null,
<<<<<<< HEAD
      EquipmentLocationID:null,
=======
      EquipmentLocationId: null,
>>>>>>> dc83dc39d8b16fdc53f3adcb6a1c20082e8d5933
      AccountZoneTypeId: null,
      //AssignTo: null,
      AccountZoneAssignmentID: null,
      //IsUpgrade: null,
      AccountEquipmentUpgradeTypeId: null,
      //UpgradePrice: '',
      Price: '',
      IsExistingWiring: null,
      //MainPanel: null,
      IsMainPanel: null,
    }, schema);

    _this.data.ZoneEventTypeCvm = new ComboViewModel({
      selectedValue: _this.data.ZoneEventType,
      fields: {
        value: 'ZoneEventTypeID',
        text: 'Descrption',
      },
    });
    _this.data.EquipmentLocationCvm = new ComboViewModel({
      selectedValue: _this.data.EquipmentLocationID,
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
      //selectedValue: _this.data.AssignTo,
      selectedValue: _this.data.AccountZoneAssignmentID,
      nullable: true,
      list: [ //
        {
          value: 1,
          text: '1',
        }, {
          value: 2,
          text: '2',
        },
      ],
    });
    _this.data.IsUpgradeCvm = new ComboViewModel({
      //  selectedValue: _this.data.IsUpgrade,
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
      closeLayer(null);
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy();
    });
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.layer) {
        cb();
        return;
      }
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      //alert(JSON.stringify(model));
      _this.data.markClean(model, true);
      dataservice.msaccountsetupsrv.equipments.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.layer.close(resp.Value, false);
      }, function(err) {
        notify.notify('error', 'Error', err.Message);
      }));
    });



    _this.cmdSearch = ko.command(function(cb) {
      search(cb);
    });


    //Initially set Item name and part# labels
    _this.itemName = ko.observable();
    _this.partNumber = ko.observable();


    //@TODO: search for barcode/part#
    //         "MsAccountSetupSrv/Equipments/" + equipment1 + "/ByPartNumber?id=" + accountValue.AccountID + "&tId=SOSA001",

    //trying to implement search function - i am not sure if this is the right place for
    //search function reagan 05/22/2014

    function search(cb) {
      var searchKey = _this.searchKey.getValue();
      //console.log(searchKey);
      //console.log(_this.data);
      console.log("accountId:" + _this.accountId);

      console.log("tId:" + _this.tId);

      //For now, do search only by part#
      dataservice.msaccountsetupsrv.equipments.read({
        id: searchKey,
        link: 'ByPartNumber',
        query: {
          id: _this.accountId,
          //id: '150923',
          tid: _this.tId
        }
      }, null, utils.safeCallback(cb, function(err, resp) {

        //alert(JSON.stringify(resp.Value));

        //Set Item Name and Part# to UI
        _this.itemName(resp.Value.ItemDesc);
        _this.partNumber(searchKey);

        _this.data.setValue(resp.Value);


      }, function(err) {

        notify.notify('error', 'Error', err.Message);
      }));


    }






    //@TODO: get real values for AssignToCvm
    //@TODO:

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
  //CUST  Customer
  //SALESREP  Sales Rep
  //TECH  Technician
  //commented by reagan/junryl match upgrade type from crm db
  EquipmentEditorViewModel.prototype.isUpgradeOptions = [ //
    {
      value: null,
      text: 'null',
    }, {
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

  EquipmentEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    load_zoneEventTypes(_this.data.ZoneEventTypeCvm, _this.monitoringStationOS, join.add());
    load_accountZoneTypes(_this.data.ZoneTypeCvm, _this.monitoringStationOS, join.add());
    load_equipmentLocation(_this.data.EquipmentLocationCvm, _this.monitoringStationOS, join.add());
    
  };

  function load_zoneEventTypes(cvm, monitoringStationOS, cb) {
    readMonitoringStationOS(cvm, monitoringStationOS, 'zoneEventTypes', {
      'equipmentTypeId': 1,
    }, cb);
  }

  function load_accountZoneTypes(cvm, monitoringStationOS, cb) {
    readMonitoringStationOS(cvm, monitoringStationOS, 'accountZoneTypes', {}, cb);
  }

  function load_equipmentLocation(cvm, monitoringStationOS, cb) {
    readMonitoringStationOS(cvm, monitoringStationOS, 'EquipmentLocations', {}, cb);
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

  return EquipmentEditorViewModel;
});
