define('src/scheduling/schedule.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  //'src/core/layers.vm',
  //'src/core/joiner',
  //'ko',
  //'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  notify,
  utils,
  ControllerViewModel
  //LayersViewModel,
  //joiner,
  //ko,
  //ukov
) {
  "use strict";

  // var schema;

  // schema = {
  //   _model: true,
  //   TicketStatus: {},
  // };


  function ScheduleViewModel(options) {
    var _this = this;

    ScheduleViewModel.super_.call(_this, options);

    // _this.data = ukov.wrap(_this.item || {
    //   TicketStatus: null,
    // }, schema);


    //events
    //

  }

  utils.inherits(ScheduleViewModel, ControllerViewModel);
  ScheduleViewModel.prototype.viewTmpl = 'tmpl-schedule';

  //
  // members
  //

  ScheduleViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    //var _this = this;
    join = join;
  };



  return ScheduleViewModel;
});
