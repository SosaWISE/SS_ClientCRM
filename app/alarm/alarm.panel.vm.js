define('src/alarm/alarm.panel.vm', [
  'src/alarm/system.vm',
  'src/alarm/client.vm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
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

    _this.systemVm = new SystemViewModel();
    _this.clientVm = new ClientViewModel();

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
    // var _this = this;
    //load_projects(_this, join);

    join.add()();
  };

  return AlarmPanelViewModel;
});
