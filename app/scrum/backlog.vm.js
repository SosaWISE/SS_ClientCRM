define('src/scrum/backlog.vm', [
  'src/scrum/backlog.gvm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  BacklogGridViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";

  function BacklogViewModel(options) {
    var _this = this;
    BacklogViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['repo']);

    _this.gvm = new BacklogGridViewModel();

    //
    // events
    //
  }
  utils.inherits(BacklogViewModel, ControllerViewModel);
  BacklogViewModel.prototype.viewTmpl = 'tmpl-scrum_backlog';


  return BacklogViewModel;
});
