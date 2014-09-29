define('src/hr/users.vm', [
  'src/hr/user.vm',
  'src/hr/usersearch.vm',
  'ko',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  UserViewModel,
  UserSearchViewModel,
  ko,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function UsersViewModel(options) {
    var _this = this;
    UsersViewModel.super_.call(_this, options);

    _this.list = _this.childs;

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm);
    };
    _this.clickNew = function() {
      //@TODO:
    };
  }
  utils.inherits(UsersViewModel, ControllerViewModel);
  UsersViewModel.prototype.viewTmpl = 'tmpl-hr-users';

  UsersViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;
    _this.searchVm = new UserSearchViewModel({
      pcontroller: _this,
      id: 'search',
      title: 'Search',
    });
    _this.defaultChild = _this.searchVm;
  };

  UsersViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result, id;
    if (routeData[_this.searchVm.routePart] === _this.searchVm.id) {
      result = _this.searchVm;
    } else {
      result = UsersViewModel.super_.prototype.findChild.call(_this, routeData);
      if (!result) {
        // get child id
        id = routeData[_this.getChildRoutePart(routeData.route)];
        // add child
        result = new UserViewModel({
          pcontroller: _this,
          id: id,
        });
        _this.list.push(result);
      }
    }
    return result;
  };

  return UsersViewModel;
});
