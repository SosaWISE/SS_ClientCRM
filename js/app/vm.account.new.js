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

  function NewAccountViewModel(options) {
    var _this = this;
    NewAccountViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
  }
  utils.inherits(NewAccountViewModel, BaseViewModel);
  NewAccountViewModel.prototype.viewTmpl = 'tmpl-account_new';

  return NewAccountViewModel;
});
