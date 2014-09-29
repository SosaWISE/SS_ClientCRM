define('src/hr/user.vm', [
  'ko',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
], function(
  ko,
  dataservice,
  notify,
  utils,
  BaseViewModel,
  ControllerViewModel
) {
  "use strict";

  // ctor
  function UserViewModel(options) {
    var _this = this;
    UserViewModel.super_.call(_this, options);

    _this.mayReload = ko.observable(false);
    _this.title = ko.observable('Loading... (' + _this.id + ')');
    _this.focusFirst = ko.observable(false);
    _this.showNav = ko.observable(true); //config.hr.showNav);
    _this.user = ko.observable();
    _this.recruits = _this.childs;

    _this.showRight = ko.observable(false);
    _this.showBottom = ko.observable(false);

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickToggleNav = function() {
      _this.showNav(!_this.showNav());
    };
    _this.clickNewRecruit = function() {};

    //
    _this.active.subscribe(function(active) {
      if (active) {
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(UserViewModel, ControllerViewModel);
  UserViewModel.prototype.viewTmpl = 'tmpl-hr-user';

  UserViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      userid = routeData.uid; //.substr(1);

    load_user(userid, function(val) {
      _this.user(new BaseViewModel({
        data: val,
        viewTmpl: 'tmpl-hr-userinfo',
      }));
    }, join.add());
  };

  UserViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result;
    result = UserViewModel.super_.prototype.findChild.call(_this, routeData);
    if (!result) {
      result = _this.user.peek();
    }
    return result;
  };

  function load_user(userid, setter, cb) {
    dataservice.humanresourcesrv.users.read({
      id: userid,
    }, setter, cb);
  }

  return UserViewModel;
});
