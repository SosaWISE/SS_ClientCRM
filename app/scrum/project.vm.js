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
    _this.sprints3 = ko.observableArray();
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

    // update sprints3 (prev, current, and next sprints)
    _this.sprint.subscribe(function(sprint) {
      var sprints = _this.sprints(),
        sprints3 = _this.sprints3,
        index = sprints.indexOf(sprint),
        index3 = sprints3().indexOf(sprint);
      if (index < 0) { // no selected sprint
        sprints3([]);
      } else if (index3 < 0) { // make new array with 3 elements
        sprints3([sprints[index - 1] || null, sprints[index], sprints[index + 1] || null]);
      } else { // try to center the item
        switch (index3) {
          case 0: // move item to the right by adding an item to the left and removing the last
            sprints3.pop();
            sprints3.unshift(sprints[index - 1] || null);
            break;
          case 2: // move item to the left by adding an item to the right and removing the first
            sprints3.shift();
            sprints3.push(sprints[index + 1] || null);
            break;
          case 1: // already centered. do nothing
            break;
          default:
            throw new Error('invalid index3');
        }
      }
      // ensure all the sprints are loaded
      sprints3().forEach(function(sprint) {
        if (sprint) {
          sprint.load(_this.getRouteData(), {}, function() {});
        }
      });
    });

    //
    // events
    //
    _this.clickView = function(view) {
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
    _this.cmdPrevSprint = createMoveCmd(_this, false);
    _this.cmdNextSprint = createMoveCmd(_this, true);
  }
  utils.inherits(ProjectViewModel, ControllerViewModel);
  ProjectViewModel.prototype.viewTmpl = 'tmpl-scrum_project';

  ProjectViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      cb = join.add();

    _this.clickView(_this.views[0]);


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

  function createMoveCmd(_this, isNext) {
    return ko.command(function(cb) {
      var sprint = getSprint(_this, isNext);
      // ensure sprint is loaded
      sprint.load(_this.getRouteData(), {}, function() {});
      // set sprint
      _this.sprint(sprint);
      cb();
    }, function(busy) {
      return !busy && !(!getSprint(_this, isNext));
    });
  }

  function getSprint(_this, isNext) {
    var sprints = _this.sprints(),
      sprint = _this.sprint(),
      index = sprints.indexOf(sprint) + (isNext ? 1 : -1);
    return sprints[index];
  }

  return ProjectViewModel;
});
