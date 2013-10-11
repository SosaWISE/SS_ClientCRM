define([
  'notify',
  'util/utils',
  'vm.base',
  'vm.layers',
  'vm.rep.find',
  'vm.address.validate',
  'ko'
], function(
  notify,
  utils,
  BaseViewModel,
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
      setLayer(_this.validateAddressVM);
    };
    _this.validateAddressVM = new ValidateAddressViewModel();
    _this.validateAddressVM.clickNext = function() {
      alert('done');
    };


    _this.layer = {
      vm: ko.observable(null),
      width: ko.observable(0),
      height: ko.observable(0),
      viewTmpl: 'tmpl-account_new_layer',
    };

    function setLayer(vm) {
      _this.layer.vm(vm);
      _this.layer.width(vm.width);
      _this.layer.height(vm.height);
      vm.activate();
    }
    setLayer(_this.findRepVM);

    _this.layersVM = new LayersViewModel();
    _this.layersVM.show(_this.layer);
  }
  utils.inherits(NewAccountViewModel, BaseViewModel);
  NewAccountViewModel.prototype.viewTmpl = 'tmpl-account_new';

  NewAccountViewModel.prototype.onActivate = function(routeData) { // overrides base
    var _this = this,
      vm = _this.layer.vm();

    if (vm) {
      vm.activate(routeData);
    }
  };
  NewAccountViewModel.prototype.onDeactivate = function() { // overrides base
    var _this = this,
      vm = _this.layer.vm();

    if (vm) {
      vm.deactivate();
    }
  };

  return NewAccountViewModel;
});
