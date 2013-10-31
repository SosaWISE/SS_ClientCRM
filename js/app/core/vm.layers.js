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

  LayersViewModel.prototype.show = function(vm) {
    return add(this.showLayers, vm);
  };
  LayersViewModel.prototype.alert = function(vm) {
    return add(this.alertLayers, vm);
  };

  function add(layers, vm) {
    var layer = {
      vm: vm,
      close: function() {
        var index = layers.indexOf(layer);
        if (index > -1) {
          layers.splice(index, 1);
        }
      },
    };
    vm.closeLayer = layer.close;
    layers.push(layer);
    return layer;
  }

  return LayersViewModel;
});
