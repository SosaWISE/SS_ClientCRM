define('src/account/default/runcredit.vm', [
  'src/app',
  'src/config',
  'src/core/combo.vm',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'jquery',
  'ko',
  'src/ukov',
  'src/dataservice'
], function(
  app,
  config,
  ComboViewModel,
  strings,
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
    //init: function(element, valueAccessor) {},
    update: function(element, valueAccessor) {
      var cls,
        creditGroup = valueAccessor();
      switch (creditGroup) {
        case "Excellent":
          cls = "excellent";
          break;
        case "Good":
          cls = "good";
          break;
        case "Sub":
          cls = "sub";
          break;
        case "Poor":
          cls = "poor";
          break;
        default:
          cls = "blank";
          break;
      }
      if (cls) {
        jquery(element).addClass(cls);
      }
    }
  };
  // -- Credit Score Status
  ko.bindingHandlers.crs = {
    update: function(element, valueAccessor) {
      var newText,
        creditStatus = valueAccessor();
      if (creditStatus) {
        newText = 'Report Found';
      } else {
        newText = 'Report Not Found';
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
    keys: ['SSN', 'DOB', ],
    validators: [ //
      function(val) {
        if (!val.SSN && !val.DOB) {
          return 'A valid Social Security # OR a valid Date of Birth must be provided';
        }
      },
    ]
  };

  schema = {
    _model: true,
    LeadSourceId: {},
    LeadDispositionId: {},
    TeamLocationId: {},
    DealerId: {},
    Gender: {},
    SeasonId: {},

    SalesRepId: {
      converter: strConverter,
      validators: [max25],
    },
    LocalizationID: {
      converter: strConverter,
      validators: [max20],
    },
    AddressId: {
      converters: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('AddressId is required'),
      ],
    },
    Salutation: {
      converter: nullStrConverter,
      validators: [max50],
    },
    FirstName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('First name is required'),
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
        ukov.validators.isRequired('Last name is required'),
        max50
      ],
    },
    Suffix: {
      converter: nullStrConverter,
      validators: [max50],
    },
    SSN: {
      converter: ukov.converters.ssn(),
      validationGroup: validationGroup,
    },
    DOB: {
      converter: ukov.converters.date(),
      validators: [
        ukov.validators.minAge(false, 0, 'Can\'t run credit on the unborn'),
      ],
      validationGroup: validationGroup,
    },
    Email: {
      converter: strConverter,
      validators: [max256, ukov.validators.isEmail()],
    },
  };

  function RunCreditViewModel(options) {
    var _this = this;
    RunCreditViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['addressId']);
    _this.mixinLoad();

    _this.focusFirst = ko.observable(false);
    _this.creditResult = ko.observable(null);
    _this.loaded = ko.observable(false);
    _this.override = ko.observable(false);
    _this.data = ukov.wrap({
      LocalizationID: '',
      LeadSourceId: config.leadSourceId,
      LeadDispositionId: config.leadDispositionId,
      DealerId: app.user().DealerId,
      AddressId: _this.addressId,
      SalesRepId: _this.repModel.CompanyID,
      TeamLocationId: _this.repModel.TeamLocationId,
      SeasonId: _this.repModel.Seasons[0].SeasonID,
      // Salutation: '',
      FirstName: '',
      MiddleName: '',
      LastName: '',
      // Suffix: '',
      Gender: 'Male',
      SSN: '',
      DOB: '',
      Email: '',
      ProductSkwId: 'HSSS001' // *OPTIONAL  it will default to 'HSSS001' if not passed.  This Prodcut Skw is for an alarm system.  Depending on what type of lead we are creating you would pass the appropriate Product Skw.
    }, schema);

    _this.localizationCvm = new ComboViewModel({
      selectedValue: _this.data.LocalizationID,
      fields: {
        text: 'LocalizationName',
        value: 'LocalizationID',
      }
    });

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
    _this.cmdRun = ko.command(function(cb) {
      _this.data.validate();
      _this.data.update();
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb();
      }

      var model = _this.data.getValue();
      // store now since we want to use this even if escape key is pressed... (and assuming the credit is a hit)
      _this.customerResult = {
        SSN: model.SSN,
        DOB: model.DOB,
        Email: model.Email,
        CustomerName: strings.joinTrimmed(' ', model.Salutation, model.FirstName, model.MiddleName, model.LastName, model.Suffix),
      };
      _this.loaded(false);
      dataservice.qualify.runcredit.post(null, model, null, utils.safeCallback(cb, function(err, resp) {
        _this.loaded(true);
        _this.data.markClean(model, true);
        var creditResult = resp.Value;
        _this.creditResult(creditResult);
        // show credit result popup
        showCreditResult(_this);
      }, function(err) {
        notify.error(err, 10);
      }));
    }, function(busy) {
      var creditResult = _this.creditResult();
      return !busy && (!creditResult || !creditResult.IsHit);
    });
  }
  utils.inherits(RunCreditViewModel, BaseViewModel);
  RunCreditViewModel.prototype.viewTmpl = 'tmpl-acct-default-runcredit';
  RunCreditViewModel.prototype.width = 550;
  RunCreditViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  RunCreditViewModel.prototype.getResults = function() {
    var _this = this,
      creditResult = _this.creditResult.peek();
    if (creditResult && creditResult.IsHit) {
      return [_this.customerResult, creditResult];
    } else {
      return [];
    }
  };
  RunCreditViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdRun.busy()) {
      msg = 'Please wait for credit check to finish.';
    }
    return msg;
  };
  RunCreditViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;
    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focusFirst(true);
    }, 100);
  };
  RunCreditViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      cb = join.add();

    load_localization(_this.localizationCvm, cb);
  };

  function load_localization(cvm, cb) {
    dataservice.maincore.localizations.read({}, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);
      cvm.selectItem(cvm.list()[0]);
    }, utils.no_op));
  }

  function showCreditResult(_this) {
    var creditResult = _this.creditResult();
    if (creditResult && creditResult.IsHit) {
      // layersVm should be defined since this view model is a layer
      _this.layersVm.show(new BaseViewModel({
        result: creditResult,
        width: 300,
        height: 'auto',
        viewTmpl: 'tmpl-acct-default-runcredit-result',
      }));
    }
  }

  return RunCreditViewModel;
});
