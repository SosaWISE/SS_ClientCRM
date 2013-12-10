define('src/account/vm.account.runcredit', [
  'src/vm.combo',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.base',
  'ko',
  'src/ukov',
  'src/dataservice'
], function(
  ComboViewModel,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  dataservice
) {
  "use strict";

  var schema,
    max50 = ukov.validators.maxLength(50),
    max256 = ukov.validators.maxLength(256);

  schema = {
    _model: true,

    Salutation: {
      validators: [max50],
    },
    FirstName: {
      validators: [
        ukov.validators.isRequired('First name is required'),
        max50
      ],
    },
    MiddleName: {
      validators: [max50],
    },
    LastName: {
      validators: [
        ukov.validators.isRequired('Last name is required'),
        max50
      ],
    },
    Suffix: {
      validators: [max50],
    },
    SSN: {
      validators: [
        ukov.validators.isSsn(),
        max50
      ],
    },
    DOB: {
      converter: ukov.converters.date('MM/DD/YYYY'),
      validators: [
        max50
      ],
    },
    Email: {
      validators: [
        max256
      ],
    },
  };


  function RunCreditAccountViewModel(options) {
    var _this = this;
    RunCreditAccountViewModel.super_.call(_this, options);

    _this.focus = ko.observable(false);
    _this.accountResult = ko.observable(null);
    _this.loaded = ko.observable(false);
    _this.override = ko.observable(false);

    _this.accountData = ukov.wrap({}, schema);

    _this.width = ko.observable(300);
    _this.height = ko.observable(550);

    // _this.setManualOverride(false);


    /////TESTING//////////////////////
    /////TESTING//////////////////////

    //
    // events
    //
    _this.cmdRun = ko.command(function(cb) {
      _this.accountData.validate();
      _this.accountData.update();
      if (!_this.accountData.isValid()) {
        notify.notify('warn', _this.accountData.errMsg(), 7);
        return cb();
      }

      _this.loaded(false);
      var model = _this.accountData.getValue();
      dataservice.qualify.runCredit(model, function(resp) {
        if (resp.Code !== 0) {
          notify.notify('warn', resp.Message, 10);
        } else {
          _this.accountData.markClean(model, true);
          _this.accountResult(resp.Value);
          _this.loaded(true);
        }
        cb();
      });
    });
    // _this.clickManual = function() {
    //   // _this.setManualOverride(true);
    //   /////TESTING//////////////////////
    //   _this.setManualOverride(!_this.override());
    //   /////TESTING//////////////////////
    // };

    _this.loading = _this.cmdRun.busy;
  }
  utils.inherits(RunCreditAccountViewModel, BaseViewModel);
  RunCreditAccountViewModel.prototype.viewTmpl = 'tmpl-account_runcredit';

  RunCreditAccountViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focus(true);
    }, 100);
  };

  return RunCreditAccountViewModel;
});
