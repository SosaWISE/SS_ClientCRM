define("src/account/default/runcredit.vm", [
  "src/account/accounts-cache",
  "howie",
  "src/core/handler",
  "src/core/strings",
  "src/core/combo.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
  "jquery",
  "ko",
  "src/ukov",
  "src/dataservice"
], function(
  accountscache,
  howie,
  Handler,
  strings,
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  jquery,
  ko,
  ukov,
  dataservice
) {
  "use strict";

  // -- Credit Score Group
  ko.bindingHandlers.crg = {
    update: function(element, valueAccessor) {
      var cls, creditGroup = valueAccessor();
      switch (creditGroup) {
        case "Excellent":
        case "Good":
        case "Sub":
        case "Poor":
          cls = creditGroup.toLowerCase();
          break;
        default:
          cls = "blank";
          break;
      }
      jquery(element).addClass(cls);
    }
  };
  // -- Credit Score Status
  ko.bindingHandlers.crs = {
    update: function(element, valueAccessor) {
      var newText,
        creditStatus = valueAccessor();
      if (creditStatus) {
        newText = "Report Found";
      } else {
        newText = "Report Not Found";
      }
      jquery(element).html(newText);
    }
  };

  var schema,
    max20 = ukov.validators.maxLength(20),
    max25 = ukov.validators.maxLength(25),
    max50 = ukov.validators.maxLength(50),
    max256 = ukov.validators.maxLength(256),
    strConverter = ukov.converters.string(),
    nullStrConverter = ukov.converters.nullString(),
    validationGroup;

  validationGroup = {
    keys: ["SSN", "DOB", ],
    validators: [ //
      function(val) {
        if (!val.SSN && !val.DOB) {
          return "A valid Social Security # OR a valid Date of Birth must be provided";
        }
      },
    ]
  };

  schema = {
    _model: true,
    CreateMasterLead: {},
    LeadID: {},
    AddressId: {
      converters: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired("AddressId is required"),
      ],
    },
    CustomerTypeId: {},
    CustomerMasterFileId: {},
    DealerId: {},
    LocalizationId: {
      converter: strConverter,
      validators: [max20],
    },
    TeamLocationId: {},
    SeasonId: {},
    SalesRepId: {
      converter: strConverter,
      validators: [max25],
    },
    LeadSourceId: {},
    LeadDispositionId: {},
    // LeadDispositionDateChange: {},
    Salutation: {
      converter: nullStrConverter,
      validators: [max50],
    },
    FirstName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired("First name is required"),
        max50
      ],
    },
    MiddleName: {
      converter: strConverter,
      validators: [max50],
    },
    LastName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired("Last name is required"),
        max50
      ],
    },
    Suffix: {
      converter: nullStrConverter,
      validators: [max50],
    },
    Gender: {},
    SSN: {
      converter: ukov.converters.ssn(),
      validationGroup: validationGroup,
    },
    DOB: {
      converter: ukov.converters.date(),
      validators: [
        ukov.validators.minAge(false, 0, "Credit cannot be run on the unborn"),
      ],
      validationGroup: validationGroup,
    },
    DL: {},
    DLStateID: {},
    Email: {
      converter: strConverter,
      validators: [max256, ukov.validators.isEmail()],
    },
    PhoneWork: {},
    PhoneMobile: {},
    PhoneHome: {},
    ProductSkwId: {},
  };

  function RunCreditViewModel(options) {
    var _this = this;
    RunCreditViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "addressId",
      "customerTypeId",
      "customerTypeName",
      "repModel",
    ]);
    utils.setIfNull(_this, {
      otherLeads: [],
      createMasterLead: true,
      showSaveBtn: false,
    });
    _this.mixinLoad();
    _this.handler = new Handler();

    if (indexOfLead(_this.otherLeads, _this.item) > -1) {
      removeLead(_this.otherLeads, _this.item);
      _this.item.LeadID = 0;
    }

    _this.item = _this.item || {
      CreateMasterLead: _this.createMasterLead,
      CustomerTypeId: _this.customerTypeId,
      CustomerMasterFileId: _this.customerMasterFileId,
      LocalizationId: "",
      // Salutation: "",
      FirstName: "",
      MiddleName: "",
      LastName: "",
      // Suffix: "",
      Gender: "",
      SSN: "",
      DOB: "",
      Email: "",
      ProductSkwId: "HSSS001" // *OPTIONAL  it will default to "HSSS001" if not passed.  This Prodcut Skw is for an alarm system.  Depending on what type of lead we are creating you would pass the appropriate Product Skw.
    };
    //
    _this.item.LeadSourceId = _this.item.LeadSourceId || howie.fetch("config").leadSourceId;
    _this.item.LeadDispositionId = _this.item.LeadDispositionId || howie.fetch("config").leadDispositionId;
    _this.item.DealerId = _this.item.DealerId || howie.fetch("user").DealerId;
    //
    _this.item.SalesRepId = _this.item.SalesRepId || _this.repModel.CompanyID;
    _this.item.TeamLocationId = _this.item.TeamLocationId || _this.repModel.TeamLocationId;
    _this.item.SeasonId = _this.item.SeasonId || _this.repModel.Seasons[0].SeasonID;

    _this.initFocusFirst();
    _this.leadResult = ko.observable(null);
    _this.creditResult = ko.observable(null);
    _this.loaded = ko.observable(false);
    _this.override = ko.observable(false);
    _this.data = ukov.wrap(_this.item, schema);
    _this.data.AddressId(_this.addressId);
    _this.data.CustomerTypeId(_this.customerTypeId);

    // /////TESTING//////////////////////
    // if (!_this.item.LeadID) {
    //   _this.data.FirstName("Bob");
    //   _this.data.LastName("Bobbins");
    //   _this.data.SSN("123456789");
    //   _this.data.DOB("1/1/1");
    // }
    // /////TESTING//////////////////////

    _this.localizationCvm = new ComboViewModel({
      selectedValue: _this.data.LocalizationId,
      fields: accountscache.metadata("localizations"),
    }).subscribe(accountscache.getList("localizations"), _this.handler);

    //
    // events
    //
    _this.cmdAccept = ko.command(function(cb) {
      closeLayer(_this);
      cb();
    }, function(busy) {
      var creditResult = _this.creditResult();
      return !busy && creditResult && creditResult.IsHit;
    });
    _this.cmdSave = ko.command(function(cb) {
      saveLead(_this, function(err) {
        if (err) {
          return cb(err);
        }
        cb();
        closeLayer(_this);
      });

    }, function(busy) {
      var creditResult = _this.creditResult();
      return !busy && !_this.busy() && (!creditResult || !creditResult.IsHit);
    });
    _this.cmdRun = ko.command(function(cb) {
      saveLeadAndRunCredit(_this, false, cb);
    }, function(busy) {
      var creditResult = _this.creditResult();
      return !busy && !_this.busy() && (!creditResult || !creditResult.IsHit);
    });
    _this.cmdBypass = ko.command(function(cb) {
      notify.confirm("Bypass Credit Check?", "This is a dialog to ensure you really want to bypass the credit check. Click YES to bypass.", function(result) {
        if (result === "yes") {
          saveLeadAndRunCredit(_this, true, cb);
        } else {
          cb();
        }
      });
    }, function(busy) {
      var creditResult = _this.creditResult();
      return !busy && !_this.busy() && (!creditResult || !creditResult.IsHit);
    });

    _this.cmdUseLead = ko.command(function(cb, item) {
      _this.handleUseLead(item, function() {
        cb();
        _this.leadResult(item.lead);
        _this.creditResult(item.creditResult);
        closeLayer(_this);
      });
    }, function(busy) {
      return !busy && !_this.busy() &&
        !_this.leadResult() && !_this.creditResult();
    });

    _this.busy = ko.computed(function() {
      return _this.cmdSave.busy() ||
        _this.cmdRun.busy() ||
        _this.cmdBypass.busy() ||
        _this.cmdUseLead.busy();
    });
  }
  utils.inherits(RunCreditViewModel, BaseViewModel);
  RunCreditViewModel.prototype.viewTmpl = "tmpl-acct-default-runcredit";
  RunCreditViewModel.prototype.width = 550;
  RunCreditViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  RunCreditViewModel.prototype.getResults = function() {
    var _this = this,
      creditResult = _this.creditResult.peek();
    if (creditResult && !creditResult.IsHit) {
      creditResult = null;
    }
    return [_this.leadResult.peek(), creditResult];
  };
  RunCreditViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdRun.busy() || _this.cmdBypass.busy()) {
      msg = "Please wait for credit check to finish.";
    } else if (_this.cmdSave.busy()) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };
  RunCreditViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    accountscache.ensure("localizations", join.add());
    join.when(function() {
      if (!_this.localizationCvm.selectedValue.peek()) {
        _this.localizationCvm.selectFirst();
      }
    });
  };

  RunCreditViewModel.prototype.handleUseLead = function(item, cb) {
    var _this = this;
    saveCustomerMasterLead(_this.customerTypeId, item.lead, null, cb);
  };

  function tryShowCreditResult(_this) {
    var lead = _this.leadResult.peek(),
      creditResult = _this.creditResult.peek();
    if (creditResult && creditResult.IsHit) {
      // layersVm should be defined since this view model is a layer
      _this.layersVm.show(new BaseViewModel({
        lead: lead,
        result: creditResult,
        width: 300,
        height: "auto",
        viewTmpl: "tmpl-acct-default-runcredit-result",
      }));
    }
  }

  function saveLeadAndRunCredit(_this, bypass, cb) {
    // save lead and then run credit
    saveLead(_this, function(err) {
      if (err) {
        cb(err);
      } else {
        runLeadCredit(_this, bypass, cb);
      }
    });
  }

  function saveLead(_this, cb) {
    _this.data.validate();
    _this.data.update();
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      return cb("invalid lead data");
    }

    var model = _this.data.getValue();
    dataservice.qualify.leads.save({
      data: model,
    }, null, utils.safeCallback(cb, function(err, resp) {
      var data = resp.Value;
      _this.data.setValue(data);
      _this.data.markClean(data, true);
      // set lead result
      _this.leadResult(data);
    }, function(err) {
      notify.error(err, 10);
    }));
  }

  function runLeadCredit(_this, bypass, cb) {
    var lead = _this.leadResult.peek();
    if (!lead) {
      notify.warn("No lead??", null, 7);
      return cb();
    }

    dataservice.qualify.runCredit.save({
      id: lead.LeadID,
      query: {
        bypass: bypass,
      },
    }, null, utils.safeCallback(cb, function(err, resp) {
      var data = resp.Value;
      _this.creditResult(data);
      // show credit result popup
      tryShowCreditResult(_this);
    }, function(err) {
      notify.error(err, 10);
    }));
  }

  function saveCustomerMasterLead(customerTypeId, lead, setter, cb) {
    dataservice.api_qualify.customerMasterFiles.save({
      id: lead.CustomerMasterFileId,
      link: strings.format("MasterLeads/{0}/{1}", customerTypeId, lead.LeadID),
    }, setter, cb);
  }

  function indexOfLead(otherLeads, lead) {
    var index = -1;
    if (lead) {
      otherLeads.some(function(item, i) {
        if (item.lead.LeadID === lead.LeadID) {
          index = i;
          return true;
        }
      });
    }
    return index;
  }

  function removeLead(otherLeads, lead) {
    var index = indexOfLead(otherLeads, lead);
    if (index >= 0) {
      otherLeads.splice(index, 1);
    }
  }


  return RunCreditViewModel;
});
