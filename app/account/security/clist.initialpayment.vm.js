define("src/account/security/clist.initialpayment.vm", [
  "src/account/mscache",
  "src/account/salesinfo/v02/salesinfo.model",
  "src/account/default/payby.vm",
  "src/account/default/address.validate.vm",
  "src/account/default/runcredit.vm",
  "dataservice",
  "ko",
  "src/ukov",
  "src/core/combo.vm",
  "src/core/joiner",
  "src/core/strings",
  "src/core/notify",
  "src/core/controller.vm",
  "src/core/utils",
], function(
  mscache,
  salesinfo_model,
  PayByViewModel,
  AddressValidateViewModel,
  RunCreditViewModel,
  dataservice,
  ko,
  ukov,
  ComboViewModel,
  joiner,
  strings,
  notify,
  ControllerViewModel,
  utils
) {
  "use strict";

  function CListInitialPaymentViewModel(options) {
    var _this = this;
    CListInitialPaymentViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["layersVm"]);

    _this.mayReload = ko.observable(false);
    _this.initHandler();

    // _this.breakdown = ko.observable();
    _this.initialPaymentMethod = ko.observable();
    _this.recurringSame = ko.observable(true);
    _this.paymentMethod = ko.observable();
    // _this.addressSame = ko.observable(true);
    _this.address = ko.observable();

    _this.leads = [];
    addLeadVm(_this.leads, "PRI");
    // addLeadVm(_this.leads, "SEC");
    // addLeadVm(_this.leads, "MONI");
    addLeadVm(_this.leads, "BILL");
    _this.leadMap = {};
    _this.leads.forEach(function(leadVm) {
      _this.leadMap[leadVm.typeId] = leadVm;
    });

    _this.salesinfo = salesinfo_model({
      layersVm: _this.layersVm,
      handler: _this.handler,
      yesNoOptions: _this.yesNoOptions,
    });


    //
    // events
    //
    _this.cmdRecurringPaymentMethod = ko.command(function(cb) {
      showPaymentMethod(_this, _this.paymentMethod, cb);
    }, function(busy) {
      return !busy && !_this.recurringSame();
    });

    //
    // @REVIEW: All events below were copied from contract.vm.js...
    // @REVIEW: Some day in the future it should all be refactored...
    //
    function canSave( /*busy*/ ) {
      var custAcctsCanSave = _this.leads.every(function(vm) {
        return !vm.leadRedo() && !vm.creditRedo();
      });
      return custAcctsCanSave && !_this.cmdSave.busy(); // && !_this.cmdSaveAndApprove.busy();
    }

    _this.cmdSave = ko.command(function(cb) {
      saveAll(_this, false, cb);
    }, canSave);
    _this.clickAddressEmpty = function(leadVm) {
      if (leadVm.empty.peek()) {
        _this.clickAddress(leadVm);
      }
    };
    _this.clickAddressNotEmpty = function(leadVm) {
      if (!leadVm.empty.peek()) {
        _this.clickAddress(leadVm);
      }
    };
    _this.clickAddress = function(leadVm) {
      var repModel = _this.salesinfo.repModel.peek();
      if (!repModel) {
        notify.warn("Please select a Sales Rep first", null, 7);
        return;
      }
      var address = utils.clone(leadVm.address.peek());
      var uniqueMap = {};
      var otherAddresses = _this.leads
        .filter(function(vm) {
          // has an address
          return !!vm.address.peek();
        })
        .filter(function(vm) {
          // remove doops
          var id = vm.address.peek().AddressID;
          if (!uniqueMap[id]) {
            uniqueMap[id] = true;
            return true;
          }
        })
        // .filter(function(vm) {
        //   // exclude self
        //   return !address || vm.address.peek().AddressID !== address.AddressID;
        // })
        .map(function(vm) {
          return {
            typeId: vm.typeId,
            name: vm.addressTypeName,
            // name: vm.typeName,
            address: vm.address.peek(),
          };
        });
      var vm = new AddressValidateViewModel({
        name: leadVm.addressTypeName,
        otherAddresses: otherAddresses,
        repModel: repModel,
        item: address,
      });
      _this.layersVm.show(vm, function(address) {
        if (!address) {
          return;
        }
        leadVm.address(address);
      });
    };
    _this.clickQualify = function(leadVm) {
      var repModel = _this.salesinfo.repModel.peek();
      if (!repModel) {
        notify.warn("Please select a Sales Rep first", null, 7);
        return;
      }
      var lead = utils.clone(leadVm.lead.peek());
      var addressId = leadVm.address.peek().AddressID;
      if (!addressId) {
        notify.warn("Please add an address first", null, 7);
        return;
      }
      // var mcAddressID = leadVm.address.peek().AddressID;
      var uniqueMap = {};
      var otherLeads = _this.leads
        .filter(function(vm) {
          // has a lead and a credit result
          return vm.lead.peek() && vm.creditResult.peek();
        })
        .filter(function(vm) {
          // has the same address
          var address = vm.address.peek();
          return address && address.AddressID === addressId;
        })
        .filter(function(vm) {
          // remove doops
          var id = vm.lead.peek().LeadID;
          if (!uniqueMap[id]) {
            uniqueMap[id] = true;
            return true;
          }
        })
        // .filter(function(vm) {
        //   // exclude self
        //   return !lead || vm.lead.peek().LeadID !== lead.LeadID;
        // })
        .map(function(vm) {
          return {
            typeId: vm.typeId,
            name: vm.typeName,
            lead: vm.lead.peek(),
            creditResult: vm.creditResult.peek(),
          };
        });
      var routeData = _this.getRouteData();
      var masterid = routeData.masterid;
      var vm = new RunCreditViewModel({
        createMasterLead: false,
        showSaveBtn: true,
        otherLeads: otherLeads,
        cache: _this.cache,
        repModel: repModel,
        addressId: addressId,
        customerTypeId: leadVm.typeId,
        customerTypeName: leadVm.typeName,
        item: lead,
        customerMasterFileId: (masterid > 0) ? masterid : 0,
        handleUseLead: function(item, cb) {
          cb();
        }
      });
      _this.layersVm.show(vm, function(lead, creditResultAndStuff) {
        if (lead) {
          setLeadData(leadVm, lead, toCreditResult(creditResultAndStuff));
        }
      });
    };

    _this.clickPaymentMethod = function() {
      showPaymentMethod(_this, _this.initialPaymentMethod);
    };
  }
  utils.inherits(CListInitialPaymentViewModel, ControllerViewModel);
  CListInitialPaymentViewModel.prototype.viewTmpl = "tmpl-security-clist_initialpayment";

  CListInitialPaymentViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.acctid = routeData.id;

    function step1(cb) {
      // when done, start next step, then call callback
      var subjoin = join.create()
        .after(function(err) {
          if (!err) {
            step2(join.add());
          }
        }).after(cb);
      //
      mscache.ensure("localizations");
      //
      _this.salesinfo.load(subjoin.add());
      load_acctPaymentMethod(_this.acctid, "InitialPaymentMethod", _this.initialPaymentMethod, subjoin.add());
      load_acctPaymentMethod(_this.acctid, "PaymentMethod", function(val) {
        _this.paymentMethod(val);
        _this.recurringSame(!val);
      }, subjoin.add());
    }

    function step2(cb) {
      // when done, start next step, then call callback
      var subjoin = join.create()
        // .after(function(err) {
        //   if (!err) {
        //     step3(join.add());
        //   }
        // })
        .after(cb);

      //
      load_msAccountSalesInformations(_this.acctid, function(val) {
        _this.salesinfo.setValue(val);
        _this.salesinfo.markClean({}, true);
        // setPrevPkg(_this, _this.salesinfo.AccountPackageCvm.selectedItem());
      }, subjoin.add());

      // load leads for master file
      _this.leads.forEach(function(leadVm) {
        // clear incase of reload
        clearVm(leadVm);

        var customerTypeId = leadVm.typeId;
        load_customerAccount(_this.acctid, customerTypeId, function(custAcct) {
          if (!custAcct) {
            return;
          }

          // load credit and stuff
          load_qualifyCustomerInfos(custAcct.Customer.LeadId, function(creditResultAndStuff) {
            // set original data
            var mcAddress = custAcct.Address;
            var customer = custAcct.Customer;
            leadVm._original = {
              address: toQlAddress(mcAddress),
              lead: toLead(customer, mcAddress),
              creditResult: toCreditResult(creditResultAndStuff),
            };
            resetCustomerAccountData(leadVm);
          }, subjoin.add());
        }, subjoin.add());
      });
    }

    // start at first step
    step1(join.add());
  };

  function load_msAccountSalesInformations(acctid, setter, cb) {
    dataservice.api_ms.accounts.read({
      id: acctid,
      link: "AccountSalesInformations",
    }, setter, cb);
  }

  //
  // @REVIEW: Everything below was copied from contract.vm.js...
  // @REVIEW: Some day in the future it should all be refactored...
  //

  var typeIdMaps = {
    PRI: "Primary",
    SEC: "Secondary",
    MONI: "Monitored",
    BILL: "Billing",
  };
  typeIdMaps.LEAD = typeIdMaps.PRI;

  var addressTypeIdMaps = {
    PRI: typeIdMaps.PRI,
    SEC: typeIdMaps.SEC,
    MONI: "Premise",
    BILL: typeIdMaps.BILL,
  };

  function showPaymentMethod(_this, paymentMethodObservable, cb) {
    var vm = new PayByViewModel({
      item: utils.clone(paymentMethodObservable.peek()),
    });
    _this.layersVm.show(vm, function(result) {
      if (result) {
        paymentMethodObservable(result);
      }
      if (utils.isFunc(cb)) {
        cb();
      }
    });
  }

  function saveAll(_this, approve, cb) {
    var invalid = _this.leads.some(function(leadVm) {
      if (!leadVm.address.peek()) {
        return;
      }
      var typeId = leadVm.typeId;
      if (typeId === "PRI" || typeId === "SEC") {
        if (!leadVm.lead() ||
          !leadVm.creditResult() ||
          leadVm.leadRedo.peek() ||
          leadVm.creditRedo.peek()) {
          notify.warn("Primary and secondary customers need a credit report", null, 7);
          return true;
        }
      } else {
        if (!leadVm.lead() ||
          leadVm.leadRedo.peek()) {
          notify.warn("There are incomplete customers", null, 7);
          return true;
        }
      }
    });
    if (invalid) {
      return cb();
    }

    // if (!_this.salesInfo.isValid.peek()) {
    //   notify.warn(_this.salesInfo.errMsg(), null, 7);
    //   return cb();
    // }
    // if (!_this.salesinfo.isValid.peek()) {
    //   notify.warn(_this.salesinfo.errMsg(), null, 7);
    //   return cb();
    // }
    // if (!_this.systemDetails.isValid.peek()) {
    //   notify.warn(_this.systemDetails.errMsg(), null, 7);
    //   return cb();
    // }
    if (!_this.initialPaymentMethod.peek()) {
      notify.warn("Please enter an initial payment method", null, 7);
      return cb();
    }
    var recurringSame = _this.recurringSame.peek();
    if (!recurringSame && !_this.paymentMethod.peek()) {
      notify.warn("Please enter a payment method", null, 7);
      return cb();
    }

    var join = joiner();
    // refreshInvoice(_this, join.add());
    // saveSalesInfoExtras(_this, approve, join.add());
    // saveSystemDetails(_this, join.add());
    var initialPaymentMethod = _this.initialPaymentMethod.peek();
    savePaymentMethod(_this, initialPaymentMethod, "InitialPaymentMethod", _this.initialPaymentMethod, join.add());
    var paymentMethod = _this.paymentMethod.peek();
    if (recurringSame) {
      // copy initial but ensure the IDs are different
      paymentMethod = utils.clone(initialPaymentMethod);
      paymentMethod.ID = 0;
    }
    savePaymentMethod(_this, paymentMethod, "PaymentMethod", _this.paymentMethod, join.add());

    // save leads one after the other (do not want to make multiple customers for the same lead)
    var index = 0;
    (function tryNextLead() {
      var leadVm = _this.leads[index++];
      if (!leadVm) {
        return; // no more leads
      }
      // only save bill
      if (leadVm.typeId !== "BILL") {
        tryNextLead();
        return;
      }
      //
      var lead = leadVm.lead.peek();
      var leadid = lead ? lead.LeadID : null;
      updateCustomerAccount(_this.acctid, leadVm.typeId, leadid, function() {
        // update original
        leadVm._original = {
          address: leadVm.address.peek(),
          lead: leadVm.lead.peek(),
          creditResult: leadVm.creditResult.peek(),
        };
        clearVm(leadVm);
        resetCustomerAccountData(leadVm);

        //
        tryNextLead();
      }, join.add());
    })();

    join.when(cb);
  }

  function load_customerAccount(acctid, customerTypeId, setter, cb) {
    dataservice.api_contractAdmin.accounts.read({
      id: acctid,
      link: strings.format("CustomerAccounts/{0}", customerTypeId),
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
        // setter would not have been called so call it now
        setter(null);
      }
      cb(err, resp);
    });
  }

  function load_acctPaymentMethod(acctid, link, setter, cb) {
    dataservice.api_ms.accounts.read({
      id: acctid,
      link: link,
    }, setter, cb);
  }

  function addLeadVm(leads, typeId) {
    var vm = {
      typeId: typeId,
      typeName: typeIdMaps[typeId] || typeId,
      addressTypeName: addressTypeIdMaps[typeId] || typeId,
      address: ko.observable(),
      addressSameAs: ko.computed({
        deferEvaluation: true, // wait for all leads to be added
        read: function() {
          var typeId;
          leads.some(function(leadVm) {
            if (leadVm === vm) {
              // stop looking once we have found ourself since
              // references can only point to a previous lead
              return true;
            }
            var address1 = vm.address();
            var address2 = leadVm.address();
            if (address1 && address2 && address1.AddressID === address2.AddressID) {
              typeId = leadVm.typeId;
              return true;
            }
          });
          return typeId;
        },
      }),
      addressSameAsText: ko.computed({
        deferEvaluation: true,
        read: function() {
          var typeId = vm.addressSameAs();
          if (typeId) {
            return strings.format("Same as {0} Address", addressTypeIdMaps[typeId] || typeId);
          }
        },
      }),
      lead: ko.observable(),
      leadSameAs: ko.computed({
        deferEvaluation: true,
        read: function() {
          var typeId;
          leads.some(function(leadVm) {
            if (leadVm === vm) {
              // stop looking once we have found ourself since
              // references can only point to a previous lead
              return true;
            }
            var lead1 = vm.lead();
            var lead2 = leadVm.lead();
            if (lead1 && lead2 && lead1.LeadID === lead2.LeadID) {
              typeId = leadVm.typeId;
              return true;
            }
          });
          return typeId;
        },
      }),
      leadSameAsText: ko.computed({
        deferEvaluation: true,
        read: function() {
          var typeId = vm.leadSameAs();
          if (typeId) {
            return strings.format("Same as {0} Customer", typeIdMaps[typeId] || typeId);
          }
        },
      }),
      leadRedo: ko.computed({
        deferEvaluation: true,
        read: function() {
          var address = vm.address();
          var lead = vm.lead();
          if (address && lead) {
            return address.AddressID !== lead.AddressId;
          }
        },
      }),
      creditResult: ko.observable(),
      creditRedo: ko.computed({
        deferEvaluation: true,
        read: function() {
          var lead = vm.lead();
          var credit = vm.creditResult();
          return lead && credit && lead.LeadID !== credit.LeadId;
        },
      }),
      empty: ko.computed({
        deferEvaluation: true,
        read: function() {
          return !vm.address() && !vm.lead();
        },
      }),
      isDirty: ko.computed({
        deferEvaluation: true,
        read: function() {
          //
          var orig = vm._original || {};
          var oaddress = orig.address || {};
          var olead = orig.lead || {};
          var ocreditResult = orig.creditResult || {};
          //
          var address = vm.address() || {};
          var lead = vm.lead() || {};
          var creditResult = vm.creditResult() || {};
          //
          var dirty = (
            oaddress.AddressID !== address.AddressID ||
            olead.LeadID !== lead.LeadID ||
            ocreditResult.LeadId !== creditResult.LeadId
          );
          if (!dirty) {

          }
          return dirty;
        },
      }),
    };
    leads.push(vm);
  }

  function resetCustomerAccountData(leadVm) {
    var orig = leadVm._original || {};
    leadVm.address(orig.address || null);
    setLeadData(leadVm, orig.lead, orig.creditResult);
  }

  function setLeadData(leadVm, lead, creditResult) {
    // set lead
    if (lead) {
      lead.CustomerName = getLeadName(lead);
    }
    leadVm.lead(lead || null);
    leadVm.creditResult(creditResult || null);
  }

  function clearVm(leadVm) {
    leadVm.address(null);
    leadVm.lead(null);
    leadVm.creditResult(null);
  }

  function toQlAddress(mcAddress) {
    // map mcAddress to qlAddress
    return {
      AddressID: mcAddress.QlAddressId,
      DealerId: mcAddress.DealerId,
      ValidationVendorId: mcAddress.ValidationVendorId,
      AddressValidationStateId: mcAddress.AddressValidationStateId,
      StateId: mcAddress.StateId,
      CountryId: mcAddress.CountryId,
      TimeZoneId: mcAddress.TimeZoneId,
      AddressTypeId: mcAddress.AddressTypeId,
      StreetAddress: mcAddress.StreetAddress,
      StreetAddress2: mcAddress.StreetAddress2,
      StreetNumber: mcAddress.StreetNumber,
      StreetName: mcAddress.StreetName,
      StreetType: mcAddress.StreetType,
      PreDirectional: mcAddress.PreDirectional,
      PostDirectional: mcAddress.PostDirectional,
      Extension: mcAddress.Extension,
      ExtensionNumber: mcAddress.ExtensionNumber,
      County: mcAddress.County,
      CountyCode: mcAddress.CountyCode,
      Urbanization: mcAddress.Urbanization,
      UrbanizationCode: mcAddress.UrbanizationCode,
      City: mcAddress.City,
      PostalCode: mcAddress.PostalCode,
      PlusFour: mcAddress.PlusFour,
      Phone: mcAddress.Phone,
      DeliveryPoint: mcAddress.DeliveryPoint,
      CrossStreet: mcAddress.CrossStreet,
      Latitude: mcAddress.Latitude,
      Longitude: mcAddress.Longitude,
      CongressionalDistric: mcAddress.CongressionalDistric,
      DPV: mcAddress.DPV,
      DPVResponse: mcAddress.DPVResponse,
      DPVFootnote: mcAddress.DPVFootNote || mcAddress.DPVFootnote,
      CarrierRoute: mcAddress.CarrierRoute,
      IsActive: mcAddress.IsActive,
      IsDeleted: mcAddress.IsDeleted,
    };
  }

  function toLead(customer, mcAddress) {
    // map customer to lead
    return {
      LeadID: customer.LeadId,
      AddressId: mcAddress.QlAddressId,
      CustomerTypeId: customer.CustomerTypeId,
      CustomerMasterFileId: customer.CustomerMasterFileId,
      DealerId: customer.DealerId,
      LocalizationId: customer.LocalizationId,
      Salutation: customer.Prefix,
      FirstName: customer.FirstName,
      MiddleName: customer.MiddleName,
      LastName: customer.LastName,
      Suffix: customer.Postfix,
      Gender: customer.Gender,
      PhoneHome: customer.PhoneHome,
      PhoneWork: customer.PhoneWork,
      PhoneMobile: customer.PhoneMobile,
      Email: customer.Email,
      DOB: customer.DOB,
      SSN: customer.SSN,
      IsActive: customer.IsActive,
      IsDeleted: customer.IsDeleted,
    };
  }

  function toCreditResult(creditResultAndStuff) {
    if (!creditResultAndStuff) { // || !creditResultAndStuff.IsHit) {
      return null;
    }
    return {
      LeadId: creditResultAndStuff.LeadId || creditResultAndStuff.LeadID,
      IsHit: creditResultAndStuff.IsHit,
      CreditGroup: creditResultAndStuff.CreditGroup,
      BureauName: creditResultAndStuff.BureauName,
      CreatedOn: creditResultAndStuff.CreditCreatedOn || new Date(),
    };
  }

  function getLeadName(data) {
    return strings.joinTrimmed(" ", data.Salutation, data.FirstName, data.MiddleName, data.LastName, data.Suffix);
  }

  function savePaymentMethod(_this, model, link, setter, cb) {
    //
    model.ID = model.ID || 0;
    model.ModifiedOn = model.ModifiedOn || new Date();
    //
    dataservice.api_ms.accounts.save({
      id: _this.acctid,
      link: link,
      data: model,
    }, setter, cb);
  }

  function updateCustomerAccount(acctid, customerTypeId, leadid, setter, cb) {
    if (leadid) {
      saveCustomerAccount(acctid, customerTypeId, leadid, setter, cb);
    } else {
      deleteCustomerAccount(acctid, customerTypeId, setter, cb);
    }
  }

  function saveCustomerAccount(acctid, customerTypeId, leadid, setter, cb) {
    dataservice.api_contractAdmin.accounts.save({
      id: acctid,
      link: strings.format("CustomerAccounts/{0}", customerTypeId),
      data: {
        LeadId: leadid,
      },
    }, setter, cb);
  }

  function deleteCustomerAccount(acctid, customerTypeId, setter, cb) {
    dataservice.api_contractAdmin.accounts.del({
      id: acctid,
      link: strings.format("CustomerAccounts/{0}", customerTypeId),
    }, setter, cb);
  }

  return CListInitialPaymentViewModel;
});
