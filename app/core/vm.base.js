define('src/core/vm.base', [
  'src/core/mixin.load',
  'ko'
], function(
  mixin_load,
  ko
) {
  "use strict";

  function BaseViewModel(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }

    // sub-classes should call this manually
    // if they want the load functionality
    // _this.initMixinLoad();

    _this.active = ko.observable(false);
  }

  //
  // mixins:
  //
  // load function
  mixin_load(BaseViewModel.prototype);


  BaseViewModel.prototype.name = null;
  BaseViewModel.prototype.viewTmpl = null;
  BaseViewModel.prototype.booleanOptions = [true, false];

  //
  // public members
  //
  BaseViewModel.prototype.ensureProps = function(propNames) {
    var _this = this;
    BaseViewModel.ensureProps(_this, propNames);
  };
  BaseViewModel.prototype.getTemplate = function(vm) {
    return vm.viewTmpl;
  };



  //
  // static functions
  //
  BaseViewModel.ensureProps = function(obj, propNames) {
    propNames.forEach(function(name) {
      if (obj[name] == null) {
        throw new Error('missing ' + name);
      }
    });
  };


  return BaseViewModel;
});
