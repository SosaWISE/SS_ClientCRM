define('src/hr/user.vm', [
  'src/hr/hr-cache',
  'src/hr/recruiteditor.vm',
  'src/hr/recruitseason.vm',
  'src/hr/usereditor.vm',
  'ko',
  'src/dataservice',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
], function(
  hrcache,
  RecruitEditorViewModel,
  RecruitSeasonViewModel,
  UserEditorViewModel,
  ko,
  dataservice,
  strings,
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

    _this.defaultChild = _this.editorVm = new UserEditorViewModel({
      pcontroller: _this,
      id: 'info',
      layersVm: _this.layersVm,
    });


    _this.title = ko.computed(function() {
      var data = _this.editorVm.data;
      return strings.format('{0} ({1}, U{2})', data.FullName(), data.GPEmployeeID(), data.UserID() || _this.id);
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickNewRecruit = function() {
      var vm = new RecruitSeasonViewModel({
        userid: _this.editorVm.data.UserID.peek(),
        seasons: hrcache.getList('seasons').peek(),
        recruitVms: _this.childs.peek(),
      });
      _this.layersVm.show(vm, function(recruit) {
        if (!recruit) {
          return;
        }
        var vm = createRecruitEditorViewModel(_this, recruit);
        _this.childs.push(vm);
        _this.goTo(vm.getRouteData());
      });
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
      _this.editorVm.clickEdit();
    }
  }
  utils.inherits(UserViewModel, ControllerViewModel);
  UserViewModel.prototype.viewTmpl = 'tmpl-hr-user';

  UserViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      userid = _this.routePartId(routeData);

    hrcache.ensure('seasons', join.add());

    if (userid > 0) {
      load_user(userid, function(val) {
        _this.editorVm.setItem(val);
      }, join.add('u'));

      load_recruits(userid, function(recruits) {
        // map recruits to view models
        var vms = recruits.map(function(r) {
          return createRecruitEditorViewModel(_this, r);
        });
        _this.childs(vms);
      }, join.add('r'));
    } else {

    }
  };
  UserViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result;
    if (_this.editorVm.routePartId(routeData) === _this.editorVm.id) {
      result = _this.editorVm;
    } else {
      result = UserViewModel.super_.prototype.findChild.call(_this, routeData);
    }
    return result;
  };

  function createRecruitEditorViewModel(_this, r) {
    var vm = new RecruitEditorViewModel({
      pcontroller: _this,
      id: r.RecruitID,
      layersVm: _this.layersVm,
      seasons: hrcache.getList('seasons').peek(),
    });
    vm.setItem(r);
    return vm;
  }

  UserViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    msg = _this.editorVm.closeMsg();
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

  function load_recruits(userid, setter, cb) {
    dataservice.humanresourcesrv.users.read({
      id: userid,
      link: 'recruits',
    }, setter, cb);
  }

  return UserViewModel;
});
