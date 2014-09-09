define('src/scheduling/scheduleblock.viewticket.vm', [
  'src/app',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  //'src/core/combo.vm',
  //'src/core/joiner',
  //'ko',
  //'src/ukov',
], function(
  app,
  dataservice,
  notify,
  utils,
  BaseViewModel
  //ComboViewModel,
  //joiner,
  //ko,
  //ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
  };


  function ScheduleBlockTicketsViewModel(options) {
    var _this = this;
    ScheduleBlockTicketsViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Schedule Block View Tickets';

    // _this.data = ukov.wrap(_this.item || {      
    // }, schema);

    //
    // events
    //

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(ScheduleBlockTicketsViewModel, BaseViewModel);
  ScheduleBlockTicketsViewModel.prototype.viewTmpl = 'tmpl-schedule-block-view-ticket';
  ScheduleBlockTicketsViewModel.prototype.width = 400;
  ScheduleBlockTicketsViewModel.prototype.height = 'auto';


  ScheduleBlockTicketsViewModel.prototype.onActivate = function() {

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }

  ScheduleBlockTicketsViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return ScheduleBlockTicketsViewModel;
});
