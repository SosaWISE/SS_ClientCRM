define('src/core/layers.vm', [
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ko,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  //
  function selectTopLayer(element) {
    return element.querySelector('.layer-table:last-child');
  }
  //
  function ensureFocusable(element) {
    var tabindex = parseInt(element.getAttribute('tabindex'), 10);
    if (Number.isNaN(tabindex) || tabindex < 0) {
      element.setAttribute('tabindex', '0');
    }
  }
  ko.bindingHandlers.preventFocusUnderLayer = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      // overwrite focus function
      viewModel.focus = function() {
        var el = selectTopLayer(element) || element;
        // make sure the element is focusable
        ensureFocusable(el);
        // focus the element
        el.focus();
      };

      element.addEventListener("keydown", function(evt) {
        if (evt.keyCode === 27) { // escape key
          // close the top layer
          viewModel.closeTop();
        }
      }, true);

      //      .layer        container
      element.parentElement.parentElement.addEventListener("focus", function(evt) {
        var topLayer = selectTopLayer(element);
        // if there is a topLayer and that layer doesn't contain the target
        if (topLayer && element !== evt.target && !topLayer.contains(evt.target)) {
          // stop the event
          evt.stopPropagation();
          // focus
          viewModel.focus();
        }
      }, true);
    },
  };


  function LayersViewModel(options) {
    var _this = this;
    LayersViewModel.super_.call(_this, options);

    _this.showLayers = ko.observableArray();
    _this.alertLayers = ko.observableArray();
  }
  utils.inherits(LayersViewModel, BaseViewModel);
  LayersViewModel.prototype.viewTmpl = 'tmpl-layers';
  LayersViewModel.prototype.focus = function() {}; // default to doing nothing

  LayersViewModel.prototype.show = function(viewModel, onClose) {
    var _this = this;
    return add(_this, _this.showLayers, viewModel, onClose);
  };
  LayersViewModel.prototype.alert = function(viewModel, onClose) {
    var _this = this;
    return add(_this, _this.alertLayers, viewModel, onClose);
  };
  LayersViewModel.prototype.closeTop = function() {
    var _this = this,
      topLayer = _this.getTopLayer();
    if (topLayer) {
      topLayer.close();
    }
  };
  LayersViewModel.prototype.getTopLayer = function() {
    var _this = this;

    function getTopLayer(layers) {
      var length = layers.length;
      if (length) {
        // the top layer is actually the last layer
        return layers[length - 1];
      }
    }
    return getTopLayer(_this.alertLayers()) || getTopLayer(_this.showLayers());
  };

  function add(layersVM, layers, viewModel, onClose) {
    var lastActive, layer, subscription, prevVM;

    lastActive = document.activeElement;
    layer = {
      vm: ko.observable(null),
      close: function(result) {
        if (subscription) {
          subscription.dispose();
          subscription = null;
        }
        var topLayer = layersVM.getTopLayer(),
          index = layers.indexOf(layer);

        //@TODO: check to see if the layer can be closed
        if (index > -1) {
          layers.splice(index, 1);
        }
        if (typeof(onClose) === 'function') {
          onClose(result);
        }

        //
        if (layer === topLayer) {
          if (lastActive) {
            // focus the item that was focused before this
            lastActive.focus();
          } else {
            // try to focus the next top layer
            layersVM.focus();
          }
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
      layers.vmVM = layersVM;
      vm.layer = layer;
      vm.active(true);
      prevVM = vm;
    });
    layer.vm(viewModel);
    layers.push(layer);

    // ensure nothing under the layer has focus
    layersVM.focus();

    return layer;
  }

  return LayersViewModel;
});
