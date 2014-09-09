define('src/scrum/project.vm', [
  'src/scrum/open.vm',
  'src/dataservice',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  OpenViewModel,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function ProjectViewModel(options) {
    var _this = this;
    ProjectViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['id']);

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
      sprint, storys, sprintStorys;

    load_currentSprint(_this, function(val) {
      sprint = val || {};
    }, j2.add());
    load_storys(_this, function(val) {
      storys = val || [];
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
          new OpenViewModel({
            pcontroller: _this,
            title: 'Open',
            sprint: sprint,
            storys: sprintStorys.concat(storys),
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

  return ProjectViewModel;
});
