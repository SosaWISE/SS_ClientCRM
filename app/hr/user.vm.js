define('src/hr/user.vm', [
  'src/hr/usereditor.vm',
  'ko',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
], function(
  UserEditorViewModel,
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
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.mayReload = ko.observable(false);
    _this.focusFirst = ko.observable(false);
    _this.recruits = _this.childs;

    _this.showNav = ko.observable(_this.id > 0); // && config.hr.showNav);
    _this.showRight = ko.observable(false);
    _this.showBottom = ko.observable(false);

    _this.defaultChild = new UserEditorViewModel({
      // pcontroller: _this,
      cache: options.cache,
      layersVm: _this.layersVm,
    });
    _this.title = ko.computed(function() {
      if (_this.id > 0) {
        var data = _this.defaultChild.data;
        if (_this.loaded()) {
          return data.FullName() + ' (' + data.GPEmployeeID() + ', U' + _this.id + ')';
        } else {
          return 'Loading... (U' + _this.id + ')';
        }
      } else {
        return 'New Recruit' + _this.id;
      }
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickNewRecruit = function() {
      //@TODO:
    };

    //
    _this.active.subscribe(function(active) {
      if (active) {
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

    // test for new recruit
    if (_this.id > 0) {} else {
      // new recruit
      _this.defaultChild.clickEdit();
    }
  }
  utils.inherits(UserViewModel, ControllerViewModel);
  UserViewModel.prototype.viewTmpl = 'tmpl-hr-user';

  UserViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      userid = _this.routePartId(routeData);

    if (userid > 0) {
      load_user(userid, function(val) {
        _this.defaultChild.data.setValue(val);
        _this.defaultChild.data.markClean(val);
      }, join.add());
    }
  };

  UserViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    msg = _this.defaultChild.closeMsg();
    return msg;
  };

  // UserViewModel.prototype.findChild = function(routeData) {
  //   var _this = this,
  //     result;
  //   result = UserViewModel.super_.prototype.findChild.call(_this, routeData);
  //   if (!result) {
  //     if (_this.id > 0) {
  //       result = _this.user;
  //     } else if (_this.editing) {
  //       result = _this.user;
  //     } else {
  //       result = _this.user;
  //     }
  //   }
  //   return result;
  // };

  // function startEdit(_this) {
  //   if (_this.editing) {
  //     return;
  //   }
  //   _this.editing = true;
  //   if (!_this.editVm) {
  //     _this.editVm = new UserEditorViewModel({
  //       // _this.user
  //     });
  //   }
  //   _this.userData(_this.editVm);
  //   _this.activeChild(_this.editVm);
  // }

  // function endEdit(_this) {
  //   if (_this.editing) {
  //     return;
  //   }
  //   _this.editing = true;
  //   if (!_this.editVm) {
  //     _this.editVm = new UserEditorViewModel({
  //
  //     });
  //   }
  //   _this.activeChild(_this.editVm);
  // }

  function load_user(userid, setter, cb) {
    dataservice.humanresourcesrv.users.read({
      id: userid,
    }, setter, cb);
  }

  return UserViewModel;
});
