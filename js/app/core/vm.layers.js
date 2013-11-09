define('src/core/vm.layers', [
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
  'ko'
], function(
  notify,
  utils,
  BaseViewModel,
  ko
) {
  "use strict";

  function LayersViewModel(options) {
    var _this = this;
    LayersViewModel.super_.call(_this, options);

    _this.showLayers = ko.observableArray();
    _this.alertLayers = ko.observableArray();
  }
  utils.inherits(LayersViewModel, BaseViewModel);
  LayersViewModel.prototype.viewTmpl = 'tmpl-layers';

  LayersViewModel.prototype.show = function(vm, onClose) {
    return add(this, this.showLayers, vm, onClose);
  };
  LayersViewModel.prototype.alert = function(vm, onClose) {
    return add(this, this.alertLayers, vm, onClose);
  };

  function add(layersVM, layers, vm, onClose) {
    var layer = {
      vm: vm,
      close: function(result) {
        var index = layers.indexOf(layer);
        if (index > -1) {
          layers.splice(index, 1);
        }
        if (typeof(onClose) === 'function') {
          onClose(result);
        }
      },
    };

    vm.layersVM = layersVM;
    vm.layer = layer;

    layers.push(layer);

    // set the view model as active
    vm.active(true);

    return layer;
  }

  return LayersViewModel;
});
