define('src/scrum/scrum.panel.vm', [
  'src/core/helpers',
  'src/dataservice',
  'src/scrum/chat.vm',
  'src/scrum/project.vm',
  'ko',
  'src/core/layers.vm',
  'src/core/utils',
  'src/core/controller.vm',
  // don't care about reference
  'src/scrum/scrum.dragdrop',
  'src/scrum/chat.bindings',
], function(
  helpers,
  dataservice,
  ChatViewModel,
  ProjectViewModel,
  ko,
  LayersViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";

  function ScrumPanelViewModel(options) {
    var _this = this;
    ScrumPanelViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, []);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.projects = _this.childs;
    _this.hideNav = ko.observable(false);
    _this.hideNav(true);
    _this.chatVm = ko.observable();

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
  utils.inherits(ScrumPanelViewModel, ControllerViewModel);

  ScrumPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    _this.chatVm(new ChatViewModel());

    load_projects(_this, _this.projects, join.add());
  };

  function load_projects(_this, setter, cb) {
    dataservice.scrum.projects.read({}, null, utils.safeCallback(cb, function(err, resp) {
      var list = resp.Value.map(function(item) {
        return new ProjectViewModel({
          pcontroller: _this,
          id: item.ID,
          title: item.Name,
          item: item,
          layersVm: _this.layersVm,
        });
      });
      setter(list);
    }, utils.noop));
  }

  return ScrumPanelViewModel;
});
