define('src/account/vm.notes', [
  'src/core/mixin.load',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.base',
], function(
  mixin_load,
  dataservice,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function NotesViewModel(options) {
    var _this = this;
    NotesViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, []);

    _this.initMixinLoad();

    //
    // events
    //
  }
  utils.inherits(NotesViewModel, BaseViewModel);
  NotesViewModel.prototype.viewTmpl = 'tmpl-notes';

  NotesViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    // var _this = this;
    join.add()();
  };


  return NotesViewModel;
});
