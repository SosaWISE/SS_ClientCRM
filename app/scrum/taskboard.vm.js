define('src/scrum/taskboard.vm', [
  'src/core/utils',
  'src/core/base.vm',
], function(
  utils,
  BaseViewModel
) {
  "use strict";

  function TaskBoardViewModel(options) {
    var _this = this;
    TaskBoardViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['projectVm']);

    //
    // events
    //
  }
  utils.inherits(TaskBoardViewModel, BaseViewModel);
  TaskBoardViewModel.prototype.viewTmpl = 'tmpl-scrum_taskboard';

  return TaskBoardViewModel;
});
