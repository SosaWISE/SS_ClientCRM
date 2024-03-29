define("src/account/salesinfo/v02/salesinfo.vm", [
  "underscore",
  "src/account/mscache",
  "src/account/salesinfo/v02/contract.model",
  "src/account/salesinfo/v02/invoiceitems.editor.vm",
  "src/account/salesinfo/v02/invoice.model",
  "src/account/salesinfo/v02/salesinfo.model",
  "src/account/salesinfo/v02/salesinfo.gvm",
  "src/account/security/equipment.vm",
  "src/account/security/frequent.gvm",
  "src/account/salesinfo/options",
  "dataservice",
  "ko",
  "src/core/joiner",
  "src/core/arrays",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  underscore,
  mscache,
  contract_model,
  InvoiceItemsEditorViewModel,
  invoice_model,
  salesinfo_model,
  SalesInfoGridViewModel,
  EquipmentViewModel,
  FrequentGridViewModel,
  salesInfoOptions,
  dataservice,
  ko,
  joiner,
  arrays,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function SalesInfoViewModel(options) {
    var _this = this;
    SalesInfoViewModel.super_.call(_this, options);
    utils.assertProps(_this, ["layersVm"]);

    _this.mixinLoad();
    _this.initHandler();

    _this.creditScore = ko.observable(0);
    // /////////////////////TESTING/////////////////////
    // _this.creditScore = function() {
    //   return 624;
    // };
    // _this.creditScore.peek = _this.creditScore;
    // /////////////////////TESTING/////////////////////
    _this.lockActivationFee = ko.observable(false);
    _this.creditGroup = ko.computed(function() {
      var creditGroup;
      var score = _this.creditScore();
      if (score >= 700) {
        creditGroup = "Excellent";
      } else if (score >= 625) {
        creditGroup = "Good";
      } else if (score >= 600) {
        creditGroup = "Sub";
      } else {
        creditGroup = "Poor";
      }
      return creditGroup;
    });

    function saveItems(invItems, cb) {
      saveInvoiceItems(_this, invItems, cb);
    }

    _this.invoice = invoice_model({
      layersVm: _this.layersVm,
      handler: _this.handler,
      yesNoOptions: _this.yesNoOptions,
      saveInvoiceItems: saveItems,
    });
    _this.salesinfo = salesinfo_model({
      requirePkg: true,
      layersVm: _this.layersVm,
      handler: _this.handler,
      yesNoOptions: _this.yesNoOptions,
    });
    _this.contract = contract_model({
      layersVm: _this.layersVm,
      handler: _this.handler,
    });

    _this.title = ko.observable(_this.title);
    _this.savingInvItems = ko.observable(0);

    _this.equipmentVm = new EquipmentViewModel({
      pcontroller: _this.pcontroller,
      layersVm: _this.layersVm,
      existingOnly: true,
    });

    _this.frequentGvm = new FrequentGridViewModel({
      addPart: function(part) {
        showInvoiceItemsEditor(_this, null, part.ItemID);
      },
    });
    _this.invoiceGvm = new SalesInfoGridViewModel({
      edit: function(invoiceItemGrp) {
        showInvoiceItemsEditor(_this, invoiceItemGrp);
      },
    });

    //
    // events
    //
    _this.cmdAddPart = ko.command(function(cb) {
      showInvoiceItemsEditor(_this, null, null, null, cb);
    });
    _this.cmdSaveData = ko.command(function(cb) {
      var join = joiner();
      saveSalesInfo(_this, join.add());
      saveContract(_this, join.add());
      join.when(cb);
    });
    _this.saveData = function() {
      _this.cmdSaveData.execute();
    };

    _this.busy = ko.computed(function() {
      return _this.savingInvItems() || _this.cmdSaveData.busy();
    });

    // bind scope and do not rapid fire requests
    _this.updateInvoiceGvm = updateInvoiceGvm.bind(_this);
    _this.packageChanged = packageChanged.bind(_this);
    _this.ffTypeChanged = ffTypeChanged.bind(_this);
    _this.refreshInvoice = underscore.debounce(_this.refreshInvoice.bind(_this), 100);


    _this.vms = [ // nested view models
      _this.equipmentVm,
    ];
  }
  utils.inherits(SalesInfoViewModel, BaseViewModel);
  SalesInfoViewModel.prototype.viewTmpl = "tmpl-salesinfo-v02-salesinfo";

  SalesInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    var acctid = routeData.id;
    _this.acctid = acctid;
    // customerEmail,
    // var joinTypes = join.create();
    // join2 = join.create(),
    // join3 = join.create(),
    // cb = join.add("1");

    _this.currData = null; // clear (incase of reload)

    _this.cache = {
      reps: [],
    };

    _this.vms.forEach(function(vm) {
      vm.load(routeData, extraData, join.add());
    });

    function step1() {
      // start next step when done
      var subjoin = join.create()
        .after(utils.safeCallback(join.add(), step2, utils.noop));
      // ensure types
      mscache.ensure("invoices/items", subjoin.add());
      mscache.ensure("packages", subjoin.add());
      // ensure types needed by models
      _this.invoice.load(subjoin.add());
      _this.salesinfo.load(subjoin.add());
      load_frequentlyInstalledEquipmentGet(_this.frequentGvm.list, subjoin.add());
      load_contractLengths(function(list) {
        _this.contract.ContractTemplateCvm.setList(list.sort(function(a, b) {
          // order descending
          return b.ContractLength - a.ContractLength;
        }));
      }, subjoin.add());
    }

    function step2() {
      // start next step when done
      var subjoin = join.create()
        .after(utils.safeCallback(join.add(), step3, utils.noop));
      //
      load_installInvoice(acctid, function(val) {
        _this.invoice(val);
      }, subjoin.add());
      //
      load_msAccountSalesInformations(acctid, function(val) {
        _this.salesinfo.setValue(val);
        _this.salesinfo.markClean({}, true);
        setPkgValidation(_this);
      }, subjoin.add());
      // load credit (max of PRI & SEC
      loadCreditScore(acctid, "PRI", _this.creditScore, subjoin);
      loadCreditScore(acctid, "SEC", _this.creditScore, subjoin);
      //
      load_contract(acctid, function(val) {
        _this.contract.setValue(val);
        _this.contract.markClean({}, true);
      }, subjoin.add());
    }

    // remove old subscriptions
    _this.handler
      .dispose(_this.updateInvoiceGvm)
      .dispose(_this.packageChanged)
      .dispose(_this.ffTypeChanged)
      .dispose(_this.saveData);
    //
    function step3() {
      // set defaults
      var val = _this.salesinfo.getValue();
      utils.setIfNull(val, {
        AccountCreationTypeId: "NEW",
        Over3Months: false,
        PaymentTypeId: "ACH",
        BillingDay: 5, // 5th of month
      });
      _this.salesinfo.setValue(val);
      //
      if (!_this.contract.ContractTemplateCvm.selectedValue.peek()) {
        _this.contract.ContractTemplateCvm.selectFirst();
      }

      // add subscriptions
      _this.handler
        .subscribe(_this.invoice.invoiceItems, _this.updateInvoiceGvm, false)
        .subscribe(_this.salesinfo.PaymentTypeId, _this.packageChanged, true)
        .subscribe(_this.salesinfo.FriendsAndFamilyTypeId, _this.ffTypeChanged, true);
      //
      Object.keys(_this.salesinfo.doc).forEach(function(key) {
        _this.handler.subscribe(_this.salesinfo[key], _this.saveData, true);
      });
      Object.keys(_this.contract.doc).forEach(function(key) {
        _this.handler.subscribe(_this.contract[key], _this.saveData, true);
      });

      // try to add activation fee
      var setupInvItems = _this.invoice.findInvoiceItems(["SETUP_FEE"], []).filter(function(invItem) {
        return !invItem.IsDeleted;
      });
      var score = _this.creditScore.peek();
      var activationItemId;
      var activationFee;
      if (score >= 625) {
        activationItemId = "SETUP_FEE_69";
        activationFee = 69;
      } else if (score >= 600) {
        activationItemId = "SETUP_FEE_199";
        activationFee = 199;
      } else {
        activationItemId = "SETUP_FEE_299";
        activationFee = 299;
      }
      _this.lockActivationFee(score < 625);
      if (!setupInvItems.length) {
        var invoiceItem = _this.invoice.findInvoiceItems(["SETUP_FEE"], [])[0];
        if (!invoiceItem) {
          invoiceItem = {};
        }
        // create/update invoice item
        var item = mustGetItem(activationItemId);
        InvoiceItemsEditorViewModel.copyInvoiceItemFromItem(invoiceItem, item);
        saveInvoiceItems(_this, [invoiceItem]);
      }

      if (_this.lockActivationFee.peek()) {
        //@Task 1215: 2. Hard lock the Activation fee of $299 for Poor (Unapproved) credit, and $199 for SUB credit.
        _this.invoice.activation.range({
          min: activationFee,
          max: activationFee,
        });
        //@Task 1215: 3. Remove (or give warning message that it is not allowed) Manual Invoice, and Check from the Billing Method.
        _this.salesinfo.LimitPaymentTypes(true);
      } else {
        // incase of reload
        _this.invoice.activation.range(null);
        _this.salesinfo.LimitPaymentTypes(false);
      }
    }

    // start at first step
    step1();
  };

  function updateInvoiceGvm(invoiceItems) {
    /* jshint validthis:true */
    var _this = this;
    invoiceItems = invoiceItems.filter(function(item) {
      return !item.IsDeleted;
    });
    // group by fields in invoice item
    var map = underscore.groupBy(invoiceItems, function(item) {
      return (item.ItemId +
          "|" + item.RetailPrice + "|" + item.SystemPoints +
          "|" + item.SalesmanId + //"|" + item.TechnicianId +
          "|" + item.ProductBarcodeId + "|" + item.AccountEquipmentId)
        .toUpperCase(); // ignore casing
    });
    // turn groups map into a list
    var invoiceItemGrps = [];
    for (var key in map) {
      var groupItems = map[key];
      // use first group item as a template
      var item = groupItems[0];
      var invoiceItemGrp = {
        // store groupItems for editing and quantity
        groupItems: groupItems,
        //
        ItemId: item.ItemId,
        RetailPrice: item.RetailPrice,
        SystemPoints: item.SystemPoints,
        SalesmanId: item.SalesmanId,
        // TechnicianId: item.TechnicianId,
        // ¿¿¿ Assignee: item.SalesmanId || item.TechnicianId, // ???
        //
        // invoice items with ProductBarcodeId or AccountEquipmentId cannot be edited or deleted
        ProductBarcodeId: item.ProductBarcodeId,
        AccountEquipmentId: item.AccountEquipmentId,
      };
      invoiceItemGrps.push(invoiceItemGrp);
    }
    _this.invoiceGvm.list(invoiceItemGrps);
  }

  function getPackageFilteredItems(items, pkgItem) {
    //@HACK: ModelNumbers and ItemIds in the packages tables have new lines at end...
    var modelNumber = strings.trim(pkgItem.ModelNumber);
    var itemId = strings.trim(pkgItem.ItemId);
    return items.filter(function(item) {
      return (item.ModelNumber && item.ModelNumber === modelNumber) ||
        (item.ID && item.ID === itemId);
    });
  }

  function getInvoiceItemByFilteredItems(isDeleted, invoiceItems, filteredItems) {
    return arrays.first(invoiceItems, function(invItem) {
      return (invItem.IsDeleted === isDeleted) &&
        arrays.first(filteredItems, function(item) {
          return item.ID === invItem.ItemId;
        });
    });
  }

  function mustGetItem(itemId) {
    var item = mscache.getMap("invoices/items")[itemId];
    if (!item) {
      throw new Error("Failed to find item: `" + itemId + "`");
    }
    return item;
  }

  function packageChanged() {
    /* jshint validthis:true */
    var _this = this;
    // var invoice = _this.invoice();
    var invoiceItems = _this.invoice.invoiceItems.peek();
    var items = mscache.getList("invoices/items").peek();

    var invItemsToSave = [];
    var pkg = _this._prevpkg;
    if (pkg) {
      // delete package items
      pkg.PackageItems.forEach(function(pkgItem) {
        if (pkgItem.AccountPackageItemTypeId === "FEES") {
          console.log("AccountPackageItemTypeId: FEES excluded");
          return;
        }
        var filteredItems = getPackageFilteredItems(items, pkgItem);
        if (!filteredItems.length) {
          console.warn("no items for package item were found...");
          return;
        }
        // attempt to find an existing non-deleted invoice item for any of the filtered items
        var invoiceItem = getInvoiceItemByFilteredItems(false, invoiceItems, filteredItems);
        if (invoiceItem) {
          // delete invoice item
          invoiceItem.IsDeleted = true;
          //
          invItemsToSave.push(invoiceItem);
        } else {
          console.warn("invoice item not found...");
        }
      });
    }

    pkg = _this.salesinfo.AccountPackageCvm.selectedItem();
    if (pkg) {
      // _this.invoiceGvm.basePoints(pkg.BasePoints);
      // _this.invoice.rmr.range({
      //   min: pkg.MinRMR,
      //   max: pkg.MaxRMR,
      // });

      // add package items
      pkg.PackageItems.forEach(function(pkgItem) {
        if (pkgItem.AccountPackageItemTypeId === "FEES") {
          console.log("AccountPackageItemTypeId: FEES excluded");
          return;
        }
        var filteredItems = getPackageFilteredItems(items, pkgItem);
        if (!filteredItems.length) {
          console.warn("no items for package item were found...");
          return;
        }
        var item, invoiceItem;

        //@HACK: only allow one of non-equipment items, so start with all of them deleted
        if (pkgItem.AccountPackageItemTypeId !== "EQPM") {
          while (true) {
            invoiceItem = getInvoiceItemByFilteredItems(false, invoiceItems, filteredItems);
            if (!invoiceItem) {
              break;
            }
            invoiceItem.IsDeleted = true;
            invItemsToSave.push(invoiceItem);
          }
        }

        // attempt to find an existing deleted invoice item for any of the filtered items
        invoiceItem = getInvoiceItemByFilteredItems(true, invoiceItems, filteredItems);
        if (!invoiceItem) {
          // create if one not found
          invoiceItem = {};
          invoiceItems.push(invoiceItem);
          // default item to first in filtered list
          item = filteredItems[0];
        } else {
          // get item for invoice item
          item = mustGetItem(invoiceItem.ItemId);
        }
        // create/update invoice item
        InvoiceItemsEditorViewModel.copyInvoiceItemFromItem(invoiceItem, item);
        // invoiceItem.SalesmanId = null; //salesmanId;
        // invoiceItem.TechnicianId = null;
        // invoiceItem.ProductBarcodeId = null;
        // invoiceItem.AccountEquipmentId = null;
        // invoiceItem.IsActive = true;
        // invoiceItem.IsDeleted = false;
        //
        invItemsToSave.push(invoiceItem);
      });
    }

    setPkgValidation(_this);

    //
    saveInvoiceItems(_this, invItemsToSave);
  }

  function ffTypeChanged() {
    /* jshint validthis:true */
    var _this = this;
    setPkgValidation(_this);
  }

  function setPkgValidation(_this) {
    var pkg = _this.salesinfo.AccountPackageCvm.selectedItem();
    var ffTypeId = _this.salesinfo.FriendsAndFamilyTypeId.peek();

    _this._prevpkg = pkg;
    //We need to remove the RMR Validation when the Account Type is Friends & Family or Employee.
    var validateRange = !(ffTypeId === "FNFAM" || ffTypeId === "EMP");
    if (pkg && validateRange) {
      _this.invoiceGvm.basePoints(pkg.BasePoints);
      _this.invoice.rmr.range({
        min: pkg.MinRMR,
        max: pkg.MaxRMR,
      });
    } else {
      _this.invoiceGvm.basePoints(0);
      _this.invoice.rmr.range({});
    }
  }

  function saveInvoiceItems(_this, invoiceItems, cb) {
    if (!invoiceItems.length) {
      return cb;
    }
    // remove duplicate items (object equality)
    invoiceItems = underscore.uniq(invoiceItems);
    //
    var invoice = _this.invoice();
    _this.savingInvItems(true);
    dataservice.api_ms.invoices.save({
      id: invoice.ID,
      data: {
        ModifiedOn: invoice.ModifiedOn,
        InvoiceItems: invoiceItems,
      }
    }, function(inv) {
      if (inv) {
        _this.invoice(inv);
      }
    }, function(err) {
      _this.savingInvItems(false);
      notify.iferror(err);
      if (utils.isFunc(cb)) {
        cb(err);
      }
    });
  }

  function saveSalesInfo(_this, cb) {
    var data = _this.salesinfo;
    if (!data.isValid()) {
      notify.warn(data.errMsg(), null, 7);
      return cb();
    }
    if (data.isClean.peek()) {
      return cb();
    }
    var model = data.getValue();
    dataservice.api_ms.accounts.save({
      id: _this.acctid,
      link: "AccountSalesInformations",
      data: model,
    }, function(val) {
      data.setValue(val);
      data.markClean({}, true);
    }, cb);
  }

  function saveContract(_this, cb) {
    var data = _this.contract;
    if (!data.isValid()) {
      notify.warn(data.errMsg(), null, 7);
      return cb();
    }
    if (data.isClean.peek()) {
      return cb();
    }
    var model = data.getValue();
    dataservice.api_ms.accounts.save({
      id: _this.acctid,
      link: "Contract",
      data: model,
    }, function(val) {
      data.setValue(val);
      data.markClean({}, true);
    }, cb);
  }

  SalesInfoViewModel.prototype.num = function(first) {
    var _this = this;
    if (first) {
      _this._num = first;
    }
    // reset subnum
    _this._subnum = 1;
    //
    return strings.format("{0}.", _this._num++);
  };
  SalesInfoViewModel.prototype.subnum = function() {
    var _this = this;
    return strings.format("{0}.{1}.", _this._num - 1, _this._subnum++);
  };

  SalesInfoViewModel.prototype.refreshInvoice = function(cb) {
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
    dataservice.salessummaryvaloiceRefresh.save({
      data: data,
    }, null, utils.safeCallback(cb, function(err, resp) {
      // make sure this is the last response
      if (_this.currData === data) {
        _this.currData = null;
        _this.data.markClean(data, true);
        _this.invoiceGvm.list(resp.Value.Items);
      }
    }, function(err) {
      notify.error(err);
    }));
  };

  function load_installInvoice(acctid, setter, cb) {
    dataservice.api_ms.accounts.read({
      id: acctid,
      link: "Invoices/INSTALL",
      query: {
        canCreate: true,
      },
    }, setter, cb);
  }

  function load_msAccountSalesInformations(acctid, setter, cb) {
    dataservice.api_ms.accounts.read({
      id: acctid,
      link: "AccountSalesInformations",
    }, setter, cb);
  }

  function load_contract(acctid, setter, cb) {
    dataservice.api_ms.accounts.read({
      id: acctid,
      link: "Contract",
    }, setter, cb);
  }

  function load_customerAccount(acctid, customerTypeId, setter, cb) {
    dataservice.api_contractAdmin.accounts.read({
      id: acctid,
      link: strings.format("CustomerAccounts/{0}", customerTypeId),
    }, setter, cb);
  }

  function loadCreditScore(acctid, customerTypeId, observable, subjoin) {
    load_customerAccount(acctid, customerTypeId, function(custAcct) {
      if (custAcct) {
        load_qualifyCustomerInfos(custAcct.Customer.LeadId, function(creditResultAndStuff) {
          observable(Math.max(observable.peek(), creditResultAndStuff.Score));
        }, subjoin.add());
      }
    }, subjoin.add());
  }

  function load_qualifyCustomerInfos(leadID, setter, cb) {
    dataservice.qualify.qualifyCustomerInfos.read({
      id: leadID,
      link: "lead",
    }, setter, function(err, resp) {
      if (err && err.Code === 70110) { // item not found code
        // if the item was not found we just want null, not an error
        err = null;
        resp.Code = 0;
        resp.Message = "";
        // setter would not have been called so call it now
        setter(null);
      }
      cb(err, resp);
    });
  }

  function load_frequentlyInstalledEquipmentGet(setter, cb) {
    setter([]);
    dataservice.salessummary.frequentlyInstalledEquipmentGet.read({}, setter, cb);
  }

  function load_contractLengths(setter, cb) {
    dataservice.salessummary.contractLengthsGet.read({
      id: 1,
    }, setter, cb);
  }


  function showInvoiceItemsEditor(_this, invoiceItemGrp, itemId, salesrepId, cb) {
    _this.layersVm.show(createInvoiceItemsEditor(_this, invoiceItemGrp, itemId, salesrepId), createInvoiceItemsEditorCb(_this, cb));
  }

  function tryAddRep(_this, newRep) {
    function byCompanyId(rep) {
      return rep.CompanyId === newRep.CompanyId;
    }

    if (newRep && !_this.cache.reps.some(byCompanyId)) {
      _this.cache.reps.push(newRep);
    }
  }

  function createInvoiceItemsEditor(_this, invoiceItemGrp, itemId, salesrepId) {
    // put rep models into cache for invoice items editor
    tryAddRep(_this, _this.salesinfo.repModel.peek());
    tryAddRep(_this, _this.salesinfo.tekModel.peek());

    return new InvoiceItemsEditorViewModel({
      layersVm: _this.layersVm,
      invoice: _this.invoice(),
      cache: _this.cache,
      invoiceItemGrp: invoiceItemGrp,
      itemId: itemId,
      salesrepId: salesrepId,
    });
  }

  function createInvoiceItemsEditorCb(_this, cb) {
    return function(inv) {
      if (inv) {
        _this.invoice(inv);
      }
      if (utils.isFunc(cb)) {
        cb();
      }
    };
  }

  return SalesInfoViewModel;
});
