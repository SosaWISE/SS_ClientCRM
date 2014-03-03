define('src/account/security/salesinfo.vm', [
  'src/account/security/parts.editor.vm',
  'src/config',
  'src/slick/buttonscolumn',
  'src/account/security/frequent.gvm',
  'src/account/security/salesinfo.gvm',
  'src/ukov',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko',
  'src/core/combo.vm',
], function(
  PartsEditorViewModel,
  config,
  ButtonsColumn,
  FrequentGridViewModel,
  SalesInfoGridViewModel,
  ukov,
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  var schema,
    regx = /^[0-9]+.[0-9][0-9]$/;

  schema = {
    _model: true,

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

  function SalesInfoViewModel(options) {
    var _this = this;
    SalesInfoViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

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
    _this.pointSystemsCvm = new ComboViewModel({
      fields: {
        text: 'TemplateName',
        value: 'InvoiceTemplateID',
      }
    });
    _this.cellularTypesCvm = new ComboViewModel({
      nullable: true,
      fields: {
        text: 'CellularTypeName',
        value: 'CellularTypeID',
      }
    });
    _this.alarmcomPacakgesCvm = new ComboViewModel({
      fields: {
        text: 'PackageName',
        value: 'AlarmComPackageID',
      }
    });
    _this.contractLengthsCvm = new ComboViewModel({
      fields: {
        text: 'ContractName',
        value: 'ContractTemplateID',
      }
    });
    _this.title = ko.observable(_this.title);

    _this.frequentGrid = new FrequentGridViewModel({
      addPart: function(part) {
        showPartsEditor(_this, true, part.ItemSKU, null);
      },
    });
    _this.partsGrid = new SalesInfoGridViewModel({
      deletePart: function(part) {
        dataservice.invoicesrv.invoiceItems.read({ //@TODO: change this from a GET to a DELETE
          id: part.InvoiceItemID,
          link: '/Delete',
        }, null, null, utils.safeCallback(null, function(err, resp) {
          if (resp.Value) {
            _this.refreshInvoice();
          }
        }, function(err) {
          notify.notify('error', err.Message);
        }));
      },
    });

    _this.pointsAvailable = ko.observable(0);

    _this.pointSystemsCvm.selectedValue.subscribe(function(psValue) {
      _this.contractLengthsCvm.setList([]);
      dataservice.salessummary.contractLengthsGet.read({
        id: psValue,
      }, null, utils.safeCallback(null, function(err, resp) {
        // only set cl if same as current selected psValue
        if (_this.pointSystemsCvm.selectedValue() === psValue) {
          _this.contractLengthsCvm.setList(resp.Value);
        }
      }, function(err) {
        notify.notify('error', err.Message);
      }));
    });
    _this.activationFeeActual.subscribe(function(newValue) {
      console.log("New Activation Fee: ", newValue);
      _this.refreshInvoice();
    });
    _this.cellularTypesCvm.selectedValue.subscribe(function(newValue) {
      console.log("New Cellular Type:", newValue);
      _this.refreshInvoice();
    });
    _this.over3Months.subscribe(function(newValue) {
      console.log("New Over 3 Months: ", newValue);
      _this.refreshInvoice();
    });
    _this.alarmcomPacakgesCvm.selectedValue.subscribe(function(newValue) {
      console.log("AlarmComPackage: ", newValue);
      _this.refreshInvoice();
    });
    _this.monthlyMonitoringRateActual.subscribe(function(newValue) {
      console.log("MMR: ", newValue);
      _this.refreshInvoice();
    });



    //
    // events
    //
    _this.refreshInvoice = function(cb) {
      /** Check that the form has loaded. */
      if (_this.finishedLoading) {
        dataservice.salessummary.invoiceRefresh.save({
          data: {
            InvoiceID: _this.invoiceID,
            AccountId: _this.msAccountId,
            ActivationFee: _this.activationFee(),
            ActivationFeeItemId: _this.activationFeeItemId,
            ActivationFeeActual: _this.activationFeeActual(),
            MonthlyMonitoringRate: _this.monthlyMonitoringRate(),
            MonthlyMonitoringRateItemId: _this.monthlyMonitoringRateItemId,
            MonthlyMonitoringRateActual: _this.monthlyMonitoringRateActual(),
            CellTypeId: _this.cellularTypesCvm.selectedValue(),
            Over3Months: _this.over3Months(),
            AlarmComPackageId: _this.alarmcomPacakgesCvm.selectedValue(),
            DealerId: config.user().DealerId,
          },
        }, null, utils.safeCallback(cb, function(err, resp) {
          console.log("Response: ", resp);
          _this.partsGrid.list(resp.Value.Items);
        }, function(err) {
          notify.notify('error', err.Message);
        }));
      }
    };
    _this.cmdAddByPart = ko.command(function(cb) {
      showPartsEditor(_this, true, null, cb);
    });
    _this.cmdAddByBarcode = ko.command(function(cb) {
      showPartsEditor(_this, false, null, cb);
    });
  }
  utils.inherits(SalesInfoViewModel, ControllerViewModel);
  SalesInfoViewModel.prototype.viewTmpl = 'tmpl-security-salesinfo';

  SalesInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    _this.msAccountId = routeData.id;

    load_invoice(_this, function() {
      load_vendorAlarmcomPacakges(_this.alarmcomPacakgesCvm, join.add());
      load_pointSystems(_this.pointSystemsCvm, join.add());
      load_cellularTypes(_this.cellularTypesCvm, join.add());
      load_frequentlyInstalledEquipmentGet(_this.frequentGrid, join.add());

      /** Refresh the invoice. */
      _this.refreshInvoice();

      cb();
    });
  };

  function load_invoice(_this, cb) {
    dataservice.salessummary.invoiceMsIsntalls.read({
      id: _this.msAccountId,
      link: 'accountid'
    }, null, utils.safeCallback(cb, function(err, resp) {
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
    }, function(err) {
      notify.notify('error', err.Message);
    }));
  }

  function load_pointSystems(comboVM, cb) {
    // ** Pull pointSystems
    dataservice.salessummary.pointSystems.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data
      comboVM.setList(resp.Value);
      comboVM.selectItem(comboVM.list()[0]);
    }, utils.no_op));
  }

  function load_cellularTypes(comboVM, cb) {
    // ** Pull Cellular Types
    dataservice.salessummary.cellularTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data
      comboVM.setList(resp.Value);
    }, utils.no_op));
  }

  function load_vendorAlarmcomPacakges(comboVM, cb) {
    // ** Pull alarm.com packages
    dataservice.salessummary.vendorAlarmcomPacakges.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind Data
      comboVM.setList(resp.Value);
    }, utils.no_op));
  }

  function load_frequentlyInstalledEquipmentGet(gridVM, cb) {
    // ** Pull data
    dataservice.salessummary.frequentlyInstalledEquipmentGet.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data to table
      gridVM.list(resp.Value || []);
    }, utils.no_op));
  }

  function showPartsEditor(_this, byPart, id, cb) {
    _this.layersVm.show(createPartsEditor(_this, byPart, id), createPartsEditorCb(_this, cb));
  }

  function createPartsEditor(_this, byPart, id) {
    return new PartsEditorViewModel({
      byPart: byPart,
      itemSku: byPart ? id : null,
      barcode: !byPart ? id : null,
      invoiceID: _this.invoiceID,
      //@TODO: get real salesman and technician
      salesman: {
        id: 'SALS001',
        name: 'SALS001',
      },
      // technician: {
      //   id: 'FRANK002',
      //   name: 'Frank',
      // },
    });
  }

  function createPartsEditorCb(_this, cb) {
    return function(result) {
      if (result && result.Items) {
        _this.partsGrid.list(result.Items);
      }
      if (utils.isFunc(cb)) {
        cb();
      }
    };
  }

  return SalesInfoViewModel;
});
