define('src/core/vm.base', [
  'ko'
], function(
  ko
) {
  "use strict";

  function BaseViewModel(options) {
    var _this = this;
    if (options) {
      delete options.active;
      ko.utils.extend(_this, options);
    }

    _this.active = ko.observable(false);
    // _this.saving = ko.observable(false);
  }
  BaseViewModel.prototype.name = null;
  BaseViewModel.prototype.viewTmpl = null;
  BaseViewModel.prototype.booleanOptions = [true, false];

  BaseViewModel.prototype.ensureProps = function(propNames) {
    var _this = this;
    propNames.forEach(function(name) {
      if (!_this[name]) {
        throw new Error('missing ' + name);
      }
    });
  };

  //
  // public members
  //
  BaseViewModel.prototype.getTemplate = function(vm) {
    return vm.viewTmpl;
  };

  // BaseViewModel.prototype.activate = function(routeData) {
  //   this.onActivate(routeData);
  //   this.active(true);
  // };
  // BaseViewModel.prototype.onActivate = function( /*routeData*/ ) {
  //   // override me
  // };
  // BaseViewModel.prototype.deactivate = function() {
  //   // if (this.active()) {
  //   this.onDeactivate();
  //   this.active(false);
  //   // }
  // };
  // BaseViewModel.prototype.onDeactivate = function() {
  //   // override me
  // };

  return BaseViewModel;
});
