define('src/vm.address.validate', [
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.base',
  'ko',
  'src/ukov',
  'src/dataservice'
], function(
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
    max40 = ukov.validators.maxLength(40),
    max20 = ukov.validators.maxLength(20),
    max4 = ukov.validators.maxLength(4),
    max1 = ukov.validators.maxLength(1);

  schema = {
    _model: true,
    DealerId: {},

    PostalCode: {
      validators: [
        ukov.validators.isRequired('Zip code is required'),
        ukov.validators.isPattern(/^[0-9]{5}$/, 'invalid Zip code. expected format: 12345'),
      ],
    },
    StreetAddress: {
      validators: [
        ukov.validators.isRequired('Street address is required'),
        max50,
      ],
    },
    StreetAddress2: {
      validators: [max50],
    },
    Phone: {
      converter: ukov.converters.phone(),
    },

    // Manual/Extensions
    City: {
      validators: [
        ukov.validators.isRequired('City is required'),
        max50,
      ],
    },
    County: {
      validators: [
        ukov.validators.isRequired('County is required'),
        max50,
      ],
    },
    // State: {},
    StateId: {
      validators: [
        ukov.validators.isRequired('State is required'),
        max4,
      ],
    },
    TimeZoneId: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired('Time zone is required'),
        ukov.validators.isInt(),
      ],
    },
    StreetNumber: { //House #
      validators: [
        ukov.validators.isRequired('House # is required'),
        max40
      ],
    },
    StreetName: {
      validators: [
        ukov.validators.isRequired('Street name is required'),
        max50,
      ],
    },
    PreDirectional: {
      validators: [max20],
    },
    PostDirectional: {
      validators: [max20],
    },
    StreetType: {
      validators: [max20],
    },
    Extension: {
      validators: [max50],
    },
    ExtensionNumber: {
      validators: [max50],
    },
    CarrierRoute: {
      validators: [max4],
    },
    DPVResponse: {
      validators: [max1],
    },
  };


  function ValidateAddressViewModel(options) {
    var _this = this;
    ValidateAddressViewModel.super_.call(_this, options);

    _this.focus = ko.observable(false);
    _this.addressResult = ko.observable(null);
    _this.loaded = ko.observable(false);
    _this.override = ko.observable(false);

    _this.addressData = ukov.wrap({
      DealerId: 1, // ?????
    }, schema);

    _this.width = ko.observable(300);
    _this.height = ko.observable(450);

    _this.setManualOverride(false);


    /////TESTING//////////////////////
    _this.addressData.PostalCode('84057');
    _this.addressData.StreetAddress('1517 N 1335 W');
    _this.addressData.Phone('801 822 1234');
    _this.addressData.Phone(_this.addressData.model.Phone);
    /////TESTING//////////////////////

    //
    // events
    //
    _this.cmdValidate = ko.command(
      function(cb) {
        _this.addressData.validate();
        _this.addressData.update();
        if (!_this.addressData.isValid()) {
          notify.notify('warn', _this.addressData.errMsg(), 7);
          return cb();
        }

        _this.loaded(false);
        var model = _this.addressData.getValue();
        dataservice.qualify.validateAddress(model, function(resp) {
          if (resp.Code !== 0) {
            notify.notify('warn', resp.Message, 10);
          } else {
            _this.addressData.markClean(model, true);
            _this.addressResult(resp.Value);
            _this.loaded(true);
          }
          /////TESTING//////////////////////
          _this.setManualOverride(!_this.override());
          // _this.width(_this.width() + 10);
          // _this.height(_this.height() + 10);
          /////TESTING//////////////////////
          cb();
        });
      }
    );

    _this.loading = _this.cmdValidate.busy;
  }
  utils.inherits(ValidateAddressViewModel, BaseViewModel);
  ValidateAddressViewModel.prototype.viewTmpl = 'tmpl-address_validate';
  // ValidateAddressViewModel.prototype.width = 300;
  // ValidateAddressViewModel.prototype.height = 450;

  ValidateAddressViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focus(true);
    }, 100);
  };



  ValidateAddressViewModel.prototype.setManualOverride = function(override) {
    var _this = this,
      addrData = _this.addressData,
      ignore = !override;

    _this.override(override);

    // size
    if (override) {
      _this.width(600);
      _this.height(865);
    } else {
      _this.width(300);
      _this.height(530);
    }


    /////TESTING//////////////////////
    ignore = true;
    /////TESTING//////////////////////

    // ignore fields
    addrData.City.ignore(ignore);
    addrData.County.ignore(ignore);
    // addrData.State.ignore(ignore);
    addrData.StateId.ignore(ignore);
    addrData.TimeZoneId.ignore(ignore);
    addrData.StreetNumber.ignore(ignore);
    addrData.StreetName.ignore(ignore);
    addrData.PreDirectional.ignore(ignore);
    addrData.PostDirectional.ignore(ignore);
    addrData.StreetType.ignore(ignore);
    addrData.Extension.ignore(ignore);
    addrData.ExtensionNumber.ignore(ignore);
    addrData.CarrierRoute.ignore(ignore);
    addrData.DPVResponse.ignore(ignore);
    // update model
    addrData.update(false, true);
  };

  return ValidateAddressViewModel;
});
