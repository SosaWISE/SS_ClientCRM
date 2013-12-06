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

  LayersViewModel.prototype.show = function(viewModel, onClose) {
    return add(this, this.showLayers, viewModel, onClose);
  };
  LayersViewModel.prototype.alert = function(viewModel, onClose) {
    return add(this, this.alertLayers, viewModel, onClose);
  };

  function add(layersVM, layers, viewModel, onClose) {
    var subscription, layer, prevVM;

    layer = {
      vm: ko.observable(null),
      close: function(result) {
        if (subscription) {
          subscription.dispose();
          subscription = null;
        }
        var index = layers.indexOf(layer);
        if (index > -1) {
          layers.splice(index, 1);
        }
        if (typeof(onClose) === 'function') {
          onClose(result);
        }
      },
    };
    layer.width = ko.computed(function() {
      var vm = layer.vm();
      return vm ? ko.unwrap(vm.width) : 0;
    });
    layer.height = ko.computed(function() {
      var vm = layer.vm();
      return vm ? ko.unwrap(vm.height) : 0;
    });

    subscription = layer.vm.subscribe(function(vm) {
      if (prevVM) {
        delete prevVM.layersVM;
        delete prevVM.layer;
        prevVM.active(false);
      }
      vm.layersVM = layersVM;
      vm.layer = layer;
      vm.active(true);
      prevVM = vm;
    });
    layer.vm(viewModel);
    layers.push(layer);

    return layer;
  }

  return LayersViewModel;
});
