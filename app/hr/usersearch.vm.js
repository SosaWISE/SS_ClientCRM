define('src/hr/usersearch.vm', [
  'src/core/combo.vm',
  'src/dataservice',
  'src/hr/usersearch.gvm',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  ComboViewModel,
  dataservice,
  SearchGridViewModel,
  ukov,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,

    CompanyID: {
      converter: nullStrConverter,
    },
    FirstName: {
      converter: nullStrConverter,
    },
    LastName: {
      converter: nullStrConverter,
    },
    Email: {
      converter: nullStrConverter,
    },
    UserName: {
      converter: nullStrConverter,
    },
    UserID: {
      converter: nullStrConverter,
    },
    RecruitID: {
      converter: nullStrConverter,
    },
    Ssn: {
      converter: nullStrConverter,
    },
    PhoneCell: {
      converter: ukov.converters.phone(),
    },
    PhoneHome: {
      converter: ukov.converters.phone(),
    },
    SeasonID: {},
    UserEmployeeTypeId: {},

    // PageSize: {
    //   converter: ukov.converters.number(0),
    //   validators: [
    //     ukov.validators.isRequired('Results per Page is required'),
    //   ],
    // },
    // PageNumber: {
    //   converter: ukov.converters.number(0),
    // },
  };

  // ctor
  function UserSearchViewModel(options) {
    var _this = this;
    UserSearchViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'cache',
    ]);
    ControllerViewModel.ensureProps(_this.cache, [
      'seasons',
      'userEmployeeTypes',
    ]);

    _this.title = ko.observable(_this.title);
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({}, schema);
    clearData(_this);
    _this.data.SeasonCvm = new ComboViewModel({
      selectedValue: _this.data.SeasonID,
      list: _this.cache.seasons,
      nullable: true,
      fields: {
        value: 'SeasonID',
        text: 'SeasonName',
      },
    });
    _this.data.UserTypeCvm = new ComboViewModel({
      selectedValue: _this.data.UserEmployeeTypeId,
      list: _this.cache.userEmployeeTypes,
      nullable: true,
      fields: {
        value: 'UserEmployeeTypeID',
        text: 'UserEmployeeTypeName',
      },
    });

    _this.gvm = new SearchGridViewModel({
      open: _this.open || function(item) {
        _this.goTo({
          route: 'hr',
          collection: 'users',
          id: item.UserID,
        });
      },
    });

    //
    // events
    //
    _this.cmdOpenAccount = ko.command(function(cb) {
      _this.openAccount(cb);
    });
    _this.cmdSearch = ko.command(function(cb) {
      search(_this, cb);
    });
    _this.clickClear = function() {
      clearData(_this);
      _this.focusFirst(true);
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
  utils.inherits(UserSearchViewModel, ControllerViewModel);
  UserSearchViewModel.prototype.viewTmpl = 'tmpl-hr-usersearch';
  UserSearchViewModel.prototype.height = 500;
  UserSearchViewModel.prototype.width = '80%';

  function clearData(_this) {
    var data = {
      CompanyID: null,
      FirstName: null,
      LastName: null,
      Email: null,
      UserName: null,
      UserID: null,
      RecruitID: null,
      Ssn: null,
      PhoneCell: null,
      PhoneHome: null,
      SeasonID: null,
      UserEmployeeTypeId: null,
    };
    _this.data.setValue(data);
    _this.data.markClean(data, true);
  }

  function search(_this, cb) {
    var model;
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
    } else if (_this.data.isClean()) {
      // only search if something has changed
      notify.warn('Search criteria hasn\'t changed. No search made.', null, 3);
      cb();
    } else {
      model = _this.data.getValue();
      // clear grid
      _this.gvm.list([]);
      // do search
      dataservice.humanresourcesrv.users.save({
        data: model,
        link: 'search',
      }, null, utils.safeCallback(cb, function(err, resp) {
        // mark search query as the new clean
        _this.data.markClean(model, true);
        // set results in grid
        _this.gvm.list(resp.Value);
        _this.gvm.setSelectedRows([]);
      }, function(err) {
        notify.error(err, 30);
      }));
    }
  }

  return UserSearchViewModel;
});
