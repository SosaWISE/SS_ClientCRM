define('src/scrum/backlog.vm', [
  'src/core/utils',
  'src/core/base.vm',
], function(
  utils,
  BaseViewModel
) {
  "use strict";

  function BacklogViewModel(options) {
    var _this = this;
    BacklogViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['projectVm']);

    //
    // events
    //
  }
  utils.inherits(BacklogViewModel, BaseViewModel);
  BacklogViewModel.prototype.viewTmpl = 'tmpl-scrum_backlog';

  return BacklogViewModel;
});
