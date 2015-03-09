define("src/account/security/clist.qualify.vm", [
  "src/dataservice",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
  "src/account/default/rep.find.vm",
  "src/account/default/address.validate.vm",
  "src/account/default/runcredit.vm",
  "ko"
], function(
  dataservice,
  strings,
  notify,
  utils,
  ControllerViewModel,
  RepFindViewModel,
  AddressValidateViewModel,
  RunCreditViewModel,
  ko
) {
  "use strict";

  var typeIdMaps = {
    PRI: "Primary",
    SEC: "Secondary",
    SHIP: "Monitored",
  };
  typeIdMaps.LEAD = typeIdMaps.PRI;

  function CListQualifyViewModel(options) {
    var _this = this;
    CListQualifyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["layersVm"]);

    _this.mayReload = ko.observable(false);
    _this.title = ko.observable(_this.title);

    _this.repModel = ko.observable();
    _this.leads = [
      createLeadVm(_this, "PRI"),
      createLeadVm(_this, "SEC"),
      createLeadVm(_this, "SHIP", "(If different than Primary)"),
    ];
    _this.leadMap = {};
    _this.leads.forEach(function(leadVm) {
      _this.leadMap[leadVm.typeId] = leadVm;
    });

    //
    // events
    //
    _this.cmdFindRep = ko.command(function(cb) {
      var vm = new RepFindViewModel({});
      _this.layersVm.show(vm, function(val) {
        cb();
        _this.repModel(val);
      });
    }, function(busy) {
      return !busy && !_this.repModel();
    });
    _this.cmdAddress = ko.command(function(cb, leadVm) {
      if (isLeadReadOnly(leadVm)) {
        notify.warn(leadVm.typeName + " address is no longer editable", null, 7);
        return cb();
      }
      var otherAddresses = _this.leads.filter(isLeadReadOnly).map(function(vm) {
        return {
          typeId: vm.typeId,
          name: vm.typeName,
          address: vm.address.peek(),
        };
      });
      var vm = new AddressValidateViewModel({
        otherAddresses: otherAddresses,
        repModel: _this.repModel(),
        item: utils.clone(leadVm.address.peek()),
      });
      _this.layersVm.show(vm, function(val) {
        cb();
        if (val) {
          leadVm.address(val);
        }
      });
    }, function(busy) {
      return !busy && _this.repModel();
    });
    _this.cmdQualify = ko.command(function(cb, leadVm) {
      if (isLeadReadOnly(leadVm)) {
        notify.warn(leadVm.typeName + " customer is no longer editable", null, 7);
        return cb();
      }
      var routeData = _this.getRouteData();
      var masterid = routeData.masterid;
      var vm = new RunCreditViewModel({
        cache: _this.cache,
        repModel: _this.repModel(),
        addressId: leadVm.address().AddressID,
        customerTypeId: leadVm.typeId,
        item: utils.clone(leadVm.lead.peek()),
        customerMasterFileId: (masterid > 0) ? masterid : 0,
      });
      _this.layersVm.show(vm, function(lead, creditResult) {
        cb();
        if (!lead) {
          return;
        }
        setCustomerData(leadVm, lead, creditResult);
        if (masterid !== lead.CustomerMasterFileId) {
          //
          // when a CustomerMasterFileId is created
          // set it on the parent and update the url
          //
          _this.pcontroller.id = lead.CustomerMasterFileId;
          _this.pcontroller.title(lead.CustomerMasterFileId);
          _this.goTo(_this.getRouteData());
        }
      });
    }, function(busy) {
      return !busy && _this.repModel();
    });
    _this.cmdSendToIS = ko.command(function(cb, leadVm) {
      if (!leadVm.creditResult()) {
        notify.warn("No credit result", null, 7);
        return cb();
      }
      dataservice.qualify.insideSales.save({
        id: leadVm.creditResult().LeadId,
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (resp.Message && resp.Message !== "Success") {
          notify.error(resp, 3);
        }
      }, notify.iferror));
    });

    _this.cmdCreateAccount = ko.command(function(cb) {
      var primary = _this.leadMap.PRI;
      dataservice.msaccountsetupsrv.accounts.post(null, {
        CustomerMasterFileId: primary.lead.peek().CustomerMasterFileId,
      }, function(val) {
        var checklistVm = _this.pcontroller;
        if (checklistVm.close() > -1) {
          _this.goTo({
            route: "accounts",
            masterid: val.CustomerMasterFileId,
            id: val.AccountID,
            tab: "checklist",
            p1: "salesinfo",
          }, {
            checklist: checklistVm,
          });

          _this.hasCustomer = true;
        } else {
          notify.warn("unable to close??");
        }
      }, cb);
    }, function(busy) {
      var primary = _this.leadMap.PRI;
      return !busy && !_this.hasCustomer && primary.lead() && primary.creditResult();
    });

    _this.clickRemoveAddress = function(leadVm) {
      if (leadVm.lead.peek()) {
        notify.warn("Address cannot be removed", null, 7);
        return;
      }
      notify.confirm("Remove address?", "Are you sure you want remove this address?", function(result) {
        if (result === "yes") {
          leadVm.address(null);
        }
      });
    };
  }
  utils.inherits(CListQualifyViewModel, ControllerViewModel);
  CListQualifyViewModel.prototype.viewTmpl = "tmpl-security-clist_qualify";

  CListQualifyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      id = routeData.masterid;

    load_localizations(_this, join.add());

    if (id <= 0) {
      // lead not saved yet
      return;
    }

    // load leads for master file
    _this.leads.forEach(function(leadVm) {
      var customerTypeId = leadVm.typeId;
      load_leadInfo(id, customerTypeId, function(lead) {
        if (!lead) {
          return;
        }

        // load credit and stuff
        load_qualifyCustomerInfos(lead.LeadID, function(creditResultAndStuff) {
          // set data
          setCustomerData(leadVm, lead, creditResultAndStuff);

          // load address
          dataservice.qualify.addressValidation.read({
            id: creditResultAndStuff.AddressID,
          }, function(address) {
            // normalize data
            address.PhoneNumber = address.PhoneNumber || creditResultAndStuff.Phone;
            address.TimeZone = address.TimeZone || creditResultAndStuff.TimeZoneName;
            // set address
            leadVm.address(address);
          }, join.add());
        }, join.add());

        // use primary lead to find SalesRep...
        if (customerTypeId === "PRI") {
          // load sales rep
          dataservice.qualify.salesrep.read({
            id: lead.SalesRepId,
          }, _this.repModel, join.add());
        }
      }, join.add());
    });
  };

  function load_localizations(_this, cb) {
    _this.cache = _this.cache || {};
    _this.cache.localizations = [];
    dataservice.maincore.localizations.read({}, function(val) {
      _this.cache.localizations = val;
    }, cb);
  }

  function load_leadInfo(masterid, customerTypeId, setter, cb) {
    dataservice.qualify.customerMasterFiles.read({
      id: masterid,
      link: "leads/" + customerTypeId,
    }, setter, cb);
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
        // setter wouldn't have been called so call it now
        setter(null);
      }
      cb(err, resp);
    });
  }

  function createLeadVm(_this, typeId) {
    return {
      typeId: typeId,
      typeName: typeIdMaps[typeId] || typeId,
      address: ko.observable(),
      lead: ko.observable(),
      creditResult: ko.observable(),
    };
  }

  function setCustomerData(cust, lead, creditResultAndStuff) {
    // set customer
    lead.CustomerName = getCustomerName(lead);
    cust.lead(lead);

    // set credit
    if (!creditResultAndStuff) { // || !creditResultAndStuff.IsHit) {
      cust.creditResult(null);
    } else {
      cust.creditResult({
        LeadId: creditResultAndStuff.LeadID,
        IsHit: creditResultAndStuff.IsHit,
        CreditGroup: creditResultAndStuff.CreditGroup,
        BureauName: creditResultAndStuff.BureauName,
      });
    }
  }

  function getCustomerName(data) {
    return strings.joinTrimmed(" ", data.Salutation, data.FirstName, data.MiddleName, data.LastName, data.Suffix);
  }

  function isLeadReadOnly(leadVm) {
    return !!leadVm.creditResult.peek();
  }

  return CListQualifyViewModel;
});
