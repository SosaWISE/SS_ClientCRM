define('src/account/security/signalhistory.vm', [
  'moment',
  'ko',
  'src/slick/slickgrid.vm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  moment,
  ko,
  SlickGridViewModel,
  LayersViewModel,
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
          field: 'Equipment',
        }, {
          id: 'ZoneType',
          name: 'Zone Type',
          field: 'ZoneType',
        }, {
          id: 'Location',
          name: 'Location',
          field: 'Location',
        }, {
          id: 'Barcode',
          name: 'Barcode',
          field: 'Barcode',
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
      columns: [ //
        {
          id: 'SignalType',
          name: 'SignalType',
          field: 'SignalType',
        }, {
          id: 'EventDate',
          name: 'EventDate',
          field: 'EventDate',
        }, {
          id: 'TwoWayTest',
          name: 'TwoWayTest',
          field: 'TwoWayTest',
        }, {
          id: 'IndustryNumber',
          name: 'IndustryNumber',
          field: 'IndustryNumber',
        }, {
          id: 'ZoneNumber',
          name: 'ZoneNumber',
          field: 'ZoneNumber',
        }, {
          id: 'EventCode',
          name: 'EventCode',
          field: 'EventCode',
        }, {
          id: 'EventDetails',
          name: 'EventDetails',
          field: 'EventDetails',
        }, {
          id: 'Computed',
          name: 'Computed',
          field: 'Computed',
        },
      ],
    });

    _this.accountSignals = ko.observableArray();
    _this.missingSignals = ko.observableArray();
    _this.missingZones = ko.observableArray();


    //
    // events
    //
    _this.cmdSixMonthsHistory = ko.command(function(cb) {
      //LoadSignalHistory(DateTime.Now.Subtract(new TimeSpan(183, 0, 0, 0)));
      load_signalHistory(_this.historyGvm, moment().subtract('months', 6), cb);
      cb();
    }, function(busy) {
      return !busy && !_this.cmdFullHistory.busy();
    });
    _this.cmdFullHistory = ko.command(function(cb) {
      //LoadSignalHistory(new DateTime(2007, 1, 1));
      load_signalHistory(_this.historyGvm, null, cb);
      cb();
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
    // var _this = this;
    join = join;
    //@TODO: load real data
  };

  function load_signalHistory(gvm, from, cb) {
    //@TODO: load history
    gvm.list([]);
    setTimeout(function() {
      gvm.list([]);
      cb();
    }, 1000);
  }


  // private void CheckZonesSignals(EventSignalHistory oSignalHistory) {
  //   MissingSignals.Clear();
  //   MissingZones.Clear();
  //   //Add in Zones from Equipment
  //   foreach (int item in AccountModel.AccountEquipmentModel.ZoneList) {
  //     string formattedZone = string.Format("{0:000}", item);
  //     if (!oSignalHistory.HashZones.ContainsKey(formattedZone)) {
  //       oSignalHistory.HashZones.Add(formattedZone, item);
  //     }
  //   }
  //   // Build a list of missing signals
  //   foreach (DictionaryEntry zone in oSignalHistory.HashZones) {
  //     if (!oSignalHistory.HashSignals.ContainsKey(zone.Key)) {
  //       MissingSignals.Add(zone.Key.ToString());
  //     }
  //   }
  //   MissingSignals = new ObservableCollection<string>(MissingSignals.OrderBy(x => x));
  //   // Build a list of missing zones
  //   foreach (DictionaryEntry signal in oSignalHistory.HashSignals) {
  //     if (!oSignalHistory.HashZones.ContainsKey(signal.Key)) {
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
