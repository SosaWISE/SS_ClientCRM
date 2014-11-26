define('src/scrum/project.vm', [
  'src/scrum/open2.vm',
  'src/dataservice',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  Open2ViewModel,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function ProjectViewModel(options) {
    var _this = this;
    ProjectViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
      'id',
    ]);

    //
    // events
    //
  }
  utils.inherits(ProjectViewModel, ControllerViewModel);
  ProjectViewModel.prototype.viewTmpl = 'tmpl-scrum_project';

  ProjectViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      cb = join.add(),
      j2 = join.create(),
      sprint, storys, sprintStorys, tasks;

    load_currentSprint(_this, function(val) {
      sprint = val || {};
    }, j2.add());
    load_storys(_this, function(val) {
      storys = val || [];
    }, j2.add());
    load_tasks(_this, function(val) {
      tasks = val || [];
    }, j2.add());

    j2.when(function(err) {
      if (err) {
        return;
      }

      load_sprintStorys(sprint, function(val) {
        sprintStorys = val || [];

        //
        //
        //
        _this.childs([
          new Open2ViewModel({
            pcontroller: _this,
            title: 'Open',
            layersVm: _this.layersVm,
            sprint: sprint,
            storys: sprintStorys.concat(storys),
            tasks: tasks,
          }),
        ]);

        cb();
      }, join.add());
    });
  };


  function load_currentSprint(_this, setter, cb) {
    dataservice.scrum.projects.read({
      id: _this.id,
      link: 'currentSprint'
    }, setter, cb);
  }

  function load_storys(_this, setter, cb) { // with sub data (tasks, images, etc.)
    dataservice.scrum.projects.read({
      id: _this.id,
      link: 'storys', // /full',
    }, setter, cb);
  }

  function load_sprintStorys(sprint, setter, cb) { // with sub data (tasks, images, etc.)
    dataservice.scrum.sprints.read({
      id: sprint.id,
      link: 'storys', // /full',
    }, setter, cb);
  }

  function load_tasks(_this, setter, cb) { // with sub data (tasks, images, etc.)
    dataservice.scrum.tasks.read({}, setter, cb);
  }

  return ProjectViewModel;
});
