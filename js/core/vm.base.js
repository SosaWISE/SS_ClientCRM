define('src/core/vm.base', [
  'ko'
], function(
  ko
) {
  "use strict";

  function BaseViewModel(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }

    _this.active = ko.observable(false);
  }
  BaseViewModel.prototype.name = null;
  BaseViewModel.prototype.viewTmpl = null;
  BaseViewModel.prototype.booleanOptions = [true, false];

  //
  // public members
  //
  BaseViewModel.prototype.ensureProps = function(propNames) {
    var _this = this;
    propNames.forEach(function(name) {
      if (_this[name] == null) {
        throw new Error('missing ' + name);
      }
    });
  };
  BaseViewModel.prototype.getTemplate = function(vm) {
    return vm.viewTmpl;
  };

  return BaseViewModel;
});
