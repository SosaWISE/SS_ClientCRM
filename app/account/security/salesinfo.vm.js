define('src/account/security/salesinfo.vm', [
  'src/slick/buttonscolumn',
  'src/slick/slickgrid.vm',
  'src/ukov',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko',
  'src/core/combo.vm',
], function(
  ButtonsColumn,
  SlickGridViewModel,
  ukov,
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  function SalesInfoViewModel(options) {
    var _this = this,
      regx = /^[0-9]+.[0-9][0-9]$/,
      schema = {
        moddel: true,
        ActivationFee: {},
        ActivationFeeActual: {
          converter: ukov.converters.string(),
          validators: [
            ukov.validators.isRequired('Activation Fee is Required'),
            function(val) {
              if (!regx.test(val)) {
                return "Invalid value for activation fee.";
              }
            }
          ]
        }
      };
    SalesInfoViewModel.super_.call(_this, options);

    // ** Fields
    _this.finishedLoading = false;
    _this.activationFee = ko.observable();
    _this.activationFeeItemId = '';
    _this.activationFeeActual = ko.observable();
    _this.over3Months = ko.observable(false);
    _this.over3MonthsAction = function() {
      //console.log("Activation over 3 months: ", _this.over3Months());
      return true;
    };
    _this.monthlyMonitoringRate = ko.observable();
    _this.monthlyMonitoringRateItemId = '';
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
          field: 'RetailPrice',
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
      _this.refreshInvoice();
    });
    _this.monthlyMonitoringRateActual.subscribe(function(newValue) {
      console.log("MMR: ", newValue);
      _this.refreshInvoice();
    });


    _this.refreshInvoice = function() {
      /** Check that the form has loaded. */
      if (_this.finishedLoading) {
        /** Initialize. */
        _this.sData = ukov.wrap({
          InvoiceID: _this.invoiceID,
          AccountId: _this.msAccountId,
          ActivationFee: _this.activationFee(),
          ActivationFeeItemId: _this.activationFeeItemId,
          ActivationFeeActual: _this.activationFeeActual(),
          MonthlyMonitoringRate: _this.monthlyMonitoringRate(),
          MonthlyMonitoringRateItemId: _this.monthlyMonitoringRateItemId,
          MonthlyMonitoringRateActual: _this.monthlyMonitoringRateActual(),
          AlarmComPackage: _this.apckComboVM.selectedValue(),
          Over3Months: _this.over3Months(),
        }, schema);

        dataservice.salessummary.invoicerefresh.save(_this.sData.model.root, null, function(err, resp) {
          if (err) {
            notify.notify('error', err.Message);
          } else {
            console.log("Response: ", resp);
            _this.partsGrid.list(resp.Value.Items);
          }
        });
      }
    };

    //
    // events
    //
  }
  utils.inherits(SalesInfoViewModel, ControllerViewModel);
  SalesInfoViewModel.prototype.viewTmpl = 'tmpl-security-salesinfo';

  SalesInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    _this.msAccountId = routeData.id;

    load_invoice(_this, function() {
      load_vendoralarmcompacakges(_this.apckComboVM, join.add());
      load_pointsystems(_this.psComboVM, join.add());
      load_cellulartypes(_this.ctComboVM, join.add());
      load_frequentlyinstalledequipmentget(_this.frequentGrid, join.add());

      /** Refresh the invoice. */
      _this.refreshInvoice();

      cb();
    });
  };

  function load_invoice(_this, cb) {
    dataservice.salessummary.invoicemsisntalls.read({
      id: _this.msAccountId,
      link: 'accountid'
    }, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      if (resp.Value) {
        console.log(resp.Value);
        _this.invoiceID = resp.Value.InvoiceID;
        _this.activationFee(resp.Value.ActivationFee);
        _this.activationFeeActual(resp.Value.ActivationFeeActual);
        _this.activationFeeItemId = resp.Value.ActivationFeeItemId;
        _this.monthlyMonitoringRate(resp.Value.MonthlyMonitoringRate);
        _this.monthlyMonitoringRateActual(resp.Value.MonthlyMonitoringRateActual);
        _this.monthlyMonitoringRateItemId = resp.Value.MonthlyMonitoringRateItemId;

        /** Allow for refreshing. */
        _this.finishedLoading = true;
      }
      cb();
    });
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
