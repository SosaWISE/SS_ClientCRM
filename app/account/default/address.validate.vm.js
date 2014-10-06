define('src/account/default/address.validate.vm', [
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
    max40 = ukov.validators.maxLength(40),
    max20 = ukov.validators.maxLength(20),
    max4 = ukov.validators.maxLength(4),
    max1 = ukov.validators.maxLength(1),
    strConverter = ukov.converters.string(),
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,

    AddressID: {},

    DealerId: {},

    SeasonId: {},

    SalesRepId: {},

    TeamLocationId: {},

    PhoneNumber: {
      converter: ukov.converters.phone(),
      validators: [
        ukov.validators.isRequired('Premise phone is required'),
      ],
    },
    PostalCode: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Zip code is required'),
        ukov.validators.isZipCode(),
      ],
    },
    StreetAddress: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Street address is required'),
        max50,
      ],
    },
    StreetAddress2: {
      converter: nullStrConverter,
      validators: [max50],
    },

    // Manual/Extensions
    City: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('City is required'),
        max50,
      ],
    },
    County: {
      converter: strConverter,
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
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('House # is required'),
        max40
      ],
    },
    StreetName: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Street name is required'),
        max50,
      ],
    },
    PreDirectional: {
      converter: strConverter,
      validators: [max20],
    },
    PostDirectional: {
      converter: strConverter,
      validators: [max20],
    },
    StreetType: {
      converter: strConverter,
      validators: [max20],
    },
    Extension: {
      converter: nullStrConverter,
      validators: [max50],
    },
    ExtensionNumber: {
      converter: nullStrConverter,
      validators: [max50],
    },
    CarrierRoute: {
      converter: nullStrConverter,
      validators: [max4],
    },
    DPVResponse: {
      converter: nullStrConverter,
      validators: [max1],
    },
  };


  function AddressValidateViewModel(options) {
    var _this = this;
    AddressValidateViewModel.super_.call(_this, options);

    // if (_this.item) {
    //   // ??? make it so Manual button can be toggled ???
    //   _this.item.Validated = false;
    // }

    _this.focusFirst = ko.observable(false);
    _this.focusOk = ko.observable(false);
    _this.result = ko.observable(_this.item);
    _this.override = ko.observable(false);

    _this.data = ukov.wrap(_this.item || {
      DealerId: 5000, // ?????
    }, schema);

    _this.data.StateCvm = new ComboViewModel({
      selectedValue: _this.data.StateId,
      list: _this.stateOptions,
      nullable: true,
    });
    _this.data.TimeZoneCvm = new ComboViewModel({
      selectedValue: _this.data.TimeZoneId,
      list: _this.timeZoneOptions,
      nullable: true,
    });
    _this.data.PreDirectionalCvm = new ComboViewModel({
      selectedValue: _this.data.PreDirectional,
      list: _this.addressDirectionalTypeOptions,
      nullable: true,
    });
    _this.data.PostDirectionalCvm = new ComboViewModel({
      selectedValue: _this.data.PostDirectional,
      list: _this.addressDirectionalTypeOptions,
      nullable: true,
    });
    _this.data.StreetTypeCvm = new ComboViewModel({
      selectedValue: _this.data.StreetType,
      list: _this.streetTypeOptions,
      nullable: true,
    });

    _this.width = ko.observable(0);
    _this.height = ko.observable('auto');
    _this.setManualOverride(!!_this.item);

    _this.data.SeasonId(_this.repModel.Seasons[0].SeasonID);
    _this.data.SalesRepId(_this.repModel.CompanyID);
    _this.data.TeamLocationId(_this.repModel.TeamLocationId);

    // /////TESTING//////////////////////
    // _this.data.PostalCode('12345');
    // _this.data.StreetAddress('adsf');
    // _this.data.PhoneNumber('1234567890');
    // _this.data.PhoneNumber(_this.data.model.PhoneNumber);
    // /////TESTING//////////////////////

    //
    // events
    //
    _this.clickOk = function() {
      _this.layerResult = _this.result.peek();
      closeLayer(_this);
    };
    _this.cmdValidate = ko.command(function(cb) {
      _this.data.validate();
      _this.data.update();
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb();
      }

      var model = _this.data.getValue();
      model.AddressId = model.AddressID; // copy id to match API inputs
      dataservice.qualify.addressValidation.post(null, model, null, utils.safeCallback(cb, function(err, resp) {
        if (resp && resp.Value) {
          //@TODO: handle !data.Validated
          var data = resp.Value;
          _this.data.setValue(data);
          _this.data.markClean(data, true);
          _this.result(data);
          // store now since we want to use this even if escape key is pressed...
          _this.layerResult = _this.result.peek();
          //
          _this.focusOk(true);
        }
      }, function(err) {
        _this.setManualOverride(true);
        notify.error(err);
      }));
    }, function(busy) {
      return !busy && !_this.data.isClean();
    });
    _this.cmdManual = ko.command(function(cb) {
      // _this.setManualOverride(true);
      /////TESTING//////////////////////
      _this.setManualOverride(!_this.override());
      /////TESTING//////////////////////
      cb();
    }, function(busy) {
      return !busy && _this.result() && !_this.result().Validated;
    });

    _this.loading = _this.cmdValidate.busy;
  }
  utils.inherits(AddressValidateViewModel, BaseViewModel);
  AddressValidateViewModel.prototype.viewTmpl = 'tmpl-acct-default-address_validate';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  AddressValidateViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  AddressValidateViewModel.prototype.onActivate = function( /*routeData*/ ) { // overrides base
    var _this = this;

    // this timeout makes it possible to focus the input
    setTimeout(function() {
      _this.focusFirst(true);
    }, 100);
  };

  AddressValidateViewModel.prototype.setManualOverride = function(override) {
    var _this = this,
      addrData = _this.data,
      ignore = !override;

    _this.override(override);

    // size
    if (override) {
      _this.width(570);
    } else {
      _this.width(300);
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
  AddressValidateViewModel.prototype.stateOptions = [ //
    {
      value: 'AK',
      text: 'Alaska'
    }, {
      value: 'AL',
      text: 'Alabama'
    }, {
      value: 'AR',
      text: 'Arkansas'
    }, {
      value: 'AS',
      text: 'American Samoa'
    }, {
      value: 'AZ',
      text: 'Arizona'
    }, {
      value: 'CA',
      text: 'California'
    }, {
      value: 'CO',
      text: 'Colorado'
    }, {
      value: 'CT',
      text: 'Connecticut'
    }, {
      value: 'DC',
      text: 'District of Columbia'
    }, {
      value: 'DE',
      text: 'Delaware'
    }, {
      value: 'FL',
      text: 'Florida'
    }, {
      value: 'FM',
      text: 'Federated States of Micronesia'
    }, {
      value: 'GA',
      text: 'Georgia'
    }, {
      value: 'GU',
      text: 'Guam'
    }, {
      value: 'HI',
      text: 'Hawaii'
    }, {
      value: 'IA',
      text: 'Iowa'
    }, {
      value: 'ID',
      text: 'Idaho'
    }, {
      value: 'IL',
      text: 'Illinois'
    }, {
      value: 'IN',
      text: 'Indiana'
    }, {
      value: 'KS',
      text: 'Kansas'
    }, {
      value: 'KY',
      text: 'Kentucky'
    }, {
      value: 'LA',
      text: 'Louisiana'
    }, {
      value: 'MA',
      text: 'Massachusetts'
    }, {
      value: 'MD',
      text: 'Maryland'
    }, {
      value: 'ME',
      text: 'Maine'
    }, {
      value: 'MH',
      text: 'Marshall Islands'
    }, {
      value: 'MI',
      text: 'Michigan'
    }, {
      value: 'MN',
      text: 'Minnesota'
    }, {
      value: 'MO',
      text: 'Missouri'
    }, {
      value: 'MP',
      text: 'Northern Mariana Islands'
    }, {
      value: 'MS',
      text: 'Mississippi'
    }, {
      value: 'MT',
      text: 'Montana'
    }, {
      value: 'NC',
      text: 'North Carolina'
    }, {
      value: 'ND',
      text: 'North Dakota'
    }, {
      value: 'NE',
      text: 'Nebraska'
    }, {
      value: 'NH',
      text: 'New Hampshire'
    }, {
      value: 'NJ',
      text: 'New Jersey'
    }, {
      value: 'NM',
      text: 'New Mexico'
    }, {
      value: 'NV',
      text: 'Nevada'
    }, {
      value: 'NY',
      text: 'New York'
    }, {
      value: 'OH',
      text: 'Ohio'
    }, {
      value: 'OK',
      text: 'Oklahoma'
    }, {
      value: 'OR',
      text: 'Oregon'
    }, {
      value: 'PA',
      text: 'Pennsylvania'
    }, {
      value: 'PR',
      text: 'Puerto Rico'
    }, {
      value: 'PW',
      text: 'Palau'
    }, {
      value: 'RI',
      text: 'Rhode Island'
    }, {
      value: 'SC',
      text: 'South Carolina'
    }, {
      value: 'SD',
      text: 'South Dakota'
    }, {
      value: 'TN',
      text: 'Tennessee'
    }, {
      value: 'TX',
      text: 'Texas'
    }, {
      value: 'UT',
      text: 'Utah'
    }, {
      value: 'VA',
      text: 'Virginia'
    }, {
      value: 'VI',
      text: 'Virgin Islands'
    }, {
      value: 'VT',
      text: 'Vermont'
    }, {
      value: 'WA',
      text: 'Washington'
    }, {
      value: 'WI',
      text: 'Wisconsin'
    }, {
      value: 'WV',
      text: 'West Virginia'
    }, {
      value: 'WY',
      text: 'Wyoming'
    },
  ];
  AddressValidateViewModel.prototype.timeZoneOptions = [ //
    {
      value: 2,
      text: 'Atlantic Standard Time'
    }, {
      value: 4,
      text: 'Eastern Standard Time'
    }, {
      value: 6,
      text: 'Central Standard Time'
    }, {
      value: 8,
      text: 'Mountain Standard Time'
    }, {
      value: 10,
      text: 'Pacific Standard Time'
    }, {
      value: 12,
      text: 'Alaska Standard Time'
    }, {
      value: 14,
      text: 'Hawaii-Aleutian Standard Time'
    },
  ];
  AddressValidateViewModel.prototype.addressDirectionalTypeOptions = [ //
    {
      value: 'N',
      text: 'N - North North'
    }, {
      value: 'E',
      text: 'E - East  East'
    }, {
      value: 'S',
      text: 'S - South South'
    }, {
      value: "W",
      text: 'W - West  West'
    }, {
      value: 'NE',
      text: 'NE - North East North East'
    }, {
      value: 'SE',
      text: 'SE - South East South East'
    }, {
      value: 'NW',
      text: 'NW - North West North West'
    }, {
      value: 'SW',
      text: 'SW - South West South West'
    },
  ];
  AddressValidateViewModel.prototype.streetTypeOptions = [ //
    {
      value: 'AL',
      text: 'AL - ALLEY'
    }, {
      value: 'AV',
      text: 'AV - AVENUE'
    }, {
      value: 'BV',
      text: 'BV - BOULEVARD'
    }, {
      value: 'BD',
      text: 'BD - BUILDING'
    }, {
      value: 'CN',
      text: 'CN - CENTER'
    }, {
      value: 'CI',
      text: 'CI - CIRCLE'
    }, {
      value: 'CT',
      text: 'CT - COURT'
    }, {
      value: 'CS',
      text: 'CS - CRESCENT'
    }, {
      value: 'DA',
      text: 'DA - DALE'
    }, {
      value: 'DR',
      text: 'DR - DRIVE'
    }, {
      value: 'EX',
      text: 'EX - EXPRESSWAY'
    }, {
      value: 'FY',
      text: 'FY - FREEWAY'
    }, {
      value: 'GA',
      text: 'GA - GARDEN'
    }, {
      value: 'GR',
      text: 'GR - GROVE'
    }, {
      value: 'HT',
      text: 'HT - HEIGHTS'
    }, {
      value: 'HY',
      text: 'HY - HIGHWAY'
    }, {
      value: 'HI',
      text: 'HI - HILL'
    }, {
      value: 'KN',
      text: 'KN - KNOLL'
    }, {
      value: 'LN',
      text: 'LN - LANE'
    }, {
      value: 'LP',
      text: 'LP - LOOP'
    }, {
      value: 'MA',
      text: 'MA - MALL'
    }, {
      value: 'OV',
      text: 'OV - OVAL'
    }, {
      value: 'PK',
      text: 'PK - PARK'
    }, {
      value: 'PY',
      text: 'PY - PARKWAY'
    }, {
      value: 'PA',
      text: 'PA - PATH'
    }, {
      value: 'PI',
      text: 'PI - PIKE'
    }, {
      value: 'PL',
      text: 'PL - PLACE'
    }, {
      value: 'PZ',
      text: 'PZ - PLAZA'
    }, {
      value: 'PT',
      text: 'PT - POINT'
    }, {
      value: 'RD',
      text: 'RD - ROAD'
    }, {
      value: 'RT',
      text: 'RT - ROUTE'
    }, {
      value: 'RO',
      text: 'RO - ROW'
    }, {
      value: 'RN',
      text: 'RN - RUN'
    }, {
      value: 'RR',
      text: 'RR - RURALROUTE'
    }, {
      value: 'SQ',
      text: 'SQ - SQUARE'
    }, {
      value: 'ST',
      text: 'ST - STREET'
    }, {
      value: 'TC',
      text: 'TC - TERRACE'
    }, {
      value: 'TY',
      text: 'TY - THRUWAY'
    }, {
      value: 'TR',
      text: 'TR - TRAIL'
    }, {
      value: 'TP',
      text: 'TP - TURNPIKE'
    }, {
      value: 'VI',
      text: 'VI - VIADUCT'
    }, {
      value: 42,
      text: 'VW- VIEW'
    }, {
      value: 'WK',
      text: 'WK - WALK'
    }, {
      value: 'WY',
      text: 'WY - WAY'
    },
  ];



  return AddressValidateViewModel;
});
