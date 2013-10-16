define('src/vm.account', [
  'src/notify',
  'src/util/utils',
  'src/vm.base',
  'ko'
], function(
  notify,
  utils,
  BaseViewModel,
  ko
) {
  "use strict";

  function AccountViewModel(options) {
    var _this = this;
    AccountViewModel.super_.call(_this, options);

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
  utils.inherits(AccountViewModel, BaseViewModel);
  AccountViewModel.prototype.viewTmpl = 'tmpl-account';

  return AccountViewModel;
});
