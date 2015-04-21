define("src/hr/usereditor.vm", [
  "src/viz/idphoto.vm",
  "howie",
  "src/hr/hr-cache",
  "src/hr/usersearch.vm",
  "src/core/combo.vm",
  "src/dataservice",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
  "ko"
], function(
  IdPhotoViewModel,
  howie,
  hrcache,
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

  var schema,
    max20 = ukov.validators.maxLength(20),
    max50 = ukov.validators.maxLength(50),
    max100 = ukov.validators.maxLength(100),
    isEmailValidator = ukov.validators.isEmail(),
    nullStrConverter = ukov.converters.nullString(),
    dateConverter = ukov.converters.date(),
    boolConverter = ukov.converters.bool(),
    phoneConverter = ukov.converters.phone(),
    toLowerConverter = ukov.converters.toLower(),
    toUpperConverter = ukov.converters.toUpper(),
    ssnConverter = ukov.converters.ssn(),
    intConverter = ukov.converters.number(0),
    defaultRecruitedBy = {
      UserID: 0,
      FullName: "",
    };

  schema = {
    _model: true,

    // FullName: {}, // computed (preferred || first last) (Bob Bobbins)
    // PublicFullName: {}, // computed (same as full name but with last name abbreviated) (Bob B.)

    UserID: {
      // validators: [],
    },

    UserName: {
      converter: toLowerConverter,
      validators: [
        ukov.validators.isRequired("Username is required"),
        ukov.validators.isUsername(),
        ukov.validators.isInLengthRange(2, 50),
      ],
    },
    Password: {
      // validators: [
      //   ukov.validators.isRequired("Password is required"),
      //   ukov.validators.isPassword(),
      // ],
    },
    Email: {
      converter: toLowerConverter,
      validators: [max100, isEmailValidator],
    },
    CorporateEmail: {
      // converter: strConverter,
      validators: [max100, isEmailValidator],
    },

    GPEmployeeID: {
      converter: toUpperConverter,
      validators: [
        ukov.validators.isRequired("CompanyID is required"),
        ukov.validators.isCompanyID(),
      ],
    },
    UserEmployeeTypeId: {
      validators: [
        ukov.validators.isRequired("Employee type is required"),
      ],
    },
    PermanentAddressID: {},
    SSN: {
      // converter: nullStrConverter,
      converter: ssnConverter,
      validators: [
        ukov.validators.isSsn(),
      ],
    },
    FirstName: {
      validators: [
        max50,
        ukov.validators.isRequired("First name is required"),
      ],
    },
    MiddleName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    LastName: {
      validators: [
        max50,
        ukov.validators.isRequired("Last name is required"),
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
      converter: boolConverter,
    },
    SpouseName: {
      converter: nullStrConverter,
      validators: [max50],
    },
    BirthDate: {
      converter: dateConverter,
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
        ukov.validators.isRequired("Gender is required"),
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
      converter: dateConverter,
      validators: [max50],
    },
    Height: {
      converter: ukov.converters.inches("Invalid Height"),
      validators: [
        ukov.validators.isInt(),
        ukov.validators.isInRange(0, 120, "Height is not between {0:ft} and {1:ft}")
      ],
    },
    Weight: {
      converter: intConverter,
      validators: [
        ukov.validators.isInt(),
        ukov.validators.isInRange(0, 2000),
      ],
    },
    EyeColor: {
      converter: nullStrConverter,
      validators: [max20],
    },
    HairColor: {
      converter: nullStrConverter,
      validators: [max20],
    },
    PhoneHome: {
      converter: phoneConverter,
    },
    PhoneCell: {
      converter: phoneConverter,
    },
    PhoneCellCarrierID: {
      converter: intConverter,
    },
    PhoneFax: {
      converter: phoneConverter,
    },
    TreeLevel: {},
    HasVerifiedAddress: {
      converter: boolConverter,
    },
    RightToWorkExpirationDate: {
      converter: dateConverter,
    },
    RightToWorkNotes: {},
    RightToWorkStatusID: {},
    IsLocked: {
      converter: boolConverter,
    },
    IsActive: {
      converter: boolConverter,
    },
    IsDeleted: {
      converter: boolConverter,
    },

    RecruitedByID: {
      validators: [
        ukov.validators.isRequired("Recruited by is required"),
      ],
    },
    RecruitedDate: {
      converter: dateConverter,
      validators: [
        ukov.validators.isRequired("Recruited date is required"),
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
      "layersVm",
    ]);

    _this.initFocusFirst();
    _this.data = ukov.wrap({
      UserID: _this.userid || 0,
      IsActive: true,
    }, schema);
    _this.data.ShirtSizeCvm = new ComboViewModel({
      selectedValue: _this.data.ShirtSize,
      nullable: true,
      fields: hrcache.metadata("shirtSizes"),
    });
    _this.data.UserEmployeeTypeCvm = new ComboViewModel({
      selectedValue: _this.data.UserEmployeeTypeId,
      nullable: true,
      fields: hrcache.metadata("userEmployeeTypes"),
    });
    _this.data.HatSizeCvm = new ComboViewModel({
      selectedValue: _this.data.HatSize,
      nullable: true,
      fields: hrcache.metadata("hatSizes"),
    });
    _this.data.EyeColorCvm = new ComboViewModel({
      selectedValue: _this.data.EyeColor,
      nullable: true,
      fields: hrcache.metadata("eyeColors"),
    });
    _this.data.HairColorCvm = new ComboViewModel({
      selectedValue: _this.data.HairColor,
      nullable: true,
      fields: hrcache.metadata("hairColors"),
    });
    _this.data.SexCvm = new ComboViewModel({
      selectedValue: _this.data.Sex,
      fields: hrcache.metadata("shirtSizes"),
    });
    _this.data.MaritalStatusCvm = new ComboViewModel({
      selectedValue: _this.data.MaritalStatus,
      nullable: true,
      fields: hrcache.metadata("maritalStatuses"),
    });
    _this.data.PhoneCellCarrierCvm = new ComboViewModel({
      selectedValue: _this.data.PhoneCellCarrierID,
      nullable: true,
      fields: hrcache.metadata("phoneCellCarriers"),
    });
    _this.tcmdActive = ko.command(function(cb) {
      var toggle = _this.tcmdActive.toggle;
      toggle.isDown(!toggle.isDown.peek());
      cb();
    }, null, {
      toggle: {
        isDown: _this.data.IsActive,
        down: {
          cls: "active",
          text: "Active",
        },
        up: {
          text: "Inactive",
        },
      }
    });

    _this.editing = ko.observable(false);
    _this.viewTmpl = ko.computed(function() {
      if (_this.editing()) {
        return "tmpl-hr-usereditor";
      } else {
        return "tmpl-hr-userinfo";
      }
    });
    _this.isDirty = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.editing() && !_this.data.isClean();
      },
    });
    _this.data.FullName = ko.computed(function() {
      return calcFullName(_this.data.PreferredName(), _this.data.FirstName(), _this.data.LastName());
    });

    _this.data.imgUrl = ko.observable();
    //
    function updateImgUrl() {
      _this.data.imgUrl(strings.format("//{0}/HumanResourceSrv/users/{1}/photo?_={2}",
        howie.fetch("config").serviceDomain, _this.data.UserID.peek() || 0, Math.random()));
    }
    _this.data.UserID.subscribe(updateImgUrl);

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
      dataservice.hr.users.read({
        id: userid,
      }, null, utils.safeCallback(null, function(err, resp) {
        // only set if the userid has not changed
        if (_this.data.RecruitedByID.peek() === userid) {
          var data = resp.Value;
          data.FullName = calcFullName(data.PreferredName, data.FirstName, data.LastName);
          _this.recruitedBy(data);
        }
      }, notify.iferror));
    });

    //
    // events
    //
    function resetData(result) {
      if (result === "yes") {
        _this.editing(false);
        _this.data.reset(true);
      }
    }
    _this.clickCancel = function() {
      if (!_this.isDirty()) {
        resetData("yes");
      } else {
        notify.confirm("Reset changes?", "There are unsaved changes. Click yes to undo these changes.", resetData);
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
    _this.cmdImage = ko.command(function(cb) {
      _this.dropImage.execute(_this.data.imgUrl.peek());
      cb();
    }, function(busy) {
      return !busy && !_this.dropImage.busy();
    });
    _this.dropImage = ko.command(function(cb, _, args) {
      var imgUrl = args[0],
        userid = _this.data.UserID.peek();
      if (!imgUrl || userid < 1) {
        cb();
        if (userid < 1) {
          notify.info("Save the user first", null, 5);
        }
        return;
      }
      var vm = new IdPhotoViewModel({
        userid: userid,
        imgUrl: args[0],
      });
      _this.layersVm.show(vm, function(reloadImg) {
        if (reloadImg) {
          updateImgUrl();
        }
        cb();
      });
    });

    // always start with a generated password
    genPassword(_this);
  }
  utils.inherits(UserEditorViewModel, ControllerViewModel);
  // UserEditorViewModel.prototype.viewTmpl = "tmpl-hr-usereditor";
  // viewTmpl: "tmpl-hr-userinfo",

  UserEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    hrcache.ensure("shirtSizes", join.add());
    hrcache.ensure("hatSizes", join.add());
    hrcache.ensure("eyeColors", join.add());
    hrcache.ensure("hairColors", join.add());
    hrcache.ensure("sexs", join.add());
    hrcache.ensure("maritalStatuses", join.add());
    hrcache.ensure("userEmployeeTypes", join.add());
    hrcache.ensure("phoneCellCarriers", join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.data.ShirtSizeCvm.setList(hrcache.getList("shirtSizes").peek());
      _this.data.HatSizeCvm.setList(hrcache.getList("hatSizes").peek());
      _this.data.EyeColorCvm.setList(hrcache.getList("eyeColors").peek());
      _this.data.HairColorCvm.setList(hrcache.getList("hairColors").peek());
      _this.data.SexCvm.setList(hrcache.getList("sexs").peek());
      _this.data.MaritalStatusCvm.setList(hrcache.getList("maritalStatuses").peek());
      _this.data.UserEmployeeTypeCvm.setList(hrcache.getList("userEmployeeTypes").peek());
      _this.data.PhoneCellCarrierCvm.setList(hrcache.getList("phoneCellCarriers").peek());
    });
  };
  UserEditorViewModel.prototype.setItem = function(item) {
    var _this = this;
    // set item now in order to show title even if onLoad is never called
    _this.data.setValue(item);
    // set item once we are loaded
    _this.loader.onLoad(function() {
      _this.data.setValue(item);
      _this.data.markClean(item);
    });
  };

  UserEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy()) {
      msg = "Please wait for save to finish.";
    } else if (_this.isDirty.peek() && _this.data.UserID.peek() > 0) {
      msg = "There are unsaved changes for User Info. Please cancel the edit before closing.";
    }
    return msg;
  };

  function calcFullName(pname, fname, lname) {
    // return strings.joinTrimmed(" ", _this.data.PreferredName() || _this.data.FirstName(), _this.data.LastName());
    return strings.joinTrimmed(" ", pname || fname, lname);
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
      dataservice.hr.users.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        var data = resp.Value,
          pcontroller = _this.pcontroller;
        if (!data) {
          return;
        }
        if (pcontroller.id !== data.UserID) {
          // was a new user
          pcontroller.id = data.UserID;
          // redirect
          _this.goTo(pcontroller.getRouteData());
        }

        _this.data.setValue(data);
        _this.data.markClean(data, true);
        // end editing
        _this.editing(false);
      }, notify.iferror));
    }
  }

  return UserEditorViewModel;
});
