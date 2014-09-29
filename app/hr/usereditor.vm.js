define('src/hr/usereditor.vm', [
  'src/core/combo.vm',
  'src/dataservice',
  'src/ukov',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  ComboViewModel,
  dataservice,
  ukov,
  strings,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var schema,
    max50 = ukov.validators.maxLength(50),
    max100 = ukov.validators.maxLength(100),
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,

    // FullName: {}, // computed (preferred || first last) (Bob Bobbins)
    // PublicFullName: {}, // computed (same as full name but with last name abbreviated) (Bob B.)

    UserID: {
      // validators: [],
    },
    RecruitedByID: {},
    GPEmployeeID: {
      converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('CompanyID is required'),
        ukov.validators.isCompanyID(),
      ],
    },
    UserEmployeeTypeId: {
      validators: [
        ukov.validators.isRequired('Employee Type is required'),
      ],
    },
    PermanentAddressID: {},
    SSN: {
      converter: ukov.converters.ssn(),
    },
    FirstName: {
      validators: [max50],
    },
    MiddleName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    LastName: {
      validators: [max50],
    },
    PreferredName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    CompanyName: {
      validators: [max50],
    },
    MaritalStatus: {
      converter: ukov.converters.bool,
    },
    SpouseName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    UserName: {
      validators: [
        ukov.validators.isRequired('Username is required'),
      ],
    },
    Password: {
      validators: [
        ukov.validators.isRequired('Password is required'),
        ukov.validators.isPassword(),
      ],
    },
    BirthDate: {
      converter: ukov.converters.date(),
    },
    HomeTown: {
      validators: [max50],
    },
    BirthCity: {
      validators: [max50],
    },
    BirthState: {
      validators: [max50],
    },
    BirthCountry: {
      validators: [max50],
    },
    Sex: {
      validators: [
        ukov.validators.isRequired('Gender is required'),
      ],
    },
    ShirtSize: {},
    HatSize: {},
    DLNumber: {
      validators: [max50],
    },
    DLState: {
      validators: [max50],
    },
    DLCountry: {
      validators: [max50],
    },
    DLExpiration: {
      converter: ukov.converters.date(),
      validators: [max50],
    },
    Height: {},
    Weight: {},
    EyeColor: {},
    HairColor: {},
    PhoneHome: {
      converter: ukov.converters.phone(),
    },
    PhoneCell: {
      converter: ukov.converters.phone(),
    },
    PhoneCellCarrierID: {
      converter: ukov.converters.number(0),
    },
    PhoneFax: {
      converter: ukov.converters.phone(),
    },
    Email: {
      // converter: strConverter,
      validators: [max100, ukov.validators.isEmail()],
    },
    CorporateEmail: {
      // converter: strConverter,
      validators: [max100, ukov.validators.isEmail()],
    },
    TreeLevel: {},
    HasVerifiedAddress: {
      converter: ukov.converters.bool(),
    },
    RightToWorkExpirationDate: {
      converter: ukov.converters.date(),
    },
    RightToWorkNotes: {},
    RightToWorkStatusID: {},
    IsLocked: {
      converter: ukov.converters.bool(),
    },
    IsActive: {
      converter: ukov.converters.bool(),
    },
    IsDeleted: {
      converter: ukov.converters.bool(),
    },
    RecruitedDate: {
      converter: ukov.converters.date(),
    },
    CreatedBy: {},
    CreatedOn: {},
    ModifiedBy: {},
    ModifiedOn: {},
  };

  // ctor
  function UserEditorViewModel(options) {
    var _this = this;
    UserEditorViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({}, schema);
    _this.data.ShirtSizeCvm = new ComboViewModel({
      selectedValue: _this.data.ShirtSize,
      list: _this.shirtSizeOptions,
      nullable: true,
    });
    _this.data.UserEmployeeTypeCvm = new ComboViewModel({
      selectedValue: _this.data.UserEmployeeTypeId,
      list: _this.userEmployeeOptions,
      nullable: true,
    });
    _this.data.HatSizeCvm = new ComboViewModel({
      selectedValue: _this.data.HatSize,
      list: _this.hatSizeOptions,
      nullable: true,
    });
    _this.data.SexCvm = new ComboViewModel({
      selectedValue: _this.data.Sex,
      list: _this.sexOptions,
    });
    _this.data.MaritalStatusCvm = new ComboViewModel({
      selectedValue: _this.data.MaritalStatus,
      list: _this.maritalStatusOptions,
      nullable: true,
    });
    _this.data.PhoneCellCarrierCvm = new ComboViewModel({
      selectedValue: _this.data.PhoneCellCarrierID,
      list: _this.phoneCellCarrierOptions,
      nullable: true,
    });

    _this.editing = ko.observable(false);
    _this.viewTmpl = ko.computed(function() {
      if (_this.editing()) {
        return 'tmpl-hr-usereditor';
      } else {
        return 'tmpl-hr-userinfo';
      }
    });

    _this.data.FullName = ko.computed(function() {
      return strings.joinTrimmed(' ', _this.data.PreferredName() || _this.data.FirstName(), _this.data.LastName());
    });

    //
    // events
    //
    _this.clickEdit = function() {
      _this.editing(true);
      _this.focusFirst(true);
    };
    _this.clickCancel = function() {
      _this.editing(false);
      //@TODO:
    };
    _this.clickSave = function() {
      //@TODO:
    };

    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(UserEditorViewModel, ControllerViewModel);
  // UserEditorViewModel.prototype.viewTmpl = 'tmpl-hr-usereditor';
  // viewTmpl: 'tmpl-hr-userinfo',

  UserEditorViewModel.prototype.shirtSizeOptions = [ //
    {
      value: 1,
      text: 'XXS'
    }, {
      value: 2,
      text: 'XS'
    }, {
      value: 3,
      text: 'S'
    }, {
      value: 4,
      text: 'M'
    }, {
      value: 5,
      text: 'L'
    }, {
      value: 6,
      text: 'XL'
    }, {
      value: 7,
      text: 'XXL'
    }, {
      value: 8,
      text: 'XXXL'
    },
  ];
  UserEditorViewModel.prototype.hatSizeOptions = [ //
    {
      value: 1,
      text: 'S'
    }, {
      value: 2,
      text: 'M'
    }, {
      value: 3,
      text: 'L'
    },
  ];
  UserEditorViewModel.prototype.sexOptions = [ //
    {
      value: 1,
      text: 'Male'
    }, {
      value: 2,
      text: 'Female'
    },
  ];
  UserEditorViewModel.prototype.maritalStatusOptions = [ //
    {
      value: false,
      text: 'Single'
    }, {
      value: true,
      text: 'Married'
    },
  ];

  //
  //@TODO: get the below options from the web api
  //
  UserEditorViewModel.prototype.userEmployeeOptions = [ //
    {
      value: 'CONT',
      text: ' Contractor',
    }, {
      value: 'CORP',
      text: ' Corporate',
    }, {
      value: 'DEFAULT',
      text: 'Default',
    }, {
      value: 'SALESREP',
      text: 'Sales Rep',
    }, {
      value: 'SUBCONT',
      text: 'Sub Contractor',
    }, {
      value: 'TECHNCN',
      text: 'Technician',
    }, {
      value: 'VENDOR',
      text: 'Vendor',
    },
  ];
  UserEditorViewModel.prototype.phoneCellCarrierOptions = [ //
    {
      value: 1,
      text: 'Verizon'
    }, {
      value: 2,
      text: 'TMobile'
    }, {
      value: 3,
      text: 'Sprint'
    }, {
      value: 4,
      text: 'CricKet'
    }, {
      value: 5,
      text: 'Cingular AT&T'
    }, {
      value: 6,
      text: 'NEXTEL'
    }, {
      value: 7,
      text: 'Unknown'
    }, {
      value: 8,
      text: 'amp\'d'
    }, {
      value: 9,
      text: 'Virgin mobile'
    }, {
      value: 10,
      text: 'Beyond GSM'
    }, {
      value: 11,
      text: 'boost mobile'
    }, {
      value: 12,
      text: 'Tracfone'
    }, {
      value: 13,
      text: 'Airvoice'
    }, {
      value: 14,
      text: 'Alltel'
    }, {
      value: 15,
      text: 'Qwest'
    }, {
      value: 16,
      text: 'metroPCS'
    }, {
      value: 17,
      text: 'Bell'
    }, {
      value: 18,
      text: 'Telus'
    }, {
      value: 19,
      text: 'Rogers'
    }, {
      value: 20,
      text: 'Fido'
    }, {
      value: 21,
      text: 'Edge'
    }, {
      value: 22,
      text: 'US Cellular'
    }, {
      value: 23,
      text: 'Cellular South'
    }, {
      value: 24,
      text: 'Centennial'
    }, {
      value: 25,
      text: 'Cingular'
    }, {
      value: 26,
      text: 'SunCom'
    }, {
      value: 27,
      text: 'US Cellular'
    },
  ];

  return UserEditorViewModel;
});
