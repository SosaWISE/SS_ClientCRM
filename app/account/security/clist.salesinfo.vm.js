define('src/account/security/clist.salesinfo.vm', [
  'underscore',
  'src/account/security/parts.editor.vm',
  'src/config',
  'src/slick/buttonscolumn',
  'src/account/security/frequent.gvm',
  'src/account/security/clist.salesinfo.gvm',
  'src/ukov',
  'src/dataservice',
  'src/core/strings',
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
  strings,
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

    //
    // From Invoice
    //
    // AccountId: 130532,
    // ActivationFee: 99,
    // ActivationFeeActual: 5,
    // ActivationFeeItemId: "SETUP_FEE_99",
    // AlarmComPackageId: "ADVINT",
    // CellularTypeId: "CELLPRI",
    // ContractTemplateId: null,
    // InvoiceID: 10020170,
    // MonthlyMonitoringRate: 39.95,
    // MonthlyMonitoringRateActual: 1,
    // MonthlyMonitoringRateItemId: "MON_CONT_5001",
    // Over3Months: true,
    // PanelTypeId: "CONCORD",

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
    CellularTypeId: {},
    ContractTemplateId: {},
    InvoiceID: {},
    MonthlyMonitoringRate: {},
    MonthlyMonitoringRateActual: {
      converter: ukov.converters.number(2, 'Invalid monthly monitoring rate'),
    },
    MonthlyMonitoringRateItemId: {},
    Over3Months: {},
    PanelTypeId: {},


    //
    // From MsAccountSalesInformation
    //
    // AccountID: 130532,
    // BillingDay: null,
    // CellPackageItemId: "CELL_SRV_AC_AI",
    // CellServicePackage: "Advanced Interactive",
    // CellType: "Alarm.com",
    // ContractLength: null,
    // IsOwner: null,
    // IsTakeOver: null,
    // MMR: 1,
    // Over3Months: true,
    // PanelItemId: "S911BRC-CE",
    // PanelTypeId: "CONCORD",
    // PaymentTypeId: null,
    // Setup1stMonth: 2,
    // SetupFee: 5,

    // AccountID: {},
    BillingDay: {},
    CellPackageItemId: {},
    CellServicePackage: {},
    CellType: {},
    ContractLength: {},
    IsOwner: {},
    IsTakeOver: {},
    // MMR: {},
    // Over3Months: {},
    PanelItemId: {},
    // PanelTypeId:  {},
    PaymentTypeId: {},
    Setup1stMonth: {},
    SetupFee: {},
  };

  function CListSalesInfoViewModel(options) {
    var _this = this;
    CListSalesInfoViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.subs = [];
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

    _this.data.Over3MonthsCvm = new ComboViewModel({
      selectedValue: _this.data.Over3Months,
      list: _this.over3MonthsOptions,
    });
    _this.data.PaymentTypeCvm = new ComboViewModel({
      selectedValue: _this.data.PaymentTypeId,
      list: _this.paymentTypeOptions,
    });
    _this.data.BillingDayCvm = new ComboViewModel({
      selectedValue: _this.data.BillingDay,
      list: _this.billingDayOptions,
    });
    _this.data.IsTakeOverCvm = new ComboViewModel({
      selectedValue: _this.data.IsTakeOver,
      list: _this.isTakeOverOptions,
    });
    _this.data.IsOwnerCvm = new ComboViewModel({
      selectedValue: _this.data.IsOwner,
      list: _this.isOwnerOptions,
    });
    _this.data.CellTypeCvm = new ComboViewModel({
      selectedValue: _this.data.CellType,
      list: _this.cellTypeOptions,
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
          notify.notify('error', 'Error', err.Message);
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
      // psValue can be null...
      if (!psValue) {
        return;
      }
      _this.contractLengthsCvm.setList([]);
      dataservice.salessummary.contractLengthsGet.read({
        id: psValue,
      }, null, utils.safeCallback(null, function(err, resp) {
        // only set cl if same as current selected psValue
        if (_this.pointSystemsCvm.selectedValue() === psValue) {
          _this.contractLengthsCvm.setList(resp.Value);
        }
      }, function(err) {
        notify.notify('error', 'Error', err.Message);
      }));
    });


    _this.isAlarmCom = ko.observable(false);
    _this.hasCell = ko.observable(false);
    _this.data.CellType.subscribe(function(cellType) {
      var tmp;

      tmp = cellType === 3;
      _this.isAlarmCom(tmp);
      _this.data.CellularTypeId.ignore(!tmp, true);

      tmp = cellType && cellType !== 1;
      _this.hasCell(tmp);
      _this.data.AlarmComPackageId.ignore(!tmp, true);
    });


    //
    // events
    //
    _this.refreshInvoice = function(cb) {
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), null, 7);
        cb();
        return;
      }

      var data = _this.data.getValue(false, true);
      data.CellTypeId = data.CellularTypeId; //@HACK: to save CellularTypeId
      if (underscore.isEqual(_this.currData, data)) {
        // no need to re-save the same data
        cb();
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
        notify.notify('error', 'Error', err.Message);
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
  CListSalesInfoViewModel.prototype.reloadable = true;

  CListSalesInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      subjoin = join.create(),
      cb;

    // remove old subscriptions
    _this.subs.forEach(function(s) {
      s.dispose();
    });
    _this.subs = [];

    function onLoadComplete(err) {
      if (!err) {
        _this.data.markClean({}, true);

        // subscribe to updates after everyting has been set
        _this.subs.push(_this.data.ActivationFeeActual.subscribe(_this.refreshInvoice));
        _this.subs.push(_this.data.PanelTypeId.subscribe(_this.refreshInvoice));
        _this.subs.push(_this.data.CellularTypeId.subscribe(_this.refreshInvoice));
        _this.subs.push(_this.data.Over3Months.subscribe(_this.refreshInvoice));
        _this.subs.push(_this.data.AlarmComPackageId.subscribe(_this.refreshInvoice));
        _this.subs.push(_this.data.MonthlyMonitoringRateActual.subscribe(_this.refreshInvoice));
      }
      cb(err);
    }

    _this.currData = null; // clear (incase of reload)

    _this.data.AccountId(routeData.id);

    load_invoice(_this.data, subjoin);
    load_vendorAlarmComPackages(_this.data.AlarmComPackageCvm, subjoin.add('2'));
    load_pointSystems(_this.pointSystemsCvm, subjoin.add('3'));
    load_panelTypes(_this.data.PanelTypeCvm, subjoin.add('4'));
    load_cellularTypes(_this.data.CellularTypeCvm, subjoin.add('5'));
    load_frequentlyInstalledEquipmentGet(_this.frequentGvm, subjoin.add('6'));

    cb = join.add('1');
    subjoin.when(function(err) {
      if (err) {
        onLoadComplete(err);
      } else {
        //@REVIEW: why is the invoice being refreshed after it was just loaded???? possibly for new invoices???
        /** Refresh the invoice. */
        _this.refreshInvoice(onLoadComplete);
      }
    });
  };

  // CListSalesInfoViewModel.prototype.letter = function(first) {
  //   var _this = this;
  //   if (first) {
  //     // reset to first letter
  //     _this._char = 'A'.charCodeAt(0);
  //   }
  //   return String.fromCharCode(_this._char++) + '.';
  // };
  CListSalesInfoViewModel.prototype.num = function(first) {
    var _this = this;
    if (first) {
      _this._num = first;
    }
    // reset subnum
    _this._subnum = 1;
    //
    return strings.format('{0}.', _this._num++);
  };
  CListSalesInfoViewModel.prototype.subnum = function() {
    var _this = this;
    return strings.format('{0}.{1}.', _this._num - 1, _this._subnum++);
  };


  function load_invoice(data, join) {
    dataservice.salessummary.invoiceMsIsntalls.read({
      id: data.AccountId(),
      link: 'accountid'
    }, null, utils.safeCallback(join.add('7'), function(err, resp) {
      if (resp.Value) {
        load_msAccountSalesInformations(resp.Value, data, join.add('8'));
      }
    }, function(err) {
      notify.notify('error', 'Error', err.Message);
    }));
  }

  function load_msAccountSalesInformations(invoice, data, cb) {
    dataservice.monitoringstationsrv.msAccountSalesInformations.read({
      id: data.AccountId(),
    }, null, utils.safeCallback(cb, function(err, resp) {
      var val = resp.Value;
      if (val) {
        // console.log('load_invoice:', invoice);
        data.setValue(invoice);

        // console.log('load_msAccountSalesInformations:', val);

        // set defaults
        utils.setIfNull(val, 'Over3Months', true);
        utils.setIfNull(val, 'PaymentTypeId', 1);
        utils.setIfNull(val, 'BillingDay', 5); // 5th of month
        utils.setIfNull(val, 'IsTakeOver', false);
        utils.setIfNull(val, 'IsOwner', true);
        utils.setIfNull(val, 'CellType', 1);
        // utils.setIfNull(val, 'ContractLength', 60); // ?????????????
        // utils.setIfNull(val, 'Setup1stMonth', 199.00); // ?????????????
        // utils.setIfNull(val, 'SetupFee', 199.00); // ?????????????

        data.setValue(val);
      }
    }, function(err) {
      notify.notify('error', 'Error', err.Message);
    }));
  }

  function load_pointSystems(cvm, cb) {
    cvm.setList([]);
    // ** Pull pointSystems
    dataservice.salessummary.pointSystems.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data
      cvm.setList(resp.Value);
      cvm.selectItem(cvm.list()[0]);
    }, utils.no_op));
  }

  function load_panelTypes(cvm, cb) {
    cvm.setList([]);
    dataservice.salessummary.panelTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);
    }, utils.no_op));
  }

  function load_cellularTypes(cvm, cb) {
    cvm.setList([]);
    // ** Pull Cellular Types
    dataservice.salessummary.cellularTypes.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind data
      cvm.setList(resp.Value);
    }, utils.no_op));
  }

  function load_vendorAlarmComPackages(cvm, cb) {
    cvm.setList([]);
    // ** Pull alarm.com packages
    dataservice.salessummary.vendorAlarmcomPacakges.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // ** Bind Data
      cvm.setList(resp.Value);
    }, utils.no_op));
  }

  function load_frequentlyInstalledEquipmentGet(gvm, cb) {
    gvm.list([]);
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


  CListSalesInfoViewModel.prototype.over3MonthsOptions = [ //
    {
      value: true,
      text: 'Over 3 Months'
    }, {
      value: false,
      text: 'Paid in Full'
    },
  ];
  CListSalesInfoViewModel.prototype.paymentTypeOptions = [ //
    {
      value: 1,
      text: 'ACH'
    }, {
      value: 2,
      text: 'Credit Card'
    }, {
      value: 3,
      text: 'Invoice'
    },
  ];
  CListSalesInfoViewModel.prototype.billingDayOptions = [ //
    {
      value: 1,
      text: '1st'
    }, {
      value: 2,
      text: '2nd'
    }, {
      value: 3,
      text: '3rd'
    }, {
      value: 4,
      text: '4th'
    }, {
      value: 5,
      text: '5th'
    }, {
      value: 6,
      text: '6th'
    }, {
      value: 7,
      text: '7th'
    }, {
      value: 8,
      text: '8th'
    }, {
      value: 9,
      text: '9th'
    }, {
      value: 10,
      text: '10th'
    }, {
      value: 11,
      text: '11th'
    }, {
      value: 12,
      text: '12th'
    }, {
      value: 13,
      text: '13th'
    }, {
      value: 14,
      text: '14th'
    }, {
      value: 15,
      text: '15th'
    }, {
      value: 16,
      text: '16th'
    }, {
      value: 17,
      text: '17th'
    }, {
      value: 18,
      text: '18th'
    }, {
      value: 19,
      text: '19th'
    }, {
      value: 20,
      text: '20th'
    }, {
      value: 21,
      text: '21st'
    }, {
      value: 22,
      text: '22nd'
    }, {
      value: 23,
      text: '23rd'
    }, {
      value: 24,
      text: '24th'
    }, {
      value: 25,
      text: '25th'
    },
  ];
  CListSalesInfoViewModel.prototype.isTakeOverOptions = [ //
    {
      value: false,
      text: 'New Install'
    }, {
      value: true,
      text: 'Takeover'
    },
  ];
  CListSalesInfoViewModel.prototype.isOwnerOptions = [ //
    {
      value: true,
      text: 'Home Owner'
    }, {
      value: false,
      text: 'Renter'
    },
  ];
  CListSalesInfoViewModel.prototype.cellTypeOptions = [ //
    {
      value: 1,
      text: '[No Cell]'
    }, {
      value: 2,
      text: 'Telguard'
    }, {
      value: 3,
      text: 'Alarm.com'
    }, {
      value: 4,
      text: 'Alarm.net'
    },
  ];

  return CListSalesInfoViewModel;
});
