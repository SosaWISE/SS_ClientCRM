define('src/hr/hr.panel.vm', [
  'src/hr/user.vm',
  'src/hr/search.vm',
  'ko',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  UserViewModel,
  SearchViewModel,
  ko,
  LayersViewModel,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function HrPanelViewModel(options) {
    var _this = this;
    HrPanelViewModel.super_.call(_this, options);

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
  }
  utils.inherits(HrPanelViewModel, ControllerViewModel);

  HrPanelViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) { // overrides base
    var _this = this;

    _this.searchVm = new SearchViewModel({
      routeName: 'hr',
      pcontroller: _this,
      id: 'search',
      title: 'Search',
    });
    _this.defaultChild = _this.searchVm;
  };

  HrPanelViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result;
    if (routeData[_this.searchVm.routePart] === _this.searchVm.id) {
      result = _this.searchVm;
    } else {
      result = HrPanelViewModel.super_.prototype.findChild.call(_this, routeData);
      if (!result) {
        // try to open
        switch (routeData.route) {
          case 'users':
            if (routeData.uid) {
              result = new UserViewModel({
                routeName: routeData.route,
                pcontroller: _this,
                id: routeData.uid,
              });
            }
            break;
        }
        if (result) {
          _this.list.push(result);
        }
      }
    }
    return result;
  };

  return HrPanelViewModel;
});
