define('src/account/default/runcredit.vm', [
  'src/config',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'jquery',
  'ko',
  'src/ukov',
  'src/dataservice'
], function(
  config,
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
    validationGroup;

  validationGroup = {
    keys: ['SSN', 'DOB', ],
    validators: [
      //
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
      converter: strConverter,
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
      converter: strConverter,
      validators: [max50],
    },
    SSN: {
      converter: strConverter,
      validators: [
        ukov.validators.isSsn(),
        max50
      ],
      validationGroup: validationGroup,
    },
    DOB: {
      converter: ukov.converters.date(),
      validators: [
        ukov.validators.minAge('MM/DD/YYYY', false, 0, 'Can\'t run credit on the unborn'),
      ],
      validationGroup: validationGroup,
    },
    Email: {
      converter: strConverter,
      validators: [
        max256
      ],
    },
  };

  function RunCreditViewModel(options) {
    var _this = this,
      customerModel;
    RunCreditViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['addressId']);
    _this.mixinLoad();

    _this.focus = ko.observable(false);
    _this.creditResult = ko.observable(null);
    _this.loaded = ko.observable(false);
    _this.override = ko.observable(false);
    _this.data = ukov.wrap({
      LocalizationID: '',
      LeadSourceId: config.leadSourceId,
      LeadDispositionId: config.leadDispositionId,
      DealerId: config.user().DealerId,
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
    }, schema);

    _this.laComboVM = new ComboViewModel({
      selectedValue: _this.data.LocalizationID,
      fields: {
        text: 'LocalizationName',
        value: 'LocalizationID',
      }
    });

    /////TESTING//////////////////////
    _this.data.FirstName('Bob');
    _this.data.LastName('Bobbins');
    // _this.data.DOB('1-1-1');
    _this.data.DOB(new Date(Date.UTC(2001, 0, 1)));
    _this.data.Email('Bob.Bobbins@some.com');
    /////TESTING//////////////////////

    //
    // events
    //
    _this.cmdAccept = ko.command(function(cb) {
      if (_this.layer) {
        _this.layer.close(customerModel, _this.creditResult());
      }
      cb();
    }, function(busy) {
      return !busy && _this.creditResult() && _this.creditResult().IsHit;
    });
    _this.cmdRun = ko.command(function(cb) {
      _this.data.validate();
      _this.data.update();
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), 7);
        return cb();
      }

      _this.loaded(false);
      customerModel = _this.data.getValue();
      _this.data.markClean(customerModel, true);
      dataservice.qualify.runcredit.post(null, customerModel, null, function(err, resp) {
        if (err) {
          notify.notify('warn', resp.Message, 10);
          return cb();
        }
        _this.creditResult(resp.Value);
        _this.loaded(true);
        cb();
      });
    }, function(busy) {
      return !busy && (!_this.creditResult() || !_this.creditResult().IsHit);
    });

    _this.loading = _this.cmdRun.busy;
  }
  utils.inherits(RunCreditViewModel, BaseViewModel);
  RunCreditViewModel.prototype.viewTmpl = 'tmpl-acct-default-runcredit';
  RunCreditViewModel.prototype.width = 600;
  RunCreditViewModel.prototype.height = 'auto';

  RunCreditViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focus(true);
    }, 100);
  };

  RunCreditViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      cb = join.add();

    load_localization(_this.laComboVM, cb);
  };

  function load_localization(comboVM, cb) {
    dataservice.maincore.localizations.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        comboVM.setList(resp.Value);
        comboVM.selectItem(comboVM.list()[0]);
      }, cb);
    });
  }

  return RunCreditViewModel;
});