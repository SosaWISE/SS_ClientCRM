define("src/hr/recruiteditor.vm", [
  "src/scheduler/techschedule.vm",
  "src/scheduler/techskills.vm",
  "src/hr/hr-cache",
  "src/account/default/address.validate.vm",
  "src/hr/usersearch.vm",
  "src/core/combo.vm",
  "src/dataservice",
  "src/ukov",
  "src/core/joiner",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
  "ko"
], function(
  TechScheduleViewModel,
  TechSkillsViewModel,
  hrcache,
  AddressValidateViewModel,
  UserSearchViewModel,
  ComboViewModel,
  dataservice,
  ukov,
  joiner,
  strings,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var schema,
    max50 = ukov.validators.maxLength(50),
    max200 = ukov.validators.maxLength(200),
    max250 = ukov.validators.maxLength(250),
    // isEmailValidator = ukov.validators.isEmail(),
    isZipCodeValidator = ukov.validators.isZipCode(),
    nullStrConverter = ukov.converters.nullString(),
    dateConverter = ukov.converters.date(),
    boolConverter = ukov.converters.bool(),
    phoneConverter = ukov.converters.phone(),
    moneyConverter = ukov.converters.number(2),
    // toLowerConverter = ukov.converters.toLower(),
    // toUpperConverter = ukov.converters.toUpper(),
    // ssnConverter = ukov.converters.ssn(),
    // intConverter = ukov.converters.number(0),
    defaultBuddy = {
      UserID: 0,
      FullName: "",
    };

  schema = {
    _model: true,

    //
    RecruitID: { //              [int] IDENTITY(110,1)      REQUIRED
    },
    UserID: { //                 [int]                      REQUIRED
    },
    SeasonID: {}, //             [int]                      REQUIRED

    //
    UserTypeId: { //             [smallint]                 REQUIRED       ((1))
      validators: [
        ukov.validators.isRequired("Role is required"),
      ],
    },
    ReportsToID: {}, //          [int]
    TeamID: {}, //               [int]
    PayScaleID: {}, //           [int]
    PreviousSummer: {
      converter: nullStrConverter,
      validators: [max200],
    },
    SignatureDate: {
      converter: dateConverter,
    },
    ManagerApprovalDate: {
      converter: dateConverter,
    },
    OwnerApprovalDate: {
      converter: dateConverter,
    },
    OwnerApprovalId: {}, //      [int]
    SchoolId: {}, //             [smallint]

    //
    DriversLicenseStatusID: {
      validators: [
        ukov.validators.isRequired("DL Status is required"),
      ],
    },
    DriversLicenseNotes: {
      converter: nullStrConverter,
      validators: [max250],
    },
    I9StatusID: {
      validators: [
        ukov.validators.isRequired("I9 Status is required"),
      ],
    },
    I9Notes: {
      converter: nullStrConverter,
      validators: [max250],
    },
    W9StatusID: {
      validators: [
        ukov.validators.isRequired("W9 Status is required"),
      ],
    },
    W9Notes: {
      converter: nullStrConverter,
      validators: [max250],
    },
    W4StatusID: {
      validators: [
        ukov.validators.isRequired("W4 Status is required"),
      ],
    },
    W4Notes: {
      converter: nullStrConverter,
      validators: [max250],
    },

    //
    EmergencyName: { //          [nvarchar](50)
      converter: nullStrConverter,
      validators: [max50],
    },
    EmergencyRelationship: { //  [nvarchar](50)
      converter: nullStrConverter,
      validators: [max50],
    },
    EmergencyPhone: { //         [varchar](20)
      converter: phoneConverter,
    },

    //
    CountryId: {}, //            [nvarchar](10)
    StreetAddress: { //          [nvarchar](50)
      converter: nullStrConverter,
      validators: [max50],
    },
    City: { //                   [nvarchar](50)
      converter: nullStrConverter,
      validators: [max50],
    },
    StateId: {}, //              [varchar](4)
    PostalCode: { //             [nvarchar](10)
      converter: nullStrConverter,
      validators: [
        isZipCodeValidator,
      ],
    },

    //
    RecruitCohabbitTypeId: {}, //[int]
    ShackingUpId: { //           [int]
    },
    Rent: { //                   [money]
      converter: moneyConverter,
    },
    Pet: { //                    [money]
      converter: moneyConverter,
    },
    Utilities: { //              [money]
      converter: moneyConverter,
    },
    Fuel: { //                   [money]
      converter: moneyConverter,
    },

    //
    // EIN: { //                    [nvarchar](50)
    // },
    // FedFilingStatus: { //        [nvarchar](50)
    // },
    // SUTA: { //                   [nvarchar](50)
    // },
    // EICFilingStatus: { //        [nvarchar](50)
    // },
    // WorkersComp: { //            [nvarchar](max)
    // },
    // StateFilingStatus: { //      [nvarchar](50)
    // },
    // TaxWitholdingState: { //     [nvarchar](5)
    // },
    // GPDependents: { //           [int]
    // },

    //
    DealerId: { //               [int]                      REQUIRED       ((5000))
    },
    // IsActive: { //               [bit]                      REQUIRED       ((1))
    //   converter: boolConverter,
    // },
    IsDeleted: { //              [bit]                      REQUIRED       ((0))
      converter: boolConverter,
    },

    //
    CreatedBy: {},
    CreatedOn: {},
    ModifiedBy: {},
    ModifiedOn: {},
  };

  var hardCodedFields = {
    value: "ID",
    text: "Txt",
  };

  // ctor
  function RecruitEditorViewModel(options) {
    var _this = this;
    RecruitEditorViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
      "seasons",
    ]);

    _this.initFocusFirst();
    _this.data = ukov.wrap({
      RecruitID: _this.id,
      DriversLicenseStatusID: 1,
      I9StatusID: 1,
      W9StatusID: 1,
      W4StatusID: 1,
    }, schema);
    _this.data.UserTypeCvm = new ComboViewModel({
      selectedValue: _this.data.UserTypeId,
      fields: {
        value: "UserTypeID",
        text: "Description",
      },
    });
    _this.data.ReportsToCvm = new ComboViewModel({
      selectedValue: _this.data.ReportsToID,
      nullable: true,
    });
    _this.data.TeamCvm = new ComboViewModel({
      selectedValue: _this.data.TeamID,
      nullable: true,
      fields: {
        value: "TeamID",
        text: "Description",
      },
    });
    _this.data.PayScaleCvm = new ComboViewModel({
      selectedValue: _this.data.PayScaleID,
      nullable: true,
    });
    _this.data.OwnerApprovalCvm = new ComboViewModel({
      selectedValue: _this.data.OwnerApprovalId,
      nullable: true,
    });
    _this.data.SchoolCvm = new ComboViewModel({
      selectedValue: _this.data.SchoolId,
      nullable: true,
    });
    _this.data.DriversLicenseStatusCvm = new ComboViewModel({
      selectedValue: _this.data.DriversLicenseStatusID,
      fields: hardCodedFields,
    });
    _this.data.I9StatusCvm = new ComboViewModel({
      selectedValue: _this.data.I9StatusID,
      fields: hardCodedFields,
    });
    _this.data.W9StatusCvm = new ComboViewModel({
      selectedValue: _this.data.W9StatusID,
      fields: hardCodedFields,
    });
    _this.data.W4StatusCvm = new ComboViewModel({
      selectedValue: _this.data.W4StatusID,
      fields: hardCodedFields,
    });
    _this.data.CountryCvm = new ComboViewModel({
      selectedValue: _this.data.CountryId,
      nullable: true,
      fields: hardCodedFields,
    });
    _this.data.StateCvm = new ComboViewModel({
      selectedValue: _this.data.StateId,
      list: AddressValidateViewModel.prototype.stateOptions,
      nullable: true,
      fields: {
        text: function(item) {
          return strings.format("{0} - {1}", item.value, item.text);
        },
      },
    });
    _this.data.RecruitCohabbitTypeCvm = new ComboViewModel({
      selectedValue: _this.data.RecruitCohabbitTypeId,
      nullable: true,
      fields: hardCodedFields,
    });

    _this.seasonName = ko.observable("unknown season");
    _this.title = ko.computed(function() {
      return (!_this.isOld() ? "(NEW) " : "") + _this.seasonName();
    });

    _this.buddy = ko.observable(defaultBuddy);
    _this.data.ShackingUpId.subscribe(function(userid) {
      if (!userid) {
        return;
      }
      var buddy = _this.buddy.peek();
      if (buddy && buddy.UserID === userid) {
        // already set
        return;
      }
      // clear out
      _this.buddy(defaultBuddy);
      dataservice.humanresourcesrv.users.read({
        id: userid,
      }, null, utils.safeCallback(null, function(err, resp) {
        // only set if the userid has not changed
        if (_this.data.ShackingUpId.peek() === userid) {
          var data = resp.Value;
          data.FullName = calcFullName(data.PreferredName, data.FirstName, data.LastName);
          _this.buddy(data);
        }
      }, notify.iferror));
    });

    _this.scheduleVm = ko.observable();
    _this.skillsVm = ko.observable();

    _this.editing = ko.observable(false);
    _this.viewTmpl = ko.computed(function() {
      if (_this.editing()) {
        return "tmpl-hr-recruiteditor";
      } else {
        return "tmpl-hr-recruitinfo";
      }
    });

    _this.isDirty = ko.computed({
      deferEvaluation: true,
      read: function() {
        var scheduleVm = _this.scheduleVm();
        var skillsVm = _this.skillsVm();
        return _this.editing() && (!_this.data.isClean() ||
          (scheduleVm && !scheduleVm.data.isClean()) ||
          (skillsVm && !skillsVm.data.isClean())
        );
      },
    });

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.isDirty()) {
        notify.confirm("Reset changes?", "There are unsaved changes. Click yes to undo these changes.", function(result) {
          if (result !== "yes") {
            return;
          }
          _this.editing(false);
          _this.data.reset(true);
          _this.scheduleVm.peek().data.reset(true);
          _this.skillsVm.peek().data.reset(true);
        });
      } else {
        _this.editing(false);
      }
    };
    _this.clickEdit = function() {
      _this.editing(true);
      _this.focusFirst(true);
    };
    _this.clickBuddy = function() {
      var vm = new UserSearchViewModel({
        pcontroller: _this,
        open: function(item) {
          item.FullName = calcFullName(item.PreferredName, item.FirstName, item.LastName);
          _this.buddy(item);
          _this.data.ShackingUpId(item.UserID);
          vm.layer.close();
        },
      });
      _this.layersVm.show(vm);
    };
    _this.cmdSave = ko.command(function(cb) {
      saveAllData(_this, cb);
    }, function(busy) {
      return !busy && _this.isDirty();
    });

    //
    if (!_this.isOld()) {
      _this.clickEdit();
    }
  }
  utils.inherits(RecruitEditorViewModel, ControllerViewModel);

  RecruitEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    hrcache.ensure("payscales", join.add());
    hrcache.ensure("schools", join.add());
    hrcache.ensure("teams", join.add());
    hrcache.ensure("userTypes", join.add());
    // hrcache.ensure("owners", join.add());

    hrcache.ensure("docStatuses", join.add());
    hrcache.ensure("countrys", join.add());
    hrcache.ensure("recruitCohabbitTypes", join.add());

    hrcache.ensure("skills", join.add());

    var techSkills;
    loadRecruitData(_this._item.RecruitID, "skills", function(val) {
      techSkills = val || [];
    }, join.add());

    var techDays;
    loadRecruitData(_this._item.RecruitID, "weekSchedule", function(val) {
      techDays = val || [];
    }, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.data.PayScaleCvm.setList(hrcache.getList("payscales").peek());
      _this.data.SchoolCvm.setList(hrcache.getList("schools").peek());
      _this.data.TeamCvm.setList(hrcache.getList("teams").peek());
      _this.data.UserTypeCvm.setList(hrcache.getList("userTypes").peek());
      // _this.data.OwnerApprovalCvm.setList(hrcache.getList("owners").peek());

      _this.data.DriversLicenseStatusCvm.setList(hrcache.getList("docStatuses").peek());
      _this.data.I9StatusCvm.setList(hrcache.getList("docStatuses").peek());
      _this.data.W9StatusCvm.setList(hrcache.getList("docStatuses").peek());
      _this.data.W4StatusCvm.setList(hrcache.getList("docStatuses").peek());
      _this.data.CountryCvm.setList(hrcache.getList("countrys").peek());
      _this.data.RecruitCohabbitTypeCvm.setList(hrcache.getList("recruitCohabbitTypes").peek());

      // SeasonID, UserTypeID - reportsTos, teams
      // _this.data.ReportsToCvm.setList(hrcache.getList("ReportsTo").peek());
      // _this.data.TeamCvm.setList(hrcache.getList("teams").peek());

      _this.skillsVm(new TechSkillsViewModel({
        allSkills: hrcache.getList("skills").peek(),
        techSkills: techSkills,
      }));
      _this.scheduleVm(new TechScheduleViewModel({
        techDays: techDays,
      }));
    });
  };
  RecruitEditorViewModel.prototype.setItem = function(item) {
    var _this = this;
    // set seasonName and SeasonID
    _this.seasons.some(function(s) {
      if (item.SeasonID === s.SeasonID) {
        _this.seasonName(s.SeasonName);
        return true;
      }
    });
    _this.data.SeasonID(item.SeasonID);
    _this.data.RecruitID(item.RecruitID);
    // set item once we have loaded
    _this._item = item;
    _this.loader.onLoad(function() {
      _this._item = null;
      _this.data.setValue(item);
      _this.data.markClean(item);
    });
  };
  RecruitEditorViewModel.prototype.getItem = function() {
    var _this = this;
    return _this._item || _this.data.getValue();
  };

  RecruitEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy()) {
      msg = "Please wait for save to finish.";
    } else if (_this.isDirty.peek() && _this.data.RecruitID.peek() > 0) {
      msg = "There are unsaved changes for " + _this.title.peek() + ". Please cancel the edit before closing.";
    }
    return msg;
  };
  RecruitEditorViewModel.prototype.isOld = function() {
    var _this = this;
    //@NOTE: this function is used in computables so peek should not be used
    return (_this.data.RecruitID() > 0);
  };

  function calcFullName(pname, fname, lname) {
    return strings.joinTrimmed(" ", pname || fname, lname);
  }

  function saveAllData(_this, cb) {
    var scheduleVm = _this.scheduleVm.peek();
    var skillsVm = _this.skillsVm.peek();

    var isValid = _this.data.isValid() && scheduleVm.data.isValid() && skillsVm.data.isValid();
    if (!isValid) {
      var errMsg = _this.data.errMsg() || scheduleVm.data.errMsg() || skillsVm.data.errMsg();
      notify.warn(errMsg, null, 7);
      cb();
      return;
    }
    var join = joiner();

    saveRecruit(_this, utils.safeCallback(join.add(), function() {
      saveRecruitData(_this.id, "weekSchedule", scheduleVm, join.add());
      saveRecruitData(_this.id, "skills", skillsVm, join.add());
    }, utils.noop));

    join.when(function(err) {
      if (!err) {
        // end editing
        _this.editing(false);
      }
      cb();
    });
  }

  function saveRecruit(_this, cb) {
    if (_this.data.isClean()) {
      // only save if dirty
      return cb();
    }

    var model = _this.data.getValue();
    dataservice.humanresourcesrv.recruits.save({
      data: model,
    }, function(data) {
      if (_this.id !== data.RecruitID) {
        // was a new recruit
        _this.id = data.RecruitID;
        // redirect
        _this.goTo(_this.getRouteData());
      }

      _this.data.setValue(data);
      _this.data.markClean(data, true);
    }, cb);
  }

  function loadRecruitData(id, link, setter, cb) {
    if (id <= 0) {
      setter();
      cb();
    }
    dataservice.humanresourcesrv.recruits.read({
      id: id,
      link: link,
    }, setter, cb);
  }

  function saveRecruitData(id, link, vm, cb) {
    dataservice.humanresourcesrv.recruits.save({
      id: id,
      link: link,
      data: vm.getData(),
    }, function(val) {
      vm.setData(val);
    }, cb);
  }

  return RecruitEditorViewModel;
});
