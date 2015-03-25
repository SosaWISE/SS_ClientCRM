define('src/funding/packets.vm', [
  'src/dataservice',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  ko,
  utils,
  ControllerViewModel) {
  'use strict';

  //  var newPacketID = -1;

  function PacketsViewModel(options) {
    // ** Initialize
    var _this = this;
    PacketsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm'
    ]);

    _this.searchVm = ko.observable();
    _this.list = _this.childs;

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm.peek());
    };
    _this.clickNew = function() {

    };
  }

  // ** Inherits
  utils.inherits(PacketsViewModel, ControllerViewModel);
  PacketsViewModel.prototype.viewTmpl = 'tmpl-funding-packets';

  // ** Return VM
  return PacketsViewModel;
});
