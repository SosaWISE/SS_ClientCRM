define('src/account/security/clist.salesinfo.vm', [
  'underscore',
  'src/account/security/parts.editor.vm',
  'src/config',
  'src/slick/buttonscolumn',
  'src/account/security/frequent.gvm',
  'src/account/security/clist.salesinfo.gvm',
  'src/ukov',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko',
  'src/core/combo.vm',
], function(
  underscore,
  PartsEditorViewModel,
  config,
  ButtonsColumn,
  FrequentGridViewModel,
  CListSalesInfoGridViewModel,
  ukov,
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    DealerId: {},
    AccountId: {},
    ActivationFee: {},
    ActivationFeeActual: {
      converter: ukov.converters.number(2, 'Invalid activation fee'),
      validators: [
        ukov.validators.isRequired('Activation Fee is Required'),
      ]
    },
    ActivationFeeItemId: {},
    AlarmComPackageId: {},
    PanelTypeId: {},
    CellularTypeId: {},
    ContractTemplateId: {},
    InvoiceID: {},
    MonthlyMonitoringRate: {},
    MonthlyMonitoringRateActual: {
      converter: ukov.converters.number(2, 'Invalid monthly monitoring rate'),
    },
    MonthlyMonitoringRateItemId: {},
    Over3Months: {},
  };

  function CListSalesInfoViewModel(options) {
    var _this = this;
    CListSalesInfoViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.title = ko.observable(_this.title);
    _this.data = ukov.wrap({
      DealerId: config.user().DealerId,
    }, schema);
    _this.data.PanelTypeCvm = new ComboViewModel({
      selectedValue: _this.data.PanelTypeId,
      nullable: true,
      fields: {
        text: 'PanelTypeName',
        value: 'PanelTypeID',
      }
    });
    _this.data.CellularTypeCvm = new ComboViewModel({
      selectedValue: _this.data.CellularTypeId,
      nullable: true,
      fields: {
        text: 'CellularTypeName',
        value: 'CellularTypeID',
      }
    });
    _this.data.AlarmComPackageCvm = new ComboViewModel({
      selectedValue: _this.data.AlarmComPackageId,
      fields: {
        text: 'PackageName',
        value: 'AlarmComPackageID',
      }
    });

    _this.pointSystemsCvm = new ComboViewModel({
      fields: {
        text: 'TemplateName',
        value: 'InvoiceTemplateID',
      }
    });
    _this.contractLengthsCvm = new ComboViewModel({
      fields: {
        text: 'ContractName',
        value: 'ContractTemplateID',
      }
    });

    _this.frequentGvm = new FrequentGridViewModel({
      addPart: function(part) {
        showPartsEditor(_this, true, part.ItemSKU, null);
      },
    });
    _this.partsGvm = new CListSalesInfoGridViewModel({
      deletePart: function(part) {
        dataservice.invoicesrv.invoiceItems.del(part.InvoiceItemID, null, utils.safeCallback(null, function(err, resp) {
          if (resp.Value) {
            _this.refreshInvoice();
          }
        }, function(err) {
          notify.notify('error', err.Message);
        }));
      },
    });

    _this.pointsAvailable = ko.computed(function() {
      var item = _this.pointSystemsCvm.selectedItem();
      if (item) {
        return item.SystemPoints - _this.partsGvm.pointsGiven();
      } else {
        return 0;
      }
    });

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


    //
    // events
    //
    _this.refreshInvoice = function(cb) {
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), 7);
        return;
      }

      var data = _this.data.getValue();
      data.CellTypeId = data.CellularTypeId; //@HACK: to save CellularTypeId
      if (underscore.isEqual(_this.currData, data)) {
        // no need to re-save the same data
        return;
      }
      _this.currData = data;
      _this.data.markClean(data, true);

      // console.log("refreshInvoice");
      dataservice.salessummary.invoiceRefresh.save({
        data: data,
      }, null, utils.safeCallback(cb, function(err, resp) {
        // make sure this is the last response
        if (_this.currData === data) {
          // console.log("Response: ", resp);
          _this.partsGvm.list(resp.Value.Items);
        }
      }, function(err) {
        notify.notify('error', err.Message);
      }));
    };
    _this.cmdAddByPart = ko.command(function(cb) {
      showPartsEditor(_this, true, null, cb);
    });
    _this.cmdAddByBarcode = ko.command(function(cb) {
      showPartsEditor(_this, false, null, cb);
    });
  }
  utils.inherits(CListSalesInfoViewModel, ControllerViewModel);
  CListSalesInfoViewModel.prototype.viewTmpl = 'tmpl-security-clist_salesinfo';

  CListSalesInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      subjoin = join.create(),
      refreshInvoiceCb = join.add();

    _this.data.AccountId(routeData.id);

    load_invoice(_this.data, subjoin.add());
    load_vendorAlarmComPackages(_this.data.AlarmComPackageCvm, subjoin.add());
    load_pointSystems(_this.pointSystemsCvm, subjoin.add());
    load_panelTypes(_this.data.PanelTypeCvm, subjoin.add());
    load_cellularTypes(_this.data.CellularTypeCvm, subjoin.add());
    load_frequentlyInstalledEquipmentGet(_this.frequentGvm, subjoin.add());

    subjoin.when(function(err) {
      if (err) {
        refreshInvoiceCb();
        return;
      }
      //@REVIEW: why is the invoice being refreshed after it was just loaded???? possibly for new invoices???
      /** Refresh the invoice. */
      _this.refreshInvoice(refreshInvoiceCb);

      // subscribe to updates after everyting has been set
      _this.data.ActivationFeeActual.subscribe(_this.refreshInvoice);
      _this.data.PanelTypeId.subscribe(_this.refreshInvoice);
      _this.data.CellularTypeId.subscribe(_this.refreshInvoice);
      _this.data.Over3Months.subscribe(_this.refreshInvoice);
      _this.data.AlarmComPackageId.subscribe(_this.refreshInvoice);
      _this.data.MonthlyMonitoringRateActual.subscribe(_this.refreshInvoice);
    });
  };

  CListSalesInfoViewModel.prototype.letter = function(first) {
    var _this = this;
    if (first) {
      // reset to first letter
      _this._char = 'A'.charCodeAt(0);
    }
    return String.fromCharCode(_this._char++) + '.';
  };


  function load_invoice(data, cb) {
    dataservice.salessummary.invoiceMsIsntalls.read({
      id: data.AccountId(),
      link: 'accountid'
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        // console.log(resp.Value);
        data.setVal(resp.Value);
        data.markClean(resp.Value, true);
      }
    }, function(err) {
      notify.notify('error', err.Message);
    }));
  }

  function load_pointSystems(cvm, cb) {
    // ** Pull pointSystems
    dataservice.salessummary.pointSystems.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data
      cvm.setList(resp.Value);
      cvm.selectItem(cvm.list()[0]);
    }, utils.no_op));
  }

  function load_panelTypes(cvm, cb) {
    dataservice.salessummary.panelTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);
    }, utils.no_op));
  }

  function load_cellularTypes(cvm, cb) {
    // ** Pull Cellular Types
    dataservice.salessummary.cellularTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data
      cvm.setList(resp.Value);
    }, utils.no_op));
  }

  function load_vendorAlarmComPackages(cvm, cb) {
    // ** Pull alarm.com packages
    dataservice.salessummary.vendorAlarmcomPacakges.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind Data
      cvm.setList(resp.Value);
    }, utils.no_op));
  }

  function load_frequentlyInstalledEquipmentGet(gvm, cb) {
    // ** Pull data
    dataservice.salessummary.frequentlyInstalledEquipmentGet.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data to table
      gvm.list(resp.Value || []);
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
      invoiceID: _this.data.InvoiceID(),
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
        _this.partsGvm.list(result.Items);
      }
      if (utils.isFunc(cb)) {
        cb();
      }
    };
  }

  return CListSalesInfoViewModel;
});
