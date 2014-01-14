define('src/account/vm.salesinfo', [
  'src/slick/buttonscolumn',
  'src/slick/vm.slickgrid',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko',
  'src/core/vm.combo',
], function(
  ButtonsColumn,
  SlickGridViewModel,
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  function SalesInfoViewModel(options) {
    var _this = this;
    SalesInfoViewModel.super_.call(_this, options);

    // ** Fields
    _this.activationFee = ko.observable();
    _this.activationFeeActual = ko.observable();
    _this.over3Months = ko.observable(false);
    _this.over3MonthsAction = function() {
      console.log("Activation over 3 months: ", _this.over3Months());
      return true;
    };
    _this.monthlyMonitoringRate = ko.observable();
    _this.monthlyMonitoringRateActual = ko.observable();
    _this.psComboVM = new ComboViewModel({
      fields: {
        text: 'TemplateName',
        value: 'InvoiceTemplateID',
      }
    });
    _this.ctComboVM = new ComboViewModel({
      nullable: true,
      fields: {
        text: 'CellularTypeName',
        value: 'CellularTypeID',
      }
    });
    _this.apckComboVM = new ComboViewModel({
      fields: {
        text: 'PackageName',
        value: 'AlarmComPackageID',
      }
    });
    _this.clComboVM = new ComboViewModel({
      fields: {
        text: 'ContractName',
        value: 'ContractTemplateID',
      }
    });
    _this.title = ko.observable(_this.title);

    _this.frequentGrid = new SlickGridViewModel({
      options: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [
        {
          id: 'item',
          name: 'Item',
          field: 'ItemSKU',
        },
        {
          id: 'description',
          name: 'Description',
          field: 'ItemDesc',
        },
        {
          id: 'price',
          name: 'Price',
          field: 'Cost',
          formatter: SlickGridViewModel.formatters.currency,
        },
        {
          id: 'points',
          name: 'Points',
          field: 'SystemPoints',
          formatter: SlickGridViewModel.formatters.likecurrency,
        },
        new ButtonsColumn({
          id: 'actions',
          name: 'Actions',
          buttons: [
            {
              text: 'Add',
              fn: function(item) {
                alert('add ' + JSON.stringify(item));
              },
            },
          ]
        }),
      ],
    });
    // while (_this.frequentGrid.list().length < 19) {
    //   _this.frequentGrid.list().push({
    //     ItemSKU: 'Item ' + _this.frequentGrid.list().length,
    //     ItemDesc: 'Description ' + _this.frequentGrid.list().length,
    //     Cost: _this.frequentGrid.list().length * -1.23,
    //     SystemPoints: _this.frequentGrid.list().length - 4,
    //   });
    // }

    _this.partsGrid = new SlickGridViewModel({
      options: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [
        {
          id: 'description',
          name: 'Description',
          field: 'ItemDesc',
          width: 200,
        },
        {
          id: 'price',
          name: 'Price',
          field: 'Cost',
          formatter: SlickGridViewModel.formatters.currency,
        },
        {
          id: 'points',
          name: 'Points',
          field: 'SystemPoints',
          formatter: SlickGridViewModel.formatters.likecurrency,
        },
        {
          id: 'total',
          name: 'Total',
          field: 'Total',
          formatter: SlickGridViewModel.formatters.currency,
        },
        new ButtonsColumn({
          id: 'actions',
          name: 'Actions',
          buttons: [
            {
              text: 'Del',
              fn: function(item) {
                alert('delete ' + JSON.stringify(item));
              },
            },
          ]
        }),
      ],
      list: [
        {
          ItemDesc: 'Simon XT (234422)',
          Cost: 189.99,
          SystemPoints: 4.0,
          Total: 189.99,
        },
        {
          ItemDesc: 'Free Panel (234422)',
          Cost: -189.99,
          SystemPoints: -4.0,
          Total: 189.99,
        },
        {
          ItemDesc: 'Simon XT (234422)',
          Cost: 189.99,
          SystemPoints: 4.0,
          Total: 189.99,
        },
        {
          ItemDesc: 'Free Panel (234422)',
          Cost: -189.99,
          SystemPoints: -4.0,
          Total: 189.99,
        },
      ],
    });

    _this.psComboVM.selectedValue.subscribe(function(psValue) {
      _this.clComboVM.setList([]);
      dataservice.salessummary.contractlengthsget.read({
        id: psValue,
      }, null, function(err, resp) {
        utils.safeCallback(err, function() {
          // only set cl if same as current selected psValue
          if (_this.psComboVM.selectedValue() === psValue) {
            _this.clComboVM.setList(resp.Value);
          }
        }, function(err) {
          if (err) {
            notify.notify('error', err.Message);
          }
        });
      });
    });
    _this.activationFeeActual.subscribe(function(newValue) {
      console.log("New Activation Fee: ", newValue);
    });
    _this.monthlyMonitoringRate.subscribe(function(newValue) {
      console.log("MMR: ", newValue);
    });

    //
    // events
    //
  }
  utils.inherits(SalesInfoViewModel, ControllerViewModel);
  SalesInfoViewModel.prototype.viewTmpl = 'tmpl-salesinfo';

  SalesInfoViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;
    load_activationFee(_this, join.add());
    load_monthlyMonitoringRate(_this, join.add());
    load_pointsystems(_this.psComboVM, join.add());
    load_cellulartypes(_this.ctComboVM, join.add());
    load_vendoralarmcompacakges(_this.apckComboVM, join.add());
    load_frequentlyinstalledequipmentget(_this.frequentGrid, join.add());
  };

  function refreshInvoice(){}

  function load_activationFee(_this, cb) {
    _this.activationFee(199.00);
    _this.activationFeeActual(199.00);
    cb();
  }

  function load_monthlyMonitoringRate(_this, cb) {
    _this.monthlyMonitoringRate(39.95);
    _this.monthlyMonitoringRateActual(39.95);
    cb();
  }

  function load_pointsystems(comboVM, cb) {
    // ** Pull pointsystems
    dataservice.salessummary.pointsystems.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        comboVM.setList(resp.Value);
        comboVM.selectItem(comboVM.list()[0]);
      }, cb);
    });
  }

  function load_cellulartypes(comboVM, cb) {
    // ** Pull Cellular Types
    dataservice.salessummary.cellulartypes.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data
        comboVM.setList(resp.Value);
      }, cb);
    });
  }

  function load_vendoralarmcompacakges(comboVM, cb) {
    // ** Pull alarm.com packages
    dataservice.salessummary.vendoralarmcompacakges.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind Data
        comboVM.setList(resp.Value);
      }, cb);
    });
  }

  function load_frequentlyinstalledequipmentget(gridVM, cb) {
    // ** Pull data
    dataservice.salessummary.frequentlyinstalledequipmentget.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        // ** Bind data to table
        gridVM.list(resp.Value || []);
      }, cb);
    });
  }

  return SalesInfoViewModel;
});
