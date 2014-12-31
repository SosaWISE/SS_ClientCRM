define('src/account/security/signalhistory.vm', [
  'src/account/security/securityhelper',
  'src/dataservice',
  'moment',
  'ko',
  'src/slick/slickgrid.vm',
  'src/core/layers.vm',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  securityhelper,
  dataservice,
  moment,
  ko,
  SlickGridViewModel,
  LayersViewModel,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SignalHistoryViewModel(options) {
    var _this = this;
    SignalHistoryViewModel.super_.call(_this, options);

    _this.layersVm = _this.layersVm || new LayersViewModel({
      controller: _this,
    });

    _this.equipmentGvm = new SlickGridViewModel({
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [ //
        {
          id: 'Zone',
          name: 'Zone',
          field: 'Zone',
        }, {
          id: 'Equipment',
          name: 'Equipment',
          field: 'ItemDesc',
        }, {
          id: 'ZoneType',
          name: 'Zone Type',
          field: 'AccountZoneType',
        }, {
          id: 'Location',
          name: 'Location',
          field: 'EquipmentLocationDesc',
        }, {
          id: 'Barcode',
          name: 'Barcode',
          field: 'BarcodeId',
        },
      ],
    });

    _this.historyGvm = new SlickGridViewModel({
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      // columns: [ //
      //   {
      //     id: 'SignalType',
      //     name: 'SignalType',
      //     field: 'SignalType',
      //   }, {
      //     id: 'EventDate',
      //     name: 'EventDate',
      //     field: 'EventDate',
      //   }, {
      //     id: 'TwoWayTest',
      //     name: 'TwoWayTest',
      //     field: 'TwoWayTest',
      //   }, {
      //     id: 'IndustryNumber',
      //     name: 'IndustryNumber',
      //     field: 'IndustryNumber',
      //   }, {
      //     id: 'ZoneNumber',
      //     name: 'ZoneNumber',
      //     field: 'ZoneNumber',
      //   }, {
      //     id: 'EventCode',
      //     name: 'EventCode',
      //     field: 'EventCode',
      //   }, {
      //     id: 'EventDetails',
      //     name: 'EventDetails',
      //     field: 'EventDetails',
      //   }, {
      //     id: 'Computed',
      //     name: 'Computed',
      //     field: 'Computed',
      //   },
      // ],
      columns: [ //
        {
          id: 'UTCDate',
          name: 'Date',
          field: 'UTCDate',
          formatter: SlickGridViewModel.formatters.datetime,
        }, {
          id: 'Point',
          name: 'Zone',
          field: 'Point',
          width: 30,
          formatter: function(row, cell, value) {
            return securityhelper.zoneString(value);
          },
        }, {
          id: 'TransmitterCode',
          name: 'Csid',
          field: 'TransmitterCode',
          width: 30,
        }, {
          id: 'SiteName',
          name: 'Site Name',
          field: 'SiteName',
        }, {
          id: 'SignalCode',
          name: 'SignalCode',
          field: 'SignalCode',
        }, {
          id: 'EventCode',
          name: 'Event',
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return strings.format('{0} - {1}', dataCtx.EventCode, dataCtx.EventCodeDescription);
          },
        }, {
          id: 'OpAct',
          name: 'OpAct',
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return strings.format('{0} - {1}', dataCtx.OpAct, dataCtx.OpActDescription);
          },
        }, {
          id: 'PointDescription',
          name: 'PointDescription',
          field: 'PointDescription',
        }, {
          id: 'Comment',
          name: 'Comment',
          field: 'Comment',
        }, {
          id: 'AlarmNum',
          name: 'AlarmNum',
          field: 'AlarmNum',
          width: 60,
        }, {
          id: 'TestNum',
          name: 'TestNum',
          field: 'TestNum',
          width: 30,
        }, {
          id: 'Phone',
          name: 'Phone',
          field: 'Phone',
          width: 60,
          formatter: SlickGridViewModel.formatters.phone,
        }, {
          id: 'FullClearFlag',
          name: 'Full Clear',
          field: 'FullClearFlag',
          width: 30,
        }, {
          id: 'UserId',
          name: 'UserId',
          field: 'UserId',
          width: 30,
        },
        // {
        //   id: 'UserName',
        //   name: 'UserName',
        //   field: 'UserName',
        // },
        {
          id: 'RawMessage',
          name: 'RawMessage',
          field: 'RawMessage',
          width: 30,
        },
        // {
        //   id: 'Latitude',
        //   name: 'Latitude',
        //   field: 'Latitude',
        // }, {
        //   id: 'Longitude',
        //   name: 'Longitude',
        //   field: 'Longitude',
        // },
      ],
    });

    // _this.accountSignals = ko.observableArray();
    _this.missingSignals = ko.observableArray();
    _this.missingZones = ko.observableArray();


    //
    // events
    //
    _this.cmdSixMonthsHistory = ko.command(function(cb) {
      _this.refresh(180, cb);
    }, function(busy) {
      return !busy && !_this.cmdFullHistory.busy();
    });
    _this.cmdFullHistory = ko.command(function(cb) {
      _this.refresh(-1, cb);
    }, function(busy) {
      return !busy && !_this.cmdSixMonthsHistory.busy();
    });

    // public EquipmentViewModel EquipmentVM { get; private set; }
    //
    // private void PullSixMonthHistory()
    //   LoadSignalHistory(DateTime.Now.Subtract(new TimeSpan(183, 0, 0, 0)));
    // private void PullFullHistory()
    //   LoadSignalHistory(new DateTime(2007, 1, 1));
  }
  utils.inherits(SignalHistoryViewModel, ControllerViewModel);
  SignalHistoryViewModel.prototype.viewTmpl = 'tmpl-security-signalhistory';

  SignalHistoryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.accountId = routeData.id;

    load_equipment(_this.equipmentGvm, _this.accountId, join.add());
  };

  SignalHistoryViewModel.prototype.refresh = function(days, cb) {
    var _this = this;

    // clear missing
    _this.missingSignals([]);
    _this.missingZones([]);

    load_signalHistory(_this.accountId, days, _this.historyGvm, function(err) {
      if (!err) {
        refreshMissing(_this.historyGvm.list(), _this.equipmentGvm.list(), _this.missingSignals, _this.missingZones);
      }
      cb();
    });
  };

  function load_equipment(gvm, accountId, cb) {
    gvm.list([]);
    dataservice.msaccountsetupsrv.accounts.read({
      id: accountId,
      link: 'equipment',
    }, gvm.list, cb);
  }

  function load_signalHistory(id, days, gvm, cb) {
    gvm.list([]);
    dataservice.monitoringstationsrv.msAccounts.read({
      id: id,
      link: 'signalhistory',
      query: {
        days: days,
      },
    }, gvm.list, utils.safeCallback(cb, notify.iferror));
  }

  function refreshMissing(signalHistoryList, equipmentList, setMissingSignals, setMissingZones) {
    setMissingSignals = setMissingSignals;

    var signalHistoryZonesMap = {},
      equipmentZonesMap = {},
      missingList;

    // create map of all zones in history
    signalHistoryList.forEach(function(item) {
      var zone = securityhelper.zoneString(item.Point);
      if (zone && !signalHistoryZonesMap[zone]) {
        signalHistoryZonesMap[zone] = true;
      }
    });
    // create map of all zones in equipment
    equipmentList.forEach(function(item) {
      var zone = securityhelper.zoneString(item.Zone);
      if (zone && !equipmentZonesMap[zone]) {
        equipmentZonesMap[zone] = true;
      }
    });

    // build a list of missing signals
    missingList = [];
    Object.keys(equipmentZonesMap).forEach(function(zone) {
      if (!signalHistoryZonesMap[zone]) {
        missingList.push(zone);
      }
    });
    missingList.sort();
    setMissingSignals(missingList);

    // build a list of missing zones
    missingList = [];
    Object.keys(signalHistoryZonesMap).forEach(function(zone) {
      if (!equipmentZonesMap[zone]) {
        missingList.push(zone);
      }
    });
    missingList.sort();
    setMissingZones(missingList);
  }

  // private void CheckZonesSignals(EventSignalHistory oSignalHistory) {
  //   MissingSignals.Clear();
  //   MissingZones.Clear();
  //   //Add in Zones from Equipment
  //   foreach (int item in AccountModel.AccountEquipmentModel.ZoneList) {
  //     string formattedZone = string.Format("{0:000}", item);
  //     if (!equipmentZonesMap.ContainsKey(formattedZone)) {
  //       equipmentZonesMap.Add(formattedZone, item);
  //     }
  //   }
  //   // Build a list of missing signals
  //   foreach (DictionaryEntry zone in equipmentZonesMap) {
  //     if (!signalHistoryZonesMap.ContainsKey(zone.Key)) {
  //       MissingSignals.Add(zone.Key.ToString());
  //     }
  //   }
  //   MissingSignals = new ObservableCollection<string>(MissingSignals.OrderBy(x => x));
  //   // Build a list of missing zones
  //   foreach (DictionaryEntry signal in signalHistoryZonesMap) {
  //     if (!equipmentZonesMap.ContainsKey(signal.Key)) {
  //       //If State is in TX then don't add the missing Zone
  //       if ((int)AccountModel.Account.PremiseAddress.StateID != 132) {
  //         MissingZones.Add(signal.Key.ToString());
  //       }
  //       else {
  //         if (AccountModel.Account.PanelAccountInventory != null) {
  //           List<string> defaultZones = EquipmentHelper.GetDefaultZonesForPanelType((int)AccountModel.Account.PanelAccountInventory.Equipment.EquipmentPanelTypeId);
  //           if (!defaultZones.Contains((string)signal.Key)) {
  //             MissingZones.Add(signal.Key.ToString());
  //           }
  //         }
  //         else {
  //           MissingZones.Add(signal.Key.ToString());
  //         }
  //       }
  //     }
  //   }
  //   MissingZones = new ObservableCollection<string>(MissingZones.OrderBy(x => x));
  // }

  return SignalHistoryViewModel;
});
