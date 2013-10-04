define([
  'notify',
  'util/utils',
  'vm.base',
  'ko',
  'ukov',
  'dataservice'
], function(
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  dataservice
) {
  "use strict";

  /////MOCKING//////////////////////
  var callCount = 0;
  dataservice.qualify.validateAddress = function(data, cb) {
    setTimeout(function() {
      callCount++;
      var resp;

      // if (callCount % 2 === 0) {
      //   resp = {
      //     Code: 1,
      //     Message: 'The code is 1, which is bad... i think.',
      //     Value: null,
      //   };
      // } else {
      resp = {
        Code: 0,
        Message: '',
        Value: {
          AddressID: 1,
          DealerId: data.DealerId,
          // ValidationVendorId
          // AddressValidationStateId
          StateId: 'UT',
          // CountryId
          // TimeZoneId
          // AddressTypeId
          StreetAddress: data.StreetAddress,
          StreetAddress2: data.StreetAddress2,
          // StreetNumber
          // StreetName
          // StreetType
          // PreDirectional
          // PostDirectional
          // Extension
          // ExtensionNumber
          // County
          // CountyCode
          // Urbanization
          // UrbanizationCode
          City: 'Orem',
          PostalCode: data.PostalCode,
          // PlusFour
          Phone: data.Phone,
          // DeliveryPoint
          // Latitude
          // Longitude
          // CongressionalDistric
          // DPV
          // DPVResponse
          // DPVFootnote
          // CarrierRoute
          // IsActive
          // IsDeleted
          // CreatedBy
          // CreatedOn
        },
      };
      // }

      cb(resp);
    }, 1000 * 2);
  };
  /////MOCKING//////////////////////

  ukov.schema['address-validate'] = {
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
      ],
    },
    Phone: {
      converter: ukov.converters.phone(),
    },
  };

  function ValidateAddressViewModel(options) {
    var _this = this;
    ValidateAddressViewModel.super_.call(_this, options);

    _this.focus = ko.observable(false);
    _this.addressData = ukov.wrapModel({
      DealerId: 1, // ?????
    }, 'address-validate', 'address-validate-vm');
    _this.addressResult = ko.observable(null);
    _this.loaded = ko.observable(false);


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
          cb();
        });
      }
    );

    _this.loading = _this.cmdValidate.isExecuting;
  }
  utils.inherits(ValidateAddressViewModel, BaseViewModel);
  ValidateAddressViewModel.prototype.viewTmpl = 'tmpl-address_validate';
  ValidateAddressViewModel.prototype.width = 300;
  ValidateAddressViewModel.prototype.height = 450;

  ValidateAddressViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focus(true);
    }, 100);
  };

  return ValidateAddressViewModel;
});
