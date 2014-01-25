define('src/scrum/planning.vm', [
  'src/core/utils',
  'src/core/controller.vm',
], function(
  utils,
  ControllerViewModel
) {
  "use strict";

  function PlanningViewModel(options) {
    var _this = this;
    PlanningViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['repo']);

    //
    // events
    //
  }
  utils.inherits(PlanningViewModel, ControllerViewModel);
  PlanningViewModel.prototype.viewTmpl = 'tmpl-scrum_planning';


  return PlanningViewModel;
});
