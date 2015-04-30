define('src/hr/team.vm', [
  'src/hr/hr-cache',
  'src/hr/teameditor.vm',
  'ko',
  'src/dataservice',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/controller.vm',
], function(
  hrcache,
  TeamEditorViewModel,
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
  function TeamViewModel(options) {
    var _this = this;
    TeamViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.mayReload = ko.observable(false);
    _this.initFocusFirst();
    _this.recruits = _this.childs;

    _this.showNav = ko.observable(false);
    _this.showRight = ko.observable(false);
    _this.showBottom = ko.observable(false);

    _this.defaultChild = _this.editorVm = new TeamEditorViewModel({
      seasonid: _this.seasonid,
      teamid: _this.id,
      pcontroller: _this,
      id: 'info',
      layersVm: _this.layersVm,
    });


    _this.title = ko.computed(function() {
      var data = _this.editorVm.data;
      return strings.format('{0} (T{1})', data.Description(), data.TeamID());
    });

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };

    // test for new recruit
    if (_this.id > 0) {} else {
      // new recruit
      _this.editorVm.clickEdit();
    }
  }
  utils.inherits(TeamViewModel, ControllerViewModel);
  TeamViewModel.prototype.viewTmpl = 'tmpl-hr-team';

  TeamViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      teamid = _this.routePartId(routeData);

    hrcache.ensure('seasons', join.add());

    if (teamid > 0) {
      load_team(teamid, function(val) {
        _this.editorVm.setItem(val);
      }, join.add('u'));
    }
  };
  TeamViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result;
    if (_this.editorVm.routePartId(routeData) === _this.editorVm.id) {
      result = _this.editorVm;
    } else {
      result = TeamViewModel.super_.prototype.findChild.call(_this, routeData);
    }
    return result;
  };

  TeamViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    msg = _this.editorVm.closeMsg() || closeMsg_firstRecruit(_this);
    return msg;
  };

  function closeMsg_firstRecruit(_this) {
    var msg;
    _this.childs.peek().some(function(vm) {
      msg = vm.closeMsg();
      return !!msg;
    });
    return msg;
  }

  function load_team(teamid, setter, cb) {
    dataservice.hr.teams.read({
      id: teamid,
    }, setter, cb);
  }

  return TeamViewModel;
});
