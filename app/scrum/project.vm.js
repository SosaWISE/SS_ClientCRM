define('src/scrum/project.vm', [
  'src/scrum/stream.gvm',

  'src/scrum/taskboard.vm',
  'src/scrum/backloggrids.vm',
  'src/scrum/backlog.vm',
  'src/scrum/sprint.vm',
  'src/dataservice',
  'ko',
  'src/core/layers.vm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  StreamGridViewModel,

  TaskBoardViewModel,
  BacklogGridsViewModel,
  BacklogViewModel,
  SprintViewModel,
  dataservice,
  ko,
  LayersViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";

  function ProjectViewModel(options) {
    var _this = this;
    ProjectViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['id']);

    _this.gvm = new StreamGridViewModel({

    });

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
  }
  utils.inherits(ProjectViewModel, ControllerViewModel);
  ProjectViewModel.prototype.viewTmpl = 'tmpl-scrum_project';

  ProjectViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      epics, storys;

    load_epics(_this, function(val) {
      epics = val;
    }, join.add());
    load_storys(_this, function(val) {
      storys = val;
    }, join.add());
  };


  function load_epics(_this, setter, cb) {
    dataservice.scrum.projects.read({
      id: _this.id,
      link: 'epics'
    }, setter, cb);
  }

  function load_storys(_this, setter, cb) { // with sub data (tasks, images, etc.)
    dataservice.scrum.projects.read({
      id: _this.id,
      link: 'storys/full',
    }, setter, cb);
  }

  return ProjectViewModel;
});
