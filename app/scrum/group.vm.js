define("src/scrum/group.vm", [
  "src/scrum/open2.vm",
  "src/dataservice",
  "ko",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  Open2ViewModel,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function GroupViewModel(options) {
    var _this = this;
    GroupViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "layersVm",
      "id",
    ]);

    //
    // events
    //
  }
  utils.inherits(GroupViewModel, ControllerViewModel);
  GroupViewModel.prototype.viewTmpl = "tmpl-scrum_group";

  GroupViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      cb = join.add(),
      j2 = join.create(),
      projects, sprint, storys, sprintStorys, tasks;

    load_scrumGroupLink(_this, "projects", function(val) {
      projects = val;
    }, j2.add());
    load_scrumGroupLink(_this, "currentSprint", function(val) {
      sprint = val;
    }, j2.add());
    load_scrumGroupLink(_this, "storys", function(val) {
      storys = val;
    }, j2.add());
    load_scrumGroupLink(_this, "tasks", function(val) {
      tasks = val;
    }, j2.add());

    j2.when(function(err) {
      if (err) {
        return;
      }

      load_sprintStorys(sprint || {}, function(val) {
        sprintStorys = val; // || [];

        var projectsMap = {};
        projects.forEach(function(item) {
          projectsMap[item.ID] = item;
        });
        //
        //
        //
        _this.childs([
          new Open2ViewModel({
            pcontroller: _this,
            title: "Open",
            layersVm: _this.layersVm,
            projectsMap: projectsMap,
            sprint: sprint,
            storys: sprintStorys.concat(storys),
            tasks: tasks,
          }),
        ]);
      }, cb);
    });
  };

  function load_scrumGroupLink(_this, link, setter, cb) {
    dataservice.scrum.scrumGroups.read({
      id: _this.id,
      link: link,
    }, setter, cb);
  }

  // function load_projects(_this, setter, cb) {
  //   dataservice.scrum.scrumGroups.read({
  //     id: _this.id,
  //     link: "projects",
  //   }, setter, cb);
  // }
  //
  // function load_currentSprint(_this, setter, cb) {
  //   dataservice.scrum.scrumGroups.read({
  //     id: _this.id,
  //     link: "currentSprint"
  //   }, setter, cb);
  // }
  //
  // function load_storys(_this, setter, cb) { // with sub data (tasks, images, etc.)
  //   dataservice.scrum.scrumGroups.read({
  //     id: _this.id,
  //     link: "storys", // /full",
  //   }, setter, cb);
  // }
  //
  // function load_tasks(_this, setter, cb) { // with sub data (tasks, images, etc.)
  //   // dataservice.scrum.tasks.read({}, setter, cb);
  //   dataservice.scrum.scrumGroups.read({
  //     id: _this.id,
  //     link: "tasks", // /full",
  //   }, setter, cb);
  // }


  function load_sprintStorys(sprint, setter, cb) { // with sub data (tasks, images, etc.)
    dataservice.scrum.sprints.read({
      id: sprint.id,
      link: "storys", // /full",
    }, setter, cb);
  }
  return GroupViewModel;
});
