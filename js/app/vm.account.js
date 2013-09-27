define([
  'notify',
  'utils',
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
  }
  utils.inherits(AccountViewModel, BaseViewModel);
  AccountViewModel.prototype.viewTmpl = 'tmpl-account';

  return AccountViewModel;
});
