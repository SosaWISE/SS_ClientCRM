define([
  'notify',
  'util/utils',
  'vm.base',
  'vm.layers',
  'vm.rep.find',
  'ko'
], function(
  notify,
  utils,
  BaseViewModel,
  LayersViewModel,
  FindRepViewModel,
  ko
) {
  "use strict";

  function NewAccountViewModel(options) {
    var _this = this;
    NewAccountViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);

    _this.layersVM = new LayersViewModel();

    _this.layersVM.show(new FindRepViewModel());
  }
  utils.inherits(NewAccountViewModel, BaseViewModel);
  NewAccountViewModel.prototype.viewTmpl = 'tmpl-account_new';

  return NewAccountViewModel;
});
