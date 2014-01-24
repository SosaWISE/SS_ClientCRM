define('src/account/account.info.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  function AccountInfoViewModel(options) {
    var _this = this;
    AccountInfoViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
    _this.hideNotes = ko.observable(false);
    _this.showReps = ko.observable(false);
    _this.showEditor = ko.observable(false);

    //
    // events
    //
    _this.clickToggleNotes = function() {
      _this.hideNotes(!_this.hideNotes());
    };
    _this.clickToggleReps = function() {
      _this.showReps(!_this.showReps());
    };
    _this.clickToggleEditor = function() {
      _this.showEditor(!_this.showEditor());
    };
  }
  utils.inherits(AccountInfoViewModel, ControllerViewModel);
  AccountInfoViewModel.prototype.viewTmpl = 'tmpl-account_info';

  AccountInfoViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      cb();
      //@TODO: load real account
    }, 0);
  };

  return AccountInfoViewModel;
});
