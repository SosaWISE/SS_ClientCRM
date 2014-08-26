define('src/scheduling/technician.signup.vm', [
  'jquery',
  'fullcalendar',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  $,
  fullCalendar,
  dataservice,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;

  schema = {
    _model: true,
    AvailableStartTime: {},
    AvailableEndTime: {}
  };


  function TechSignUpViewModel(options) {
    var _this = this;
    TechSignUpViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Technician Schedule Block Signup';

    _this.data = ukov.wrap(_this.item || {
      AvailableStartTime: null,
      AvailableEndTime: null
    }, schema);

    //Set values    
    _this.data.AvailableStartTime(_this.stime);
    _this.data.AvailableEndTime(_this.etime);

    //
    // events
    //

    _this.cmdSaveAvailability = ko.command(function(cb) {

      console.log("@TODO save signup schedule block...");

      cb();

    });

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


  }

  utils.inherits(TechSignUpViewModel, BaseViewModel);
  TechSignUpViewModel.prototype.viewTmpl = 'tmpl-technician-signup';
  TechSignUpViewModel.prototype.width = 400;
  TechSignUpViewModel.prototype.height = 'auto';

  TechSignUpViewModel.prototype.onActivate = function( /*routeData*/ ) {};

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TechSignUpViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return TechSignUpViewModel;
});
