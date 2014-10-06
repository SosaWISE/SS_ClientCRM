define('src/hr/recruiteditor.vm', [
  'src/account/default/address.validate.vm',
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
  AddressValidateViewModel,
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
  var schema, rcache,
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
      FullName: '',
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
        ukov.validators.isRequired('Role is required'),
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
        ukov.validators.isRequired('DL Status is required'),
      ],
    },
    DriversLicenseNotes: {
      converter: nullStrConverter,
      validators: [max250],
    },
    I9StatusID: {
      validators: [
        ukov.validators.isRequired('I9 Status is required'),
      ],
    },
    I9Notes: {
      converter: nullStrConverter,
      validators: [max250],
    },
    W9StatusID: {
      validators: [
        ukov.validators.isRequired('W9 Status is required'),
      ],
    },
    W9Notes: {
      converter: nullStrConverter,
      validators: [max250],
    },
    W4StatusID: {
      validators: [
        ukov.validators.isRequired('W4 Status is required'),
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

  // ctor
  function RecruitEditorViewModel(options) {
    var _this = this;
    RecruitEditorViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'item',
      'layersVm',
      'cache',
    ]);
    ControllerViewModel.ensureProps(_this.cache, [
      'seasons',
    ]);

    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({}, schema);
    _this.data.UserTypeCvm = new ComboViewModel({
      selectedValue: _this.data.UserTypeId,
      list: rcache.userTypes,
    });
    _this.data.ReportsToCvm = new ComboViewModel({
      selectedValue: _this.data.ReportsToID,
      list: rcache.reportsTos,
      nullable: true,
    });
    _this.data.TeamCvm = new ComboViewModel({
      selectedValue: _this.data.TeamID,
      list: rcache.teams,
      nullable: true,
    });
    _this.data.PayScaleCvm = new ComboViewModel({
      selectedValue: _this.data.PayScaleID,
      list: rcache.payScales,
      nullable: true,
    });
    _this.data.OwnerApprovalCvm = new ComboViewModel({
      selectedValue: _this.data.OwnerApprovalId,
      list: rcache.ownerApprovals,
      nullable: true,
    });
    _this.data.SchoolCvm = new ComboViewModel({
      selectedValue: _this.data.SchoolId,
      list: rcache.schools,
      nullable: true,
    });
    _this.data.DriversLicenseStatusCvm = new ComboViewModel({
      selectedValue: _this.data.DriversLicenseStatusID,
      list: rcache.docStatuses,
    });
    _this.data.I9StatusCvm = new ComboViewModel({
      selectedValue: _this.data.I9StatusID,
      list: rcache.docStatuses,
    });
    _this.data.W9StatusCvm = new ComboViewModel({
      selectedValue: _this.data.W9StatusID,
      list: rcache.docStatuses,
    });
    _this.data.W4StatusCvm = new ComboViewModel({
      selectedValue: _this.data.W4StatusID,
      list: rcache.docStatuses,
    });
    _this.data.CountryCvm = new ComboViewModel({
      selectedValue: _this.data.CountryId,
      list: rcache.countrys,
      nullable: true,
    });
    _this.data.StateCvm = new ComboViewModel({
      selectedValue: _this.data.StateId,
      list: rcache.states,
      nullable: true,
      fields: {
        text: function(item) {
          return strings.format('{0} - {1}', item.value, item.text);
        },
      },
    });
    _this.data.RecruitCohabbitTypeCvm = new ComboViewModel({
      selectedValue: _this.data.RecruitCohabbitTypeId,
      list: rcache.recruitCohabbitTypes,
      nullable: true,
    });

    _this.cache.seasons.some(function(s) {
      if (_this.item.SeasonID === s.SeasonID) {
        _this.seasonName = s.SeasonName;
        return true;
      }
    });
    _this.title = ko.computed(function() {
      return (_this.isNew() ? '(NEW) ' : '') + _this.seasonName;
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
        // only set if the userid hasn't changed
        if (_this.data.ShackingUpId.peek() === userid) {
          var data = resp.Value;
          data.FullName = calcFullName(data.PreferredName, data.FirstName, data.LastName);
          _this.buddy(data);
        }
      }, notify.error));
    });

    _this.editing = ko.observable(false);
    _this.viewTmpl = ko.computed(function() {
      if (_this.editing()) {
        return 'tmpl-hr-recruiteditor';
      } else {
        return 'tmpl-hr-recruitinfo';
      }
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
    _this.clickBuddy = function() {
      var vm = new UserSearchViewModel({
        pcontroller: _this,
        cache: _this.cache,
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
      saveRecruit(_this, cb);
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

    if (_this.isNew()) {
      _this.clickEdit();
    }
  }
  utils.inherits(RecruitEditorViewModel, ControllerViewModel);

  RecruitEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    // set data to passed in item
    // setting here instead of in ctor to more closely follow the onLoad pattern
    _this.data.setValue(_this.item);
    _this.data.markClean(_this.item);

    join.add()();
  };

  RecruitEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy()) {
      msg = 'Please wait for save to finish.';
    } else if (!_this.data.isClean() && _this.data.RecruitID.peek() > 0) {
      msg = 'There are unsaved changes. Please cancel the edit before closing.';
    }
    return msg;
  };
  RecruitEditorViewModel.prototype.isNew = function() {
    var _this = this;
    //@NOTE: this function is used in computables so peek should not be used
    return _this.data.RecruitID() < 0;
  };

  function calcFullName(pname, fname, lname) {
    return strings.joinTrimmed(' ', pname || fname, lname);
  }

  function saveRecruit(_this, cb) {
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
    } else {
      var model = _this.data.getValue();
      dataservice.humanresourcesrv.recruits.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        var data = resp.Value;
        if (data) {
          _this.data.setValue(data);
          _this.data.markClean(data, true);
          // end editing
          _this.editing(false);

          if (_this.id !== data.RecruitID) {
            // new
            _this.id = data.RecruitID;
            // redirect
            _this.goTo(_this.getRouteData());
          }
        }
      }, notify.error));
    }
  }

  // function load_teams(setter, cb) {
  //   //@TODO: load from the web api
  //   setter([]);
  //   setTimeout(function() {
  //     setter(usersCache.userEmployees);
  //     cb();
  //   }, 0);
  // }
  // function load_userTypes(setter, cb) {
  //   //@TODO: load from the web api
  //   setter([]);
  //   setTimeout(function() {
  //     setter(rcache.userTypes);
  //     cb();
  //   }, 0);
  // }

  rcache = {
    reportsTos: [ //
    ],
    teams: [ //
    ],
    ownerApprovals: [ //
    ],


    payScales: [ //
    ],
    schools: [ //
    ],
    states: AddressValidateViewModel.prototype.stateOptions,


    userTypes: [ //
      {
        value: 1,
        text: 'Administrator',
      }, {
        value: 2,
        text: 'Sales Manager',
      }, {
        value: 3,
        text: 'Sales Co-Manager',
      }, {
        value: 4,
        text: 'Sales Assistant Manager',
      }, {
        value: 5,
        text: 'Sales Rep',
      }, {
        value: 6,
        text: 'Technician Lead',
      }, {
        value: 7,
        text: 'Technician',
      }, {
        value: 8,
        text: 'Regional Manager - Technician',
      }, {
        value: 10,
        text: 'Technician Assistant Lead',
      }, {
        value: 11,
        text: 'Regional Manager - Sales',
      }, {
        value: 12,
        text: 'Corporate',
      }, {
        value: 13,
        text: 'Office Assistant',
      }, {
        value: 14,
        text: 'Inventory Manager',
      }, {
        value: 15,
        text: 'Corporate Service',
      }, {
        value: 18,
        text: 'Senior Regional - Sales',
      }, {
        value: 19,
        text: 'National Regional - Sales',
      }, {
        value: 20,
        text: 'National Regional - Technician',
      }, {
        value: 22,
        text: 'Service Technician',
      }, {
        value: 23,
        text: 'Vendor',
      },
    ],

    docStatuses: [ //
      {
        value: 1,
        text: 'Not Received',
      }, {
        value: 2,
        text: 'Incomplete',
      }, {
        value: 3,
        text: 'Complete',
      },
    ],
    countrys: [ //
      // {
      //   value: 'CAN',
      //   text: 'Canada',
      // },
      {
        value: 'USA',
        text: 'United States of America',
      },
    ],
    recruitCohabbitTypes: [ //
      {
        value: 1,
        text: 'Single',
      }, {
        value: 2,
        text: 'Cohabbit',
      }, {
        value: 3,
        text: 'Off Site',
      },
    ],
  };

  return RecruitEditorViewModel;
});
