define([
  'notify',
  'util/utils',
  'vm.base',
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

    _this.layers = ko.observableArray();
    _this.topLayers = ko.observableArray();
  }
  utils.inherits(LayersViewModel, BaseViewModel);
  LayersViewModel.prototype.viewTmpl = 'tmpl-layers';

  LayersViewModel.prototype.show = function(vm) {
    return add(this.layers, vm);
  };
  LayersViewModel.prototype.alert = function(vm) {
    return add(this.topLayers, vm);
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
    layers.push(layer);
    return layer;
  }

  return LayersViewModel;
});
