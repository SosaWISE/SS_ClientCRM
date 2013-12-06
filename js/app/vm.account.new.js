define('src/vm.account.new', [
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
  'src/core/vm.layers',
  'src/vm.rep.find',
  'src/vm.address.validate',
  'ko'
], function(
  notify,
  utils,
  ControllerViewModel,
  LayersViewModel,
  FindRepViewModel,
  ValidateAddressViewModel,
  ko
) {
  "use strict";

  function NewAccountViewModel(options) {
    var _this = this;
    NewAccountViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);
    _this.hideNotes = ko.observable(false);
    _this.hideRep = ko.observable(false);
    _this.hideEditor = ko.observable(false);

    _this.findRepVM = new FindRepViewModel();
    _this.findRepVM.clickNext = function() {
      _this.layer.vm(_this.validateAddressVM);
    };
    _this.validateAddressVM = new ValidateAddressViewModel();
    _this.validateAddressVM.clickNext = function() {
      _this.layer.vm(_this.findRepVM);
      // alert('done');
    };

    _this.layersVM = new LayersViewModel();
  }
  utils.inherits(NewAccountViewModel, ControllerViewModel);
  NewAccountViewModel.prototype.viewTmpl = 'tmpl-account_new';

  NewAccountViewModel.prototype.onLoad = function( /*routeData, join*/ ) { // override me
    var _this = this;
    _this.layer = _this.layersVM.show(_this.findRepVM);
  };
  NewAccountViewModel.prototype.onActivate = function() { // overrides base
    var _this = this,
      vm = _this.layer.vm();
    if (vm) {
      vm.active(true);
    }
  };
  NewAccountViewModel.prototype.onDeactivate = function() { // overrides base
    var _this = this,
      vm = _this.layer.vm();
    if (vm) {
      vm.active(false);
    }
  };

  return NewAccountViewModel;
});
