define('src/scrum/backloggrids.vm', [
  'src/scrum/backlog.gvm',
  'src/core/utils',
  'src/core/base.vm',
], function(
  BacklogGridViewModel,
  utils,
  BaseViewModel
) {
  "use strict";

  function BacklogGridsViewModel(options) {
    var _this = this;
    BacklogGridsViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['projectVm']);

    _this.gvm = new BacklogGridViewModel({
      dataView: _this.projectVm.backlog().bd,
    });

    //
    // events
    //
  }
  utils.inherits(BacklogGridsViewModel, BaseViewModel);
  BacklogGridsViewModel.prototype.viewTmpl = 'tmpl-scrum_backloggrids';

  return BacklogGridsViewModel;
});
