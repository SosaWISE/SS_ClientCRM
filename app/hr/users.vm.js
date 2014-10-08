define('src/hr/users.vm', [
  'src/dataservice',
  'src/hr/user.vm',
  'src/hr/usersearch.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  UserViewModel,
  UserSearchViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  var newUserID = -1;

  function UsersViewModel(options) {
    var _this = this;
    UsersViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.searchVm = ko.observable();
    _this.list = _this.childs;

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm.peek());
    };
    _this.clickNew = function() {
      var vm = createUserViewModel(_this, newUserID--);
      _this.list.push(vm);
      _this.selectChild(vm);
    };
  }
  utils.inherits(UsersViewModel, ControllerViewModel);
  UsersViewModel.prototype.viewTmpl = 'tmpl-hr-users';

  UsersViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.searchVm(new UserSearchViewModel({
      pcontroller: _this,
      id: 'search',
      title: 'Search',
    }));
    _this.defaultChild = _this.searchVm.peek();

    join.add()();
  };

  UsersViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      searchVm, result, id;
    searchVm = _this.searchVm.peek();
    if (searchVm && routeData[searchVm.routePart] === searchVm.id) {
      result = searchVm;
    } else {
      result = UsersViewModel.super_.prototype.findChild.call(_this, routeData);
      if (!result) {
        // get child id
        id = routeData[_this.getChildRoutePart(routeData.route)];
        if (id > 0) {
          // add child
          result = createUserViewModel(_this, id);
          _this.list.push(result);
        }
      }
    }
    return result;
  };

  function createUserViewModel(_this, id) {
    return new UserViewModel({
      pcontroller: _this,
      id: id,
      layersVm: _this.layersVm,
    });
  }

  return UsersViewModel;
});
