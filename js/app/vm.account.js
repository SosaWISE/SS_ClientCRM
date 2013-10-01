define([
  'notify',
  'util/utils',
  'vm.base',
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
    _this.hideRep = ko.observable(true);

    //
    // events
    //
    _this.clickToggleNotes = function() {
      _this.hideNotes(!_this.hideNotes());
    };
    _this.clickToggleRep = function() {
      _this.hideRep(!_this.hideRep());
    };
  }
  utils.inherits(AccountViewModel, BaseViewModel);
  AccountViewModel.prototype.viewTmpl = 'tmpl-account';

  return AccountViewModel;
});
