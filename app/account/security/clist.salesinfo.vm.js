define("src/account/security/clist.salesinfo.vm", [
  "underscore",
  "src/account/security/parts.editor.vm",
  "src/app",
  "src/config",
  "src/slick/buttonscolumn",
  "src/account/security/frequent.gvm",
  "src/account/security/clist.salesinfo.gvm",
  "src/ukov",
  "src/dataservice",
  "src/core/numbers",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
  "ko",
  "src/core/combo.vm",
], function(
  underscore,
  PartsEditorViewModel,
  app,
  config,
  ButtonsColumn,
  FrequentGridViewModel,
  CListSalesInfoGridViewModel,
  ukov,
  dataservice,
  numbers,
  strings,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  var schema,
    emailDependsOnCellPackageItemIdVg;

  emailDependsOnCellPackageItemIdVg = {
    keys: ["Email", "CellPackageItemId"],
    validators: [],
  };

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
      converter: ukov.converters.number(2, "Invalid activation fee"),
      validators: [
        ukov.validators.isRequired("Activation Fee is Required"),
      ]
    },
    ActivationFeeItemId: {},
    // AlarmComPackageId: {},
    CellularTypeId: {},
    // ContractTemplateId: {},
    InvoiceID: {},
    MonthlyMonitoringRate: {},
    MonthlyMonitoringRateActual: {
      converter: ukov.converters.number(2, "Invalid monthly monitoring rate"),
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
    // ContractTemplate: null,
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
    PaymentTypeId: {},
    BillingDay: {},
    // MMR: {},
    // Over3Months: {},
    Setup1stMonth: {},
    SetupFee: {},

    PanelItemId: {},
    // PanelTypeId:  {},

    IsTakeOver: {},
    IsMoni: {
      validators: [
        // ukov.validators.isRequired("Current Monitoring Station is Required"),
      ],
    },

    IsOwner: {},

    CellPackageItemId: {
      // re-run Email validators when CellPackageItemId changes
      validationGroup: emailDependsOnCellPackageItemIdVg,
    },
    // CellServicePackage: {},
    // CellularTypeId: {},
    // CellularTypeName: {},
    Email: {
      // re-run Email validators when CellPackageItemId changes
      validationGroup: emailDependsOnCellPackageItemIdVg,
      validators: [
        // only required if Alarm.com
        function(val, model, ukovModel) {
          if (!val && strings.startsWith(ukovModel.CellPackageItemId.peek(), "CELL_SRV_AC")) { // Alarm.com
            return "Email is required";
          }
        },
        ukov.validators.isEmail(),
      ],
    },
    // ContractLength: {},
    ContractTemplateId: {},
  };

  function CListSalesInfoViewModel(options) {
    var _this = this;
    CListSalesInfoViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["layersVm"]);

    _this.mayReload = ko.observable(false);
    _this.subs = [];
    _this.title = ko.observable(_this.title);
    _this.data = ukov.wrap({
      DealerId: app.user().DealerId,
    }, schema);
    _this.data.PanelTypeCvm = new ComboViewModel({
      selectedValue: _this.data.PanelTypeId,
      nullable: true,
      fields: {
        text: "PanelTypeName",
        value: "PanelTypeID",
      }
    });
    _this.data.CellularTypeCvm = new ComboViewModel({
      selectedValue: _this.data.CellularTypeId,
      fields: {
        text: "CellularTypeName",
        value: "CellularTypeID",
      }
    });
    // _this.data.AlarmComPackageCvm = new ComboViewModel({
    //   selectedValue: _this.data.AlarmComPackageId,
    //   fields: {
    //     text: "PackageName",
    //     value: "AlarmComPackageID",
    //   }
    // });

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
    _this.data.cellServiceCvm = new ComboViewModel({
      selectedValue: ko.observable(null),
      list: _this.cellServiceOptions,
    });
    _this.data.CellPackageItemCvm = new ComboViewModel({
      selectedValue: _this.data.CellPackageItemId,
      list: _this.cellPackageItemOptions,
    });

    _this.data.IsMoniCvm = new ComboViewModel({
      selectedValue: _this.data.IsMoni,
      list: _this.monitoringStationOptions,
    });



    _this.pointSystemsCvm = new ComboViewModel({
      fields: {
        text: "TemplateName",
        value: "InvoiceTemplateID",
      }
    });
    _this.data.ContractTemplatesCvm = new ComboViewModel({
      selectedValue: _this.data.ContractTemplateId,
      fields: {
        text: "ContractName",
        value: "ContractTemplateID",
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
            // reload invoice (without saving)
            load_invoice(_this.data.InvoiceID.getValue(), utils.safeCallback(null, function(err, resp) {
              _this.partsGvm.list(resp.Value.Items);
            }, function(err) {
              notify.error(err);
            }));
          }
        }, function(err) {
          notify.error(err);
        }));
      },
    });

    _this.pointSystemsCvm.selectedValue.subscribe(function(psValue) {
      // psValue can be null...
      if (!psValue) {
        return;
      }
      _this.data.ContractTemplatesCvm.setList([]);
      dataservice.salessummary.contractLengthsGet.read({
        id: psValue,
      }, null, utils.safeCallback(null, function(err, resp) {
        // only set cl if same as current selected psValue
        if (_this.pointSystemsCvm.selectedValue() === psValue) {
          _this.data.ContractTemplatesCvm.setList(resp.Value);
        }
      }, function(err) {
        notify.error(err);
      }));
    });


    _this.isAlarmCom = ko.observable(false);
    _this.hasCell = ko.observable(false);
    _this.cellularTypes = ko.observableArray();
    //
    function cellServiceChanged(cellService) {
      _this.isAlarmCom(cellService === "CELL_SRV_AC"); // Alarm.com

      _this.hasCell(!!cellService); // false if no cell package item
      if (_this.hasCell.peek()) {
        // all if there is a cell service
        _this.data.CellularTypeCvm.setList(_this.cellularTypes.peek());
      } else {
        // only No Cell
        _this.data.CellularTypeCvm.setList(_this.cellularTypes.peek().filter(function(type) {
          return type.CellularTypeID === "NOCELL";
        }));
      }
      if (!_this.data.CellularTypeCvm.selectedValue.peek()) {
        // select first item if one is not selected
        _this.data.CellularTypeCvm.selectFirst();
      }

      // filter Cell Packages by the selected Cell Service
      _this.data.CellPackageItemCvm.setList(_this.cellPackageItemOptions.filter(function(item) {
        return cellService && strings.startsWith(item.value, cellService);
      }));
      if (!_this.data.CellPackageItemCvm.selectedValue.peek()) {
        // select first item if one is not selected
        _this.data.CellPackageItemCvm.selectFirst();
      }
    }
    _this.data.cellServiceCvm.selectedValue.subscribe(cellServiceChanged);
    cellServiceChanged();

    //
    function isTakeOverChanged(isTakeOver) {
      _this.data.IsMoni.ignore(!isTakeOver, true);
    }
    _this.data.IsTakeOver.subscribe(isTakeOverChanged);
    isTakeOverChanged();

    //
    // events
    //
    _this.cmdAddByPart = ko.command(function(cb) {
      showPartsEditor(_this, true, null, cb);
    });
    _this.cmdAddByBarcode = ko.command(function(cb) {
      showPartsEditor(_this, false, null, cb);
    });


    // bind scope and do not rapid fire requests
    _this.refreshInvoice = underscore.debounce(_this.refreshInvoice.bind(_this), 100);
  }
  utils.inherits(CListSalesInfoViewModel, ControllerViewModel);
  CListSalesInfoViewModel.prototype.viewTmpl = "tmpl-security-clist_salesinfo";

  CListSalesInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      accountid = routeData.id,
      customerEmail,
      join1 = join.create(),
      join2 = join.create(),
      join3 = join.create(),
      cb = join.add("1");

    _this.currData = null; // clear (incase of reload)

    // remove old subscriptions
    _this.subs.forEach(function(s) {
      s.dispose();
    });
    _this.subs = [];

    _this.data.AccountId(accountid);

    //
    // 1 - load types
    //
    // load_vendorAlarmComPackages(_this.data.AlarmComPackageCvm, join1.add("2"));
    load_pointSystems(_this.pointSystemsCvm, join1.add("3"));
    load_panelTypes(_this.data.PanelTypeCvm, join1.add("4"));
    load_frequentlyInstalledEquipmentGet(_this.frequentGvm, join1.add("6"));
    _this.data.CellularTypeCvm.setList([]);
    load_cellularTypes(_this.cellularTypes, join1.add("5"));
    //
    dataservice.qualify.qualifyCustomerInfos.read({
      id: accountid,
      link: "account",
    }, null, utils.safeCallback(join1.add(), function(err, resp) {
      customerEmail = resp.CustomerEmail;
      // load sales rep
      dataservice.qualify.salesrep.read({
        id: resp.Value.CompanyID,
      }, null, utils.safeCallback(join1.add(), function(err, resp) {
        var rep = resp.Value;
        if (rep) {
          _this.reps = [rep];
        } else {
          _this.reps = [];
        }
      }, utils.noop));
    }, utils.no_op));
    //
    // 2 - load invoiceMsInstalls
    //
    join1.after(function(err) {
      if (err) {
        // skip to next one
        join2.add()(err);
      } else {
        load_invoiceMsInstalls(_this.data, customerEmail, join2);
      }
    });
    //
    // 3 - load the invoice items
    //
    join2.after(function(err) {
      var cb = join3.add(),
        invoiceId;
      if (err) {
        cb(err);
      } else {
        invoiceId = _this.data.InvoiceID.getValue();
        if (invoiceId) {
          // load invoice (without saving)
          load_invoice(invoiceId, utils.safeCallback(cb, function(err, resp) {
            _this.partsGvm.list(resp.Value.Items);
          }, utils.noop));
        } else {
          // load invoice
          _this.refreshInvoice(cb);
        }
      }
    });
    //
    // 4 - add subscriptions
    //
    join3.after(function(err) {
      if (!err) {
        // subscribe to updates after everyting has been set
        Object.keys(_this.data.doc).forEach(function(key) {
          _this.subs.push(_this.data[key].subscribe(_this.refreshInvoice));
        });
        // try to refresh whenever the cell service changes
        //  - only needed when there is an error on a previous refresh
        _this.subs.push(_this.data.cellServiceCvm.selectedValue.subscribe(_this.refreshInvoice));
      }
      cb(err);
    });
  };

  CListSalesInfoViewModel.prototype.num = function(first) {
    var _this = this;
    if (first) {
      _this._num = first;
    }
    // reset subnum
    _this._subnum = 1;
    //
    return strings.format("{0}.", _this._num++);
  };
  CListSalesInfoViewModel.prototype.subnum = function() {
    var _this = this;
    return strings.format("{0}.{1}.", _this._num - 1, _this._subnum++);
  };

  CListSalesInfoViewModel.prototype.refreshInvoice = function(cb) {
    var _this = this,
      data;
    if (!utils.isFunc(cb)) {
      cb = utils.noop;
    }

    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
      return;
    }
    if (_this.data.isClean()) {
      // nothing to save here
      cb();
      return;
    }
    data = _this.data.getValue(false, true);
    // prevent multiple calls while waiting for first to return
    if (underscore.isEqual(_this.currData, data)) {
      // no need to re-save the same data
      cb();
      return;
    }
    _this.currData = data;

    //@HACK: to save CellularTypeId
    data.CellTypeId = data.CellularTypeId;
    //@HACK: to save CellPackageItemId
    // data.AlarmComPackageId = data.CellPackageItemId;
    // delete data.CellPackageItemId;

    // console.log("currData:", JSON.stringify(_this.currData, null, "  "));
    dataservice.salessummary.invoiceRefresh.save({
      data: data,
    }, null, utils.safeCallback(cb, function(err, resp) {
      // make sure this is the last response
      if (_this.currData === data) {
        _this.currData = null;
        _this.data.markClean(data, true);
        _this.partsGvm.list(resp.Value.Items);
      }
    }, function(err) {
      notify.error(err);
    }));
  };

  function load_invoice(invoiceId, cb) {
    dataservice.invoicesrv.invoices.read({
      id: invoiceId,
    }, null, cb);
  }

  function load_invoiceMsInstalls(data, customerEmail, join) {
    dataservice.salessummary.invoiceMsIsntalls.read({
      id: data.AccountId(),
      link: "accountid"
    }, null, utils.safeCallback(join.add("7"), function(err, resp) {
      if (resp.Value) {
        load_msAccountSalesInformations(resp.Value, data, customerEmail, join.add("8"));
      }
    }, function(err) {
      notify.error(err);
    }));
  }

  function load_msAccountSalesInformations(invoice, data, customerEmail, cb) {
    dataservice.monitoringstationsrv.msAccountSalesInformations.read({
      id: data.AccountId(),
    }, null, utils.safeCallback(cb, function(err, resp) {
      var val = resp.Value;
      if (val) {
        // infer Cell Service from Cell Package
        if (val.CellPackageItemId) {
          //@NOTE: 11 is the current length of the service ids...
          data.cellServiceCvm.selectedValue(val.CellPackageItemId.substr(0, 11));
        } else {
          data.cellServiceCvm.selectedValue(null);
        }

        // set both here instead of after loading invoice so the UI looks more fluid??
        // set invoice data
        data.setValue(invoice);
        // default to customer"s email
        val.Email = val.Email || customerEmail;
        // set sales info data
        data.setValue(val);
        // mark current values as the clean values
        // defaults below may make the invoice dirty
        data.markClean({}, true);


        // set defaults
        utils.setIfNull(val, {
          Over3Months: true,
          PaymentTypeId: "ACH",
          BillingDay: 5, // 5th of month
          IsTakeOver: false,
          IsOwner: true,
          // IsMoni: false,

          // ContractTemplate: 60, // ?????????????
          // Setup1stMonth: 199.00, // ?????????????
          // SetupFee: 199.00, // ?????????????
        });
        data.setValue(val);
      }
    }, function(err) {
      notify.error(err);
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

  function load_cellularTypes(setter, cb) {
    // ** Pull Cellular Types
    dataservice.salessummary.cellularTypes.read({}, setter, cb);
  }

  // function load_vendorAlarmComPackages(cvm, cb) {
  //   cvm.setList([]);
  //   // ** Pull alarm.com packages
  //   dataservice.salessummary.vendorAlarmcomPacakges.read({}, null, utils.safeCallback(cb, function(err, resp) {
  //     // ** Bind Data
  //     cvm.setList(resp.Value);
  //   }, utils.no_op));
  // }

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
      layersVm: _this.layersVm,
      reps: _this.reps,
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
      text: "Over 3 Months",
    }, {
      value: false,
      text: "Paid in Full",
    },
  ];
  CListSalesInfoViewModel.prototype.paymentTypeOptions = [ //
    {
      value: "ACH",
      text: "ACH"
    }, {
      value: "CC",
      text: "Credit Card",
    }, {
      value: "CHCK",
      text: "Check",
    }, {
      value: "MAN",
      text: "Manual Invoice",
    },
  ];
  (function() {
    var list = [],
      i = 0;
    // billing days are 1st to 25th
    while (i < 25) {
      i++;
      list.push({
        value: i,
        text: numbers.toOrdinal(i),
      });
    }
    CListSalesInfoViewModel.prototype.billingDayOptions = list;
  })();
  CListSalesInfoViewModel.prototype.isTakeOverOptions = [ //
    {
      value: false,
      text: "New Install",
    }, {
      value: true,
      text: "Takeover",
    },
  ];
  CListSalesInfoViewModel.prototype.isOwnerOptions = [ //
    {
      value: true,
      text: "Home Owner",
    }, {
      value: false,
      text: "Renter",
    },
  ];
  CListSalesInfoViewModel.prototype.cellServiceOptions = [ //
    {
      value: null,
      text: "[No Cell]",
    }, {
      value: "CELL_SRV_TG",
      text: "Telguard",
    }, {
      value: "CELL_SRV_AC",
      text: "Alarm.com",
    }, {
      value: "CELL_SRV_HW",
      text: "HW AlarmNet",
    },
  ];
  CListSalesInfoViewModel.prototype.cellPackageItemOptions = [ //
    {
      value: "CELL_SRV_AC_AI",
      text: "Advanced Interactive",
    }, {
      value: "CELL_SRV_AC_BI",
      text: "Basic Interactive",
    }, {
      value: "CELL_SRV_AC_IG",
      text: "Interactive Gold",
    }, {
      value: "CELL_SRV_AC_WSF",
      text: "Alarm.Com Wireless Signal Forward",
    }, {
      value: "CELL_SRV_HW",
      text: "Honeywell Alarm.net Service",
    }, {
      value: "CELL_SRV_TG",
      text: "Telguard Monthly",
    },
  ];
  CListSalesInfoViewModel.prototype.monitoringStationOptions = [ //
    {
      value: true,
      text: "Monitronics",
    }, {
      value: false,
      text: "Other",
    },
  ];

  return CListSalesInfoViewModel;
});
