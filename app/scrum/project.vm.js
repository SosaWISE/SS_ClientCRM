define('src/scrum/project.vm', [
  'src/scrum/taskboard.vm',
  'src/scrum/backlog.vm',
  'src/scrum/sprint.vm',
  'src/dataservice',
  'ko',
  'src/core/layers.vm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  TaskBoardViewModel,
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

    _this.sprints = _this.childs;
    _this.sprint = _this.activeChild;
    _this.backlog = ko.observable();
    _this.epics = ko.observableArray();

    _this.views = [
      new BacklogViewModel({
        projectVm: _this,
        id: 'backlog',
        title: 'Backlog',
      }),
      // new BacklogViewModel({
      //   projectVm: _this,
      //   id: 'planning',
      //   title: 'Planning',
      //   viewTmpl: 'tmpl-scrum_planning',
      // }),
      new TaskBoardViewModel({
        projectVm: _this,
        id: 'taskboard',
        title: 'Task Board',
      }),
    ];
    _this.view = ko.observable(_this.views[0]);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    //
    // events
    //
    _this.clickItem = function(view) {
      var prevView = _this.view();
      if (prevView) {
        prevView.deactivate();
      }
      _this.view(view);
      view.activate({
        routeData: {},
        extraData: {},
        active: function() {
          return true;
        },
        done: function() {},
      });
    };
  }
  utils.inherits(ProjectViewModel, ControllerViewModel);
  ProjectViewModel.prototype.viewTmpl = 'tmpl-scrum_project';

  ProjectViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      cb = join.add();

    _this.clickItem(_this.views[0]);


    load_sprints(_this, join);
    load_epics(_this, function() {
      // create backlog with epics
      var backlog = createSprint(_this, {
        ID: null,
        ProjectId: _this.id,
      }, _this.epics());
      backlog.load(routeData, extraData, join);
      // set backlog
      _this.backlog(backlog);

      cb();
    });
  };

  function load_sprints(_this, join) {
    var cb = join.add();
    dataservice.scrum.projects.read({
      id: _this.id,
      link: 'sprints',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        var list = resp.Value.map(function(item) {
          return createSprint(_this, item, null);
        });
        _this.sprints(list);
      }, cb);
    });
  }

  function load_epics(_this, cb) {
    dataservice.scrum.projects.read({
      id: _this.id,
      link: 'epics'
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        _this.epics(resp.Value);
      }, cb);
    });
  }

  function createSprint(_this, item, epics) {
    return new SprintViewModel({
      pcontroller: _this,
      id: item.ID,
      item: item,
      layersVm: _this.layersVm,
      epics: epics, // only set for backlog
    });
  }

  return ProjectViewModel;
});
