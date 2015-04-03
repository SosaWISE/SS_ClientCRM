define("src/contracts/contract.vm", [
  "src/app",
  "src/account/security/holds.vm",
  "src/account/security/emcontacts.vm",
  "src/account/security/equipment.gvm",
  "src/account/default/rep.find.vm",
  "src/account/security/clist.salesinfo.vm",
  "src/account/default/address.validate.vm",
  "src/account/default/runcredit.vm",
  "src/account/default/search.vm",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/layers.vm",
  "src/core/joiner",
  "src/core/combo.vm",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  app,
  HoldsViewModel,
  EmContactsViewModel,
  EquipmentGridViewModel,
  RepFindViewModel,
  CListSalesInfoViewModel,
  AddressValidateViewModel,
  RunCreditViewModel,
  SearchViewModel,
  dataservice,
  ukov,
  ko,
  LayersViewModel,
  joiner,
  ComboViewModel,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";
  var _static = {};

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

  // var priTitle = "Primary Customer";
  // var secTitle = "Secondary Customer";

  function ContractViewModel(options) {
    var _this = this;
    ContractViewModel.super_.call(_this, options);
    // utils.assertProps(_this, [
    // ]);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.list = _this.childs;
    _this.mayReload = ko.observable(false);
    _this.showNav = ko.observable(true); // && config.contracts.showNav);

    _this.rmr = ko.observable(_this.rmr);
    _this.hasRmr = ko.observable(_this.rmr() != null);

    _this.leads = [];
    addLeadVm(_this.leads, "PRI");
    addLeadVm(_this.leads, "SEC");
    addLeadVm(_this.leads, "MONI");
    addLeadVm(_this.leads, "BILL");
    _this.leadMap = {};
    _this.leads.forEach(function(leadVm) {
      _this.leadMap[leadVm.typeId] = leadVm;
    });

    _this.salesInfo = getSalesInfoModel();
    _this.salesInfoExtras = getSalesInfoExtrasModel(_this.layersVm);
    _this.systemDetails = getSystemDetailsModel();

    _this.systemDetailsExtras = {
      industry: ko.observable(),
      receiver: ko.observable(),
      submissionConf: ko.observable(),
      twoWayConf: ko.observable(),
    };

    _this.equipmentGvm = new EquipmentGridViewModel({
      byPart: true,
      edit: utils.noop,
    });

    _this.emcontactsVm = new EmContactsViewModel({
      layersVm: null,
    });

    _this.holdsVm = new HoldsViewModel({
      layersVm: _this.layersVm,
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };

    _this.repModel = {
      CompanyID: "SOSA001",
      TeamLocationId: 1,
      Seasons: [ //
        {
          SeasonID: 3,
        },
      ],
    };

    function canSave( /*busy*/ ) {
      var custAcctsCanSave = _this.leads.every(function(vm) {
        return !vm.leadRedo() && !vm.creditRedo();
      });
      return custAcctsCanSave && !_this.cmdSave.busy() && !_this.cmdSaveAndApprove.busy();
    }

    _this.cmdSave = ko.command(function(cb) {
      saveAll(_this, false, cb);
    }, canSave);
    _this.cmdSaveAndApprove = ko.command(function(cb) {
      saveAll(_this, true, cb);
    }, canSave);
    _this.cmdReset = ko.command(function(cb) {
      //
      _this.leads.forEach(function(leadVm) {
        resetCustomerAccountData(leadVm);
      });
      //
      _this.salesInfo.reset();
      _this.salesInfoExtras.reset();
      //
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy() && !_this.cmdSaveAndApprove.busy();
    });

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
        repModel: _this.repModel,
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
        repModel: _this.repModel,
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

    _this.clickUp = function(leadVm) {
      move(_this, leadVm, -1);
    };
    _this.clickDown = function(leadVm) {
      move(_this, leadVm, 1);
    };
    _this.clickDelete = function(leadVm) {
      clearVm(leadVm);
    };
    _this.clickReset = function(leadVm) {
      resetCustomerAccountData(leadVm);
    };

    _this.clickOpenCrm = function() {
      _this.goTo({
        route: "accounts",
        masterid: _this.masterid,
        id: _this.acctid,
      });
    };
  }
  utils.inherits(ContractViewModel, ControllerViewModel);
  ContractViewModel.prototype.viewTmpl = "tmpl-contracts-contract";

  ContractViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    var subjoin = join.create();

    _this.masterid = routeData.masterid;
    _this.acctid = routeData.id;

    load_localizations(_this, join.add());

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

    loadSalesInfo(_this, _this.acctid, _this.salesInfo, _this.salesInfoExtras, subjoin);

    load_systemDetails(_this.acctid, function(results) {
      _this.systemDetails.setValue(results);
      _this.systemDetails.markClean({}, true);
    }, join.add());
    load_industryAccountWithReceiverLines(_this.acctid, function(list) {
      list.some(function(item) {
        if (item.PrimaryCSID === "Yes") {
          _this.systemDetailsExtras.industry(item.IndustryAccount);
          _this.systemDetailsExtras.receiver(item.ReceiverNumber);
          return true;
        }
      });
    }, join.add());

    load_equipment(_this.acctid, _this.equipmentGvm, join.add());

    _this.emcontactsVm.loader.reset(); //incase of reload
    _this.emcontactsVm.load(routeData, extraData, join.add());

    _this.holdsVm.loader.reset(); //incase of reload
    _this.holdsVm.load(routeData, extraData, join.add());

    var cb = join.add();
    subjoin.when(function(err) {
      if (!err) {
        // try to set contract and noc dates
        var model = _this.salesInfoExtras;
        var contractDate = model.ContractSignedDate.getValue();
        if (!contractDate) {
          // default to credit result createdon
          var leadVm = _this.leads[0];
          if (leadVm) {
            var creditResult = leadVm.creditResult.peek();
            if (creditResult) {
              contractDate = creditResult.CreatedOn;
              model.ContractSignedDate.setValue(contractDate);
            }
          }
        }

        if (!model.NOCDate.getValue() && utils.isDate(contractDate)) {
          // default to 3 days(excluding weekends and holidays) after contract date
          load_nocDate(contractDate, function(val) {
            model.NOCDate.setValue(val.NOCDate);
          }, join.add());
        }
      }
      cb(err);
    });
  };

  function move(_this, leadVm, direction) {
    var index = _this.leads.indexOf(leadVm);
    var otherVm = _this.leads[index + direction];
    if (otherVm) {
      swapObservableValues(otherVm.address, leadVm.address);
      swapObservableValues(otherVm.lead, leadVm.lead);
      swapObservableValues(otherVm.creditResult, leadVm.creditResult);
    }
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

    if (!_this.salesInfo.isValid.peek()) {
      notify.warn(_this.salesInfo.errMsg(), null, 7);
      return cb();
    }
    if (!_this.salesInfoExtras.isValid.peek()) {
      notify.warn(_this.salesInfoExtras.errMsg(), null, 7);
      return cb();
    }
    if (!_this.systemDetails.isValid.peek()) {
      notify.warn(_this.systemDetails.errMsg(), null, 7);
      return cb();
    }

    var join = joiner();
    refreshInvoice(_this, join.add());
    saveSalesInfoExtras(_this, approve, join.add());
    saveSystemDetails(_this, join.add());

    // save leads one after the other (don't want to make multiple customers for the same lead)
    var index = 0;
    (function tryNextLead() {
      var leadVm = _this.leads[index++];
      if (!leadVm) {
        return; // no more leads
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

  function load_localizations(_this, cb) {
    _this.cache = _this.cache || {};
    _this.cache.localizations = [];
    dataservice.maincore.localizations.read({}, function(val) {
      _this.cache.localizations = val;
    }, cb);
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

  function swapObservableValues(a, b) {
    var temp = a.peek();
    a(b.peek());
    b(temp);
  }

  var emailDependsOnCellPackageItemIdVg = {
    keys: ["Email", "CellPackageItemId"],
    validators: [],
  };

  function getSalesInfoModel() {
    var schema = _static.ctSchema || (_static.ctSchema = {
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
    });

    var data = ukov.wrap({}, schema);

    data.CellularTypeCvm = new ComboViewModel({
      selectedValue: data.CellularTypeId,
      fields: {
        text: "CellularTypeName",
        value: "CellularTypeID",
      }
    });

    data.Over3MonthsCvm = new ComboViewModel({
      selectedValue: data.Over3Months,
      list: CListSalesInfoViewModel.prototype.over3MonthsOptions,
    });

    data.BillingDayCvm = new ComboViewModel({
      selectedValue: data.BillingDay,
      list: CListSalesInfoViewModel.prototype.billingDayOptions,
    });

    data.cellServiceCvm = new ComboViewModel({
      selectedValue: ko.observable(null),
      list: CListSalesInfoViewModel.prototype.cellServiceOptions,
    });
    data.CellPackageItemCvm = new ComboViewModel({
      selectedValue: data.CellPackageItemId,
      list: CListSalesInfoViewModel.prototype.cellPackageItemOptions,
    });

    data.pointSystemsCvm = new ComboViewModel({
      fields: {
        text: "TemplateName",
        value: "InvoiceTemplateID",
      }
    });
    data.ContractTemplatesCvm = new ComboViewModel({
      selectedValue: data.ContractTemplateId,
      fields: {
        text: "ContractName",
        value: "ContractTemplateID",
      }
    });

    data.pointSystemsCvm.selectedValue.subscribe(function(psValue) {
      // psValue can be null...
      if (!psValue) {
        return;
      }
      data.ContractTemplatesCvm.setList([]);
      dataservice.salessummary.contractLengthsGet.read({
        id: psValue,
      }, function(val) {
        // only set cl if same as current selected psValue
        if (data.pointSystemsCvm.selectedValue() === psValue) {
          data.ContractTemplatesCvm.setList(val);
        }
      }, notify.iferror);
    });

    data.cellularTypes = ko.observableArray();

    function cellServiceChanged(cellService) {
      // _this.isAlarmCom(cellService === "CELL_SRV_AC"); // Alarm.com

      var hasCell = !!cellService;
      // _this.hasCell(hasCell); // false if no cell package item
      if (hasCell) {
        // all if there is a cell service
        data.CellularTypeCvm.setList(data.cellularTypes.peek());
      } else {
        // only No Cell
        data.CellularTypeCvm.setList(data.cellularTypes.peek().filter(function(type) {
          return type.CellularTypeID === "NOCELL";
        }));
      }
      if (!data.CellularTypeCvm.selectedValue.peek()) {
        // select first item if one is not selected
        data.CellularTypeCvm.selectFirst();
      }

      // filter Cell Packages by the selected Cell Service
      data.CellPackageItemCvm.setList(CListSalesInfoViewModel.prototype.cellPackageItemOptions.filter(function(item) {
        return cellService && strings.startsWith(item.value, cellService);
      }));
      if (!data.CellPackageItemCvm.selectedValue.peek()) {
        // select first item if one is not selected
        data.CellPackageItemCvm.selectFirst();
      }
    }
    data.cellServiceCvm.selectedValue.subscribe(cellServiceChanged);
    cellServiceChanged();

    //
    function isTakeOverChanged(isTakeOver) {
      data.IsMoni.ignore(!isTakeOver, true);
    }
    data.IsTakeOver.subscribe(isTakeOverChanged);
    isTakeOverChanged();

    data.contractValue = ko.computed({
      deferEvaluation: true,
      read: function() {
        // subscribe to changes
        data.MonthlyMonitoringRateActual();
        data.ContractTemplateId();
        // calculate
        var item = data.ContractTemplatesCvm.selectedItem();
        if (!item) {
          return "";
        }
        return data.MonthlyMonitoringRateActual.getValue() * item.ContractLength;
      },
    });

    return data;
  }

  function getSalesInfoExtrasModel(layersVm) {
    var dateConverter = ukov.converters.date();
    var boolConverter = ukov.converters.bool();
    var schema = _static.sdSchema || (_static.sdSchema = {
      _model: true,
      // fields from MS_AccountSalesInformations
      // PaymentTypeId:{},
      FriendsAndFamilyTypeId: {},
      AccountSubmitId: {},
      AccountCancelReasonId: {},
      TechId: {},
      SalesRepId: {},
      // BillingDay:{},
      // Email:{},
      // IsMoni:{},
      // IsTakeOver:{},
      // IsOwner:{},
      InstallDate: {
        converter: dateConverter,
      },
      SubmittedToCSDate: {
        converter: dateConverter,
      },
      CsConfirmationNumber: {},
      CsTwoWayConfNumber: {},
      SubmittedToGPDate: {
        converter: dateConverter,
      },
      ContractSignedDate: {
        converter: dateConverter,
        validators: [
          ukov.validators.isRequired("Contract Date is Required"),
        ]
      },
      CancelDate: {
        converter: dateConverter,
      },
      // IsActive:{},
      // IsDeleted:{},
      // ModifiedOn:{},
      // ModifiedBy:{},
      // CreatedOn:{},
      // CreatedBy:{},

      AMA: {},
      NOC: {},
      SOP: {},

      ApprovedDate: {
        converter: dateConverter,
      },
      ApproverID: {},
      NOCDate: {
        converter: dateConverter,
        validators: [
          ukov.validators.isRequired("NOC Date is Required"),
        ]
      },

      OptOutCorporate: {
        converter: boolConverter,
      },
      OptOutAffiliate: {
        converter: boolConverter,
      },
    });

    var data = ukov.wrap({}, schema);

    data.repModel = ko.observable();
    data.tekModel = ko.observable();

    function createLoadRepFunc(modelSetter) {
      var lastid;
      return function(companyID) {
        lastid = companyID;
        if (lastid) {
          var item = modelSetter.peek();
          if (item && item.CompanyID === lastid) {
            // already loaded
            return;
          }
          // clear before loading new
          modelSetter(null);
          // load new
          loadRep(lastid, function(val) {
            if (val && val.CompanyID === lastid) {
              modelSetter(val);
            }
          });
        } else {
          // clear
          modelSetter(null);
        }
      };
    }

    data.SalesRepId.subscribe(createLoadRepFunc(data.repModel));
    data.TechId.subscribe(createLoadRepFunc(data.tekModel));

    function createFindFunc(modelSetter, idSetter) {
      return function() {
        if (!repFindVm) {
          repFindVm = new RepFindViewModel({});
        }
        layersVm.show(repFindVm, function(val) {
          if (val) {
            // set model before setting id so that it doesn't have to be loaded again
            modelSetter(val);
            idSetter(val.CompanyID);
          }
        });
      };
    }
    var repFindVm;
    data.clickRep = createFindFunc(data.repModel, data.SalesRepId);
    data.clickTek = createFindFunc(data.tekModel, data.TechId);

    return data;
  }

  function getSystemDetailsModel() {
    var schema = _static.systemDetailsSchema || (_static.systemDetailsSchema = {
      _model: true,
      AccountID: {},
      AccountPassword: {
        validators: [
          ukov.validators.isRequired("Password is Required"),
        ],
      },
      PanelTypeId: {},
      SystemTypeId: {},
      CellularTypeId: {},
      DslSeizureId: {},
    });

    var data = ukov.wrap({}, schema);

    return data;
  }

  function loadSalesInfo(_this, accountid, salesInfoModel, salesInfoExtrasModel, join) {
    var join_types = join.create();

    var customerEmail = null;

    //
    // 1 - load types
    //
    load_pointSystems(salesInfoModel.pointSystemsCvm, join_types.add());
    salesInfoModel.CellularTypeCvm.setList([]);
    load_cellularTypes(salesInfoModel.cellularTypes, join_types.add());

    //
    // 2 - load invoiceMsInstalls
    //
    var cb = join.add();
    join_types.after(function(err) {
      if (err) {
        return cb(err);
      }
      // continue loading if no error
      load_invoiceMsInstalls(accountid, function(invoice) {
        if (!invoice) {
          return;
        }
        load_msAccountSalesInformations(accountid, function(acctSalesInfo) {
          if (acctSalesInfo) {
            // infer Cell Service from Cell Package
            if (acctSalesInfo.CellPackageItemId) {
              //@NOTE: 11 is the current length of the service ids...
              salesInfoModel.cellServiceCvm.selectedValue(acctSalesInfo.CellPackageItemId.substr(0, 11));
            } else {
              salesInfoModel.cellServiceCvm.selectedValue(null);
            }

            // set both here instead of after loading invoice so the UI looks more fluid??
            // set invoice data
            salesInfoModel.setValue(invoice);
            // default to customer"s email
            acctSalesInfo.Email = acctSalesInfo.Email || customerEmail;
            // set sales info data
            salesInfoModel.setValue(acctSalesInfo);
            salesInfoExtrasModel.setValue(acctSalesInfo);
            // mark current values as the clean values
            // defaults below may make the invoice dirty
            salesInfoModel.markClean({}, true);
            salesInfoExtrasModel.markClean({}, true);


            // set defaults
            utils.setIfNull(acctSalesInfo, {
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
            salesInfoModel.setValue(acctSalesInfo);
            salesInfoExtrasModel.setValue(acctSalesInfo);
          }
        }, join.add());
      }, join.add());
      //
      cb();
    });
  }

  function loadRep(companyId, setter, cb) {
    dataservice.qualify.salesrep.read({
      id: companyId,
    }, setter, cb);
  }

  function load_pointSystems(cvm, cb) {
    cvm.setList([]);
    dataservice.salessummary.pointSystems.read({}, function(val) {
      cvm.setList(val);
      cvm.selectItem(cvm.list()[0]);
    }, cb);
  }

  function load_cellularTypes(setter, cb) {
    dataservice.salessummary.cellularTypes.read({}, setter, cb);
  }

  function load_invoiceMsInstalls(accountid, setter, cb) {
    dataservice.salessummary.invoiceMsIsntalls.read({
      id: accountid,
      link: "accountid"
    }, setter, cb);
  }

  function load_msAccountSalesInformations(accountid, setter, cb) {
    dataservice.monitoringstationsrv.msAccountSalesInformations.read({
      id: accountid,
    }, setter, cb);
  }

  function load_systemDetails(accountId, setter, cb) {
    dataservice.msaccountsetupsrv.systemDetails.read({
      id: accountId,
    }, setter, cb);
  }

  function load_nocDate(startDate, setter, cb) {
    dataservice.api_contractAdmin.helpers.read({
      id: "noc",
      link: strings.format("{0}-{1}-{2}",
        startDate.getUTCMonth() + 1, startDate.getUTCDate(), startDate.getUTCFullYear()),
    }, setter, cb);
  }

  function load_industryAccountWithReceiverLines(acctid, setter, cb) {
    dataservice.monitoringstationsrv.msAccounts.read({
      id: acctid,
      link: "IndustryAccountWithReceiverLines",
    }, setter, cb);
  }

  function load_equipment(acctid, gvm, cb) {
    gvm.list([]);
    dataservice.msaccountsetupsrv.accounts.read({
      id: acctid,
      link: "equipment",
    }, gvm.list, cb);
  }

  function refreshInvoice(_this, cb) {
    var data = _this.salesInfo;
    if (!utils.isFunc(cb)) {
      cb = utils.noop;
    }

    if (!data.isValid()) {
      notify.warn(data.errMsg(), null, 7);
      cb();
      return;
    }
    if (data.isClean()) {
      // nothing to save here
      cb();
      return;
    }
    var model = data.getValue(false, true);
    // // prevent multiple calls while waiting for first to return
    // if (underscore.isEqual(_this.currData, model)) {
    //   // no need to re-save the same model
    //   cb();
    //   return;
    // }
    // _this.currData = model;

    //@HACK: to save CellularTypeId
    model.CellTypeId = model.CellularTypeId;
    //@HACK: to save CellPackageItemId
    // model.AlarmComPackageId = model.CellPackageItemId;
    // delete model.CellPackageItemId;

    // console.log("currData:", JSON.stringify(_this.currData, null, "  "));
    dataservice.salessummary.invoiceRefresh.save({
      data: model,
    }, function( /*val*/ ) {
      // // make sure this is the last response
      // if (_this.currData === model) {
      _this.currData = null;
      data.markClean(model, true);
      // _this.partsGvm.list(val.Items);
      // }
    }, cb);
  }

  function saveSalesInfoExtras(_this, approve, cb) {
    var data = _this.salesInfoExtras;
    var model = data.getValue();
    if (approve) {
      model.ApprovedDate = new Date();
      model.ApproverID = app.user.peek().GPEmployeeID;
    }
    dataservice.api_contractAdmin.accountSalesInformationExtras.save({
      id: _this.acctid,
      data: model,
    }, function(val) {
      data.setValue(val, true);
      data.ApprovedDate(model.ApprovedDate);
      data.ApproverID(model.ApproverID);
      data.markClean(val, true);
    }, cb);
  }

  function saveSystemDetails(_this, cb) {
    var data = _this.systemDetails;
    var model = data.getValue();
    dataservice.msaccountsetupsrv.systemDetails.save({
      id: model.AccountID,
      data: model,
    }, function(val) {
      data.markClean(val, true);
    }, cb);
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


  return ContractViewModel;
});
