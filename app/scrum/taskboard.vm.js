define('src/scrum/taskboard.vm', [
  'src/scrum/backlogdata',
  'src/dataservice',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  BacklogData,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function TaskBoardViewModel(options) {
    var _this = this;
    TaskBoardViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['repo']);

    _this.sprint = ko.observable();
    _this.sprint(new BacklogData());

    //
    // events
    //
  }
  utils.inherits(TaskBoardViewModel, ControllerViewModel);
  TaskBoardViewModel.prototype.viewTmpl = 'tmpl-scrum_taskboard';

  TaskBoardViewModel.prototype.onLoad = function(routeData, join) {
    var _this = this,
      storys;

    load_storys(function(val) {
      storys = val;
    }, join);

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.sprint().init([], storys);
    });
  };

  function load_storys(setter, join) {
    var cb = join.add();
    dataservice.scrum.storys.read({
      // id: '1',
      id: 'null',
      link: 'bysprint'
    }, setter, function(err, resp) {
      cb(err, resp);
    });
  }


  return TaskBoardViewModel;
});
