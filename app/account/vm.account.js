define('src/account/vm.account', [
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";

  function AccountViewModel(options) {
    var _this = this;
    AccountViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
    _this.hideNotes = ko.observable(false);
    _this.hideNav = ko.observable(false);

    //
    // events
    //
    _this.clickToggleNotes = function() {
      _this.hideNotes(!_this.hideNotes());
    };
    _this.clickToggleNav = function() {
      _this.hideNav(!_this.hideNav());
    };
  }
  utils.inherits(AccountViewModel, ControllerViewModel);
  AccountViewModel.prototype.viewTmpl = 'tmpl-account';

  AccountViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var cb = join.add();
    setTimeout(function() {
      cb();
      //@TODO: load real account
    }, 0);
  };

  return AccountViewModel;
});
