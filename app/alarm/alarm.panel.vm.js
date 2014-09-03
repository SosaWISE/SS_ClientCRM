define('src/alarm/alarm.panel.vm', [
  'ko',
  'src/alarm/system.vm',
  'src/alarm/client.vm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  SystemViewModel,
  ClientViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";

  function AlarmPanelViewModel(options) {
    var _this = this;
    AlarmPanelViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, []);

    _this.projects = _this.childs;

    _this.systemVm = ko.observable();
    _this.clientVm = ko.observable();
    _this.mayReload = ko.observable(false);

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickToggleNav = function() {
      _this.hideNav(!_this.hideNav());
    };
    _this.clickToggleChat = function() {
      _this.hideChat(!_this.hideChat());
    };
  }
  utils.inherits(AlarmPanelViewModel, ControllerViewModel);

  AlarmPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      vm;
    //load_projects(_this, join);

    // incase of reload
    vm = _this.systemVm();
    if (vm) {
      vm.dispose();
    }
    vm = _this.clientVm();
    if (vm) {
      vm.dispose();
    }

    // set new
    _this.systemVm(new SystemViewModel());
    _this.clientVm(new ClientViewModel());

    join.add()();
  };

  return AlarmPanelViewModel;
});
