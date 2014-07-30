define('src/scrum/scrum.panel.vm', [
  'src/core/helpers',
  'src/dataservice',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  helpers,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";
  //@TODO: move to panels folder



  // lazy load account dependencies
  var deps = {},
    ensureDeps = helpers.onetimer(function loadDeps(cb) {
      require([
        'src/scrum/chat.vm',
        'src/scrum/project.vm',
        // don't care about reference
        'src/scrum/scrum.dragdrop',
        'src/scrum/chat.bindings',
      ], function() {
        var args = arguments;
        deps.ChatViewModel = args[0];
        deps.ProjectViewModel = args[1];
        cb();
      });
    });

  function ScrumPanelViewModel(options) {
    var _this = this;
    ScrumPanelViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, []);

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
  ScrumPanelViewModel.prototype.viewTmpl = 'tmpl-panel_scrum';

  ScrumPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    ensureDeps(function() {
      _this.chatVm(new deps.ChatViewModel());

      //load_projects(_this, join);

      cb();
    });
  };

  // function load_projects(_this, join) {
  //   var cb = join.add();
  //   dataservice.scrum.projects.read({}, null, utils.safeCallback(cb, function(err, resp) {
  //     var list = resp.Value.map(function(item) {
  //       return new deps.ProjectViewModel({
  //         pcontroller: _this,
  //         id: item.ID,
  //         title: item.Name,
  //         item: item,
  //       });
  //     });
  //     _this.projects(list);
  //   }, utils.noop));
  // }

  return ScrumPanelViewModel;
});
