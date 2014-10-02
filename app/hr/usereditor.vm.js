define('src/hr/usereditor.vm', [
  'src/hr/usersearch.vm',
  'src/core/combo.vm',
  'src/dataservice',
  'src/ukov',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  UserSearchViewModel,
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
  var pwdSchema, schema,
    max50 = ukov.validators.maxLength(50),
    max100 = ukov.validators.maxLength(100),
    nullStrConverter = ukov.converters.nullString(),
    defaultRecruitedBy = {
      UserID: 0,
      FullName: '',
    };

  pwdSchema = {
    validators: [
      ukov.validators.isRequired('Password is required'),
      ukov.validators.isPassword(),
    ],
  };

  schema = {
    _model: true,

    // FullName: {}, // computed (preferred || first last) (Bob Bobbins)
    // PublicFullName: {}, // computed (same as full name but with last name abbreviated) (Bob B.)

    UserID: {
      // validators: [],
    },

    UserName: {
      converter: ukov.converters.toLower(),
      validators: [
        ukov.validators.isRequired('Username is required'),
        ukov.validators.isUsername(),
        ukov.validators.isInLengthRange(6, 50),
      ],
    },
    Password: {
      // validators: [
      //   ukov.validators.isRequired('Password is required'),
      //   ukov.validators.isPassword(),
      // ],
    },
    Email: {
      converter: ukov.converters.toLower(),
      validators: [max100, ukov.validators.isEmail()],
    },
    CorporateEmail: {
      // converter: strConverter,
      validators: [max100, ukov.validators.isEmail()],
    },

    GPEmployeeID: {
      converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('CompanyID is required'),
        ukov.validators.isCompanyID(),
      ],
    },
    UserEmployeeTypeId: {
      validators: [
        ukov.validators.isRequired('Employee type is required'),
      ],
    },
    PermanentAddressID: {},
    SSN: {
      // converter: nullStrConverter,
      converter: ukov.converters.ssn(),
      validators: [
        ukov.validators.isSsn(),
      ],
    },
    FirstName: {
      validators: [
        max50,
        ukov.validators.isRequired('First name is required'),
      ],
    },
    MiddleName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    LastName: {
      validators: [
        max50,
        ukov.validators.isRequired('Last name is required'),
      ],
    },
    PreferredName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    CompanyName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    MaritalStatus: {
      converter: ukov.converters.bool,
    },
    SpouseName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    BirthDate: {
      converter: ukov.converters.date(),
    },
    HomeTown: {
      converter: nullStrConverter,
      validators: [max50],
    },
    BirthCity: {
      converter: nullStrConverter,
      validators: [max50],
    },
    BirthState: {
      converter: nullStrConverter,
      validators: [max50],
    },
    BirthCountry: {
      converter: nullStrConverter,
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
      converter: nullStrConverter,
      validators: [max50],
    },
    DLState: {
      converter: nullStrConverter,
      validators: [max50],
    },
    DLCountry: {
      converter: nullStrConverter,
      validators: [max50],
    },
    DLExpiresOn: {
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

    RecruitedByID: {
      validators: [
        ukov.validators.isRequired('Recruited by is required'),
      ],
    },
    RecruitedDate: {
      converter: ukov.converters.date(),
      validators: [
        ukov.validators.isRequired('Recruited date is required'),
      ],
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
    ControllerViewModel.ensureProps(_this, [
      'cache',
      'layersVm',
    ]);
    ControllerViewModel.ensureProps(_this.cache, [
      'shirtSizeOptions',
      'hatSizeOptions',
      'sexOptions',
      'maritalStatusOptions',
      'userEmployeeOptions',
      'phoneCellCarrierOptions',
    ]);

    _this.title = ko.observable(_this.title);
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({}, schema);
    _this.data.ShirtSizeCvm = new ComboViewModel({
      selectedValue: _this.data.ShirtSize,
      list: _this.cache.shirtSizeOptions,
      nullable: true,
    });
    _this.data.UserEmployeeTypeCvm = new ComboViewModel({
      selectedValue: _this.data.UserEmployeeTypeId,
      list: _this.cache.userEmployeeOptions,
      nullable: true,
    });
    _this.data.HatSizeCvm = new ComboViewModel({
      selectedValue: _this.data.HatSize,
      list: _this.cache.hatSizeOptions,
      nullable: true,
    });
    _this.data.SexCvm = new ComboViewModel({
      selectedValue: _this.data.Sex,
      list: _this.cache.sexOptions,
    });
    _this.data.MaritalStatusCvm = new ComboViewModel({
      selectedValue: _this.data.MaritalStatus,
      list: _this.cache.maritalStatusOptions,
      nullable: true,
    });
    _this.data.PhoneCellCarrierCvm = new ComboViewModel({
      selectedValue: _this.data.PhoneCellCarrierID,
      list: _this.cache.phoneCellCarrierOptions,
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
      return calcFullName(_this.data.PreferredName(), _this.data.FirstName(), _this.data.LastName());
    });

    _this.recruitedBy = ko.observable(defaultRecruitedBy);
    _this.data.RecruitedByID.subscribe(function(userid) {
      if (!userid) {
        return;
      }
      var recruitedBy = _this.recruitedBy.peek();
      if (recruitedBy && recruitedBy.UserID === userid) {
        // already set
        return;
      }
      // clear out
      _this.recruitedBy(defaultRecruitedBy);
      dataservice.humanresourcesrv.users.read({
        id: userid,
      }, null, utils.safeCallback(null, function(err, resp) {
        // only set if the userid hasn't changed
        if (_this.data.RecruitedByID.peek() === userid) {
          var data = resp.Value;
          data.FullName = calcFullName(data.PreferredName, data.FirstName, data.LastName);
          _this.recruitedBy(data);
        }
      }, notify.error));
    });

    //
    // events
    //
    function resetData(result) {
      if (result === 'yes') {
        _this.editing(false);
        _this.data.reset(true);
      }
    }
    _this.clickCancel = function() {
      if (_this.data.isClean()) {
        resetData('yes');
      } else {
        notify.confirm('Reset changes?', 'There are unsaved changes. Click yes to undo these changes.', resetData);
      }
    };
    _this.clickEdit = function() {
      _this.editing(true);
      _this.focusFirst(true);
    };
    _this.clickRecruitedBy = function() {
      var vm = new UserSearchViewModel({
        pcontroller: _this,
        open: function(item) {
          item.FullName = calcFullName(item.PreferredName, item.FirstName, item.LastName);
          _this.recruitedBy(item);
          _this.data.RecruitedByID(item.UserID);
          vm.layer.close();
        },
      });
      _this.layersVm.show(vm);
    };
    _this.clickNewPassword = function() {
      genPassword(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      saveUser(_this, cb);
    }, function(busy) {
      return !busy && !_this.data.isClean();
    });

    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

    // always start with a generated password
    genPassword(_this);
  }
  utils.inherits(UserEditorViewModel, ControllerViewModel);
  // UserEditorViewModel.prototype.viewTmpl = 'tmpl-hr-usereditor';
  // viewTmpl: 'tmpl-hr-userinfo',

  UserEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy()) {
      msg = 'Please wait for save to finish.';
    } else if (!_this.data.isClean() && _this.data.UserID.peek() > 0) {
      msg = 'There are unsaved changes. Please cancel the edit before closing.';
    }
    return msg;
  };

  function calcFullName(pname, fname, lname) {
    // return strings.joinTrimmed(' ', _this.data.PreferredName() || _this.data.FirstName(), _this.data.LastName());
    return strings.joinTrimmed(' ', pname || fname, lname);
  }

  function genPassword(_this) {
    _this.data.Password(strings.randomPassword(10));
  }

  function saveUser(_this, cb) {
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
    } else {
      var model = _this.data.getValue();
      dataservice.humanresourcesrv.users.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        var data = resp.Value;
        if (data) {
          _this.data.setValue(data);
          _this.data.markClean(data, true);
          // end editing
          _this.editing(false);

          if (!model.UserID) {

          }
        }
      }, notify.error));
    }
  }

  return UserEditorViewModel;
});
