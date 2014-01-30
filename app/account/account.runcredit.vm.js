define('src/account/account.runcredit.vm', [
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
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


  function AccountRunCreditViewModel(options) {
    var _this = this;
    AccountRunCreditViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['addressId']);

    _this.focus = ko.observable(false);
    _this.creditResult = ko.observable(null);
    _this.loaded = ko.observable(false);
    _this.override = ko.observable(false);

    _this.data = ukov.wrap({
      AddressId: _this.addressId,
      Salutation: '',
      FirstName: '',
      MiddleName: '',
      LastName: '',
      Suffix: '',
      SSN: '',
      DOB: '',
      Email: '',
    }, schema);

    /////TESTING//////////////////////
    _this.data.FirstName('Bob');
    _this.data.LastName('Bobbins');
    // _this.data.DOB('1-1-1');
    _this.data.DOB(new Date(Date.UTC(2001, 0, 1)));
    /////TESTING//////////////////////

    _this.width = ko.observable(600);
    _this.height = ko.observable('auto');

    //
    // events
    //
    _this.clickClose = function() {
      if (_this.layer) {
        var result;
        if (_this.creditResult()) {
          result = {
            customer: _this.data.model,
            creditResult: _this.creditResult(),
          };
        }
        _this.layer.close(result);
      }
    };
    _this.cmdRun = ko.command(function(cb) {
      _this.data.validate();
      _this.data.update();
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), 7);
        return cb();
      }

      _this.loaded(false);
      var model = _this.data.getValue();
      _this.data.markClean(model, true);
      dataservice.qualify.runcredit.post(null, model, null, function(err, resp) {
        if (err) {
          notify.notify('warn', resp.Message, 10);
          return cb();
        }
        _this.creditResult(resp.Value);
        _this.loaded(true);
        cb();
      });
    });

    _this.loading = _this.cmdRun.busy;
  }
  utils.inherits(AccountRunCreditViewModel, BaseViewModel);
  AccountRunCreditViewModel.prototype.viewTmpl = 'tmpl-account_runcredit';

  AccountRunCreditViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focus(true);
    }, 100);
  };

  return AccountRunCreditViewModel;
});
