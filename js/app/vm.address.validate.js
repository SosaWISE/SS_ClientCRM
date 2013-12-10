define('src/vm.address.validate', [
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

    _this.stateComboVM = new ComboViewModel({
      selectedValue: _this.addressData.StateId,
      list: _this.stateOptions,
      nullable: true,
    });
    _this.timeZoneComboVM = new ComboViewModel({
      selectedValue: _this.addressData.TimeZoneId,
      list: _this.timeZoneOptions,
      nullable: true,
    });
    _this.preDirectionalComboVM = new ComboViewModel({
      selectedValue: _this.addressData.PreDirectional,
      list: _this.addressDirectionalTypeOptions,
      nullable: true,
    });
    _this.postDirectionalComboVM = new ComboViewModel({
      selectedValue: _this.addressData.PostDirectional,
      list: _this.addressDirectionalTypeOptions,
      nullable: true,
    });
    _this.streetTypeComboVM = new ComboViewModel({
      selectedValue: _this.addressData.StreetType,
      list: _this.streetTypeOptions,
      nullable: true,
    });

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
          // _this.width(_this.width() + 10);
          // _this.height(_this.height() + 10);
          /////TESTING//////////////////////
          cb();
        });
      }
    );
    _this.clickManual = function() {
      // _this.setManualOverride(true);
      /////TESTING//////////////////////
      _this.setManualOverride(!_this.override());
      /////TESTING//////////////////////
    };

    _this.loading = _this.cmdValidate.busy;
  }
  utils.inherits(ValidateAddressViewModel, BaseViewModel);
  ValidateAddressViewModel.prototype.viewTmpl = 'tmpl-address_validate';

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



  //@TODO: load options from server
  ValidateAddressViewModel.prototype.stateOptions = [
    {
      value: 'AK',
      text: 'ALASKA'
    },
    {
      value: 'AL',
      text: 'ALABAMA'
    },
    {
      value: 'AR',
      text: 'ARKANSAS'
    },
    {
      value: 'AS',
      text: 'AMERICAN SAMOA'
    },
    {
      value: 'AZ',
      text: 'ARIZONA'
    },
    {
      value: 'CA',
      text: 'CALIFORNIA'
    },
    {
      value: 'CO',
      text: 'COLORADO'
    },
    {
      value: 'CT',
      text: 'CONNECTICUT'
    },
    {
      value: 'DC',
      text: 'DISTRICT OF COLUMBIA'
    },
    {
      value: 'DE',
      text: 'DELAWARE'
    },
    {
      value: 'FL',
      text: 'FLORIDA'
    },
    {
      value: 'FM',
      text: 'FEDERATED STATES OF MICRONESIA'
    },
    {
      value: 'GA',
      text: 'GEORGIA'
    },
    {
      value: 'GU',
      text: 'GUAM'
    },
    {
      value: 'HI',
      text: 'HAWAII'
    },
    {
      value: 'IA',
      text: 'IOWA'
    },
    {
      value: 'ID',
      text: 'IDAHO'
    },
    {
      value: 'IL',
      text: 'ILLINOIS'
    },
    {
      value: 'IN',
      text: 'INDIANA'
    },
    {
      value: 'KS',
      text: 'KANSAS'
    },
    {
      value: 'KY',
      text: 'KENTUCKY'
    },
    {
      value: 'LA',
      text: 'LOUISIANA'
    },
    {
      value: 'MA',
      text: 'MASSACHUSETTS'
    },
    {
      value: 'MD',
      text: 'MARYLAND'
    },
    {
      value: 'ME',
      text: 'MAINE'
    },
    {
      value: 'MH',
      text: 'MARSHALL ISLANDS'
    },
    {
      value: 'MI',
      text: 'MICHIGAN'
    },
    {
      value: 'MN',
      text: 'MINNESOTA'
    },
    {
      value: 'MO',
      text: 'MISSOURI'
    },
    {
      value: 'MP',
      text: 'NORTHERN MARIANA ISLANDS'
    },
    {
      value: 'MS',
      text: 'MISSISSIPPI'
    },
    {
      value: 'MT',
      text: 'MONTANA'
    },
    {
      value: 'NC',
      text: 'NORTH CAROLINA'
    },
    {
      value: 'ND',
      text: 'NORTH DAKOTA'
    },
    {
      value: 'NE',
      text: 'NEBRASKA'
    },
    {
      value: 'NH',
      text: 'NEW HAMPSHIRE'
    },
    {
      value: 'NJ',
      text: 'NEW JERSEY'
    },
    {
      value: 'NM',
      text: 'NEW MEXICO'
    },
    {
      value: 'NV',
      text: 'NEVADA'
    },
    {
      value: 'NY',
      text: 'NEW YORK'
    },
    {
      value: 'OH',
      text: 'OHIO'
    },
    {
      value: 'OK',
      text: 'OKLAHOMA'
    },
    {
      value: 'OR',
      text: 'OREGON'
    },
    {
      value: 'PA',
      text: 'PENNSYLVANIA'
    },
    {
      value: 'PR',
      text: 'PUERTO RICO'
    },
    {
      value: 'PW',
      text: 'PALAU'
    },
    {
      value: 'RI',
      text: 'RHODE ISLAND'
    },
    {
      value: 'SC',
      text: 'SOUTH CAROLINA'
    },
    {
      value: 'SD',
      text: 'SOUTH DAKOTA'
    },
    {
      value: 'TN',
      text: 'TENNESSEE'
    },
    {
      value: 'TX',
      text: 'TEXAS'
    },
    {
      value: 'UT',
      text: 'UTAH'
    },
    {
      value: 'VA',
      text: 'VIRGINIA'
    },
    {
      value: 'VI',
      text: 'VIRGIN ISLANDS'
    },
    {
      value: 'VT',
      text: 'VERMONT'
    },
    {
      value: 'WA',
      text: 'WASHINGTON'
    },
    {
      value: 'WI',
      text: 'WISCONSIN'
    },
    {
      value: 'WV',
      text: 'WEST VIRGINIA'
    },
    {
      value: 'WY',
      text: 'WYOMING WY'
    },
  ];
  ValidateAddressViewModel.prototype.timeZoneOptions = [
    {
      value: 2,
      text: 'Atlantic Standard Time'
    },
    {
      value: 4,
      text: 'Eastern Standard Time'
    },
    {
      value: 6,
      text: 'Central Standard Time'
    },
    {
      value: 8,
      text: 'Mountain Standard Time'
    },
    {
      value: 10,
      text: 'Pacific Standard Time'
    },
    {
      value: 12,
      text: 'Alaska Standard Time'
    },
    {
      value: 14,
      text: 'Hawaii-Aleutian Standard Time'
    },
  ];
  ValidateAddressViewModel.prototype.addressDirectionalTypeOptions = [
    {
      value: 1,
      text: 'N - North North'
    },
    {
      value: 2,
      text: 'E - East  East'
    },
    {
      value: 3,
      text: 'S - South South'
    },
    {
      value: 4,
      text: 'W - West  West'
    },
    {
      value: 5,
      text: 'NE - North East North East'
    },
    {
      value: 6,
      text: 'SE - South East South East'
    },
    {
      value: 7,
      text: 'NW - North West North West'
    },
    {
      value: 8,
      text: 'SW - South West South West'
    },
  ];
  ValidateAddressViewModel.prototype.streetTypeOptions = [
    {
      value: 1,
      text: 'AL - ALLEY'
    },
    {
      value: 2,
      text: 'AV - AVENUE'
    },
    {
      value: 3,
      text: 'BV - BOULEVARD'
    },
    {
      value: 4,
      text: 'BD - BUILDING'
    },
    {
      value: 5,
      text: 'CN - CENTER'
    },
    {
      value: 6,
      text: 'CI - CIRCLE'
    },
    {
      value: 7,
      text: 'CT - COURT'
    },
    {
      value: 8,
      text: 'CS - CRESCENT'
    },
    {
      value: 9,
      text: 'DA - DALE'
    },
    {
      value: 10,
      text: 'DR - DRIVE'
    },
    {
      value: 11,
      text: 'EX - EXPRESSWAY'
    },
    {
      value: 12,
      text: 'FY - FREEWAY'
    },
    {
      value: 13,
      text: 'GA - GARDEN'
    },
    {
      value: 14,
      text: 'GR - GROVE'
    },
    {
      value: 15,
      text: 'HT - HEIGHTS'
    },
    {
      value: 16,
      text: 'HY - HIGHWAY'
    },
    {
      value: 17,
      text: 'HI - HILL'
    },
    {
      value: 18,
      text: 'KN - KNOLL'
    },
    {
      value: 19,
      text: 'LN - LANE'
    },
    {
      value: 20,
      text: 'LP - LOOP'
    },
    {
      value: 21,
      text: 'MA - MALL'
    },
    {
      value: 22,
      text: 'OV - OVAL'
    },
    {
      value: 23,
      text: 'PK - PARK'
    },
    {
      value: 24,
      text: 'PY - PARKWAY'
    },
    {
      value: 25,
      text: 'PA - PATH'
    },
    {
      value: 26,
      text: 'PI - PIKE'
    },
    {
      value: 27,
      text: 'PL - PLACE'
    },
    {
      value: 28,
      text: 'PZ - PLAZA'
    },
    {
      value: 29,
      text: 'PT - POINT'
    },
    {
      value: 30,
      text: 'RD - ROAD'
    },
    {
      value: 31,
      text: 'RT - ROUTE'
    },
    {
      value: 32,
      text: 'RO - ROW'
    },
    {
      value: 33,
      text: 'RN - RUN'
    },
    {
      value: 34,
      text: 'RR - RURALROUTE'
    },
    {
      value: 35,
      text: 'SQ - SQUARE'
    },
    {
      value: 36,
      text: 'ST - STREET'
    },
    {
      value: 37,
      text: 'TC - TERRACE'
    },
    {
      value: 38,
      text: 'TY - THRUWAY'
    },
    {
      value: 39,
      text: 'TR - TRAIL'
    },
    {
      value: 40,
      text: 'TP - TURNPIKE'
    },
    {
      value: 41,
      text: 'VI - VIADUCT'
    },
    {
      value: 42,
      text: 'VW- VIEW'
    },
    {
      value: 43,
      text: 'WK - WALK'
    },
    {
      value: 44,
      text: 'WY - WAY'
    },
  ];



  return ValidateAddressViewModel;
});
