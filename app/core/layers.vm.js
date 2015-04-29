define('src/core/layers.vm', [
  'ko',
  'src/core/arrays',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ko,
  arrays,
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
      }, false); // give someone a chance to cancel this event

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
    BaseViewModel.ensureProps(_this, ['controller']);

    _this.showLayers = ko.observableArray();
    _this.alertLayers = ko.observableArray();
  }
  utils.inherits(LayersViewModel, BaseViewModel);
  LayersViewModel.prototype.viewTmpl = 'tmpl-layers';
  LayersViewModel.prototype.focus = function() {}; // default to doing nothing

  LayersViewModel.prototype.show = function(viewModel, onClose, routeData) {
    var _this = this;
    return add(_this, _this.showLayers, viewModel, onClose, routeData);
  };
  LayersViewModel.prototype.alert = function(viewModel, onClose, routeData) {
    var _this = this;
    return add(_this, _this.alertLayers, viewModel, onClose, routeData);
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

  function add(layersVm, layers, viewModel, onClose, routeData) {
    var lastActive, layer, subscription, prevCtx;

    lastActive = document.activeElement;
    layer = {
      vm: ko.observable(null),
      close: function() {
        if (subscription) {
          subscription.dispose();
          subscription = null;
        }
        var topLayer = layersVm.getTopLayer(),
          index = layers.indexOf(layer),
          results, msg, vm = layer.vm();

        // check if the layer vm can be closed
        if (vm && (msg = vm.closeMsg())) {
          notify.warn(msg, null, 7);
          return false;
        }

        if (index > -1) {
          layers.splice(index, 1);
        }
        if (prevCtx) {
          prevCtx.dispose();
        }
        // destroy vm
        vm.destroy();
        //
        if (utils.isFunc(onClose)) {
          results = utils.isFunc(vm.getResults) ? vm.getResults() : [];
          if (results.length > 1) {
            onClose.apply(null, results);
          } else {
            onClose.call(null, results[0]);
          }
        }

        //
        if (layer === topLayer) {
          if (lastActive) {
            // focus the item that was focused before this
            lastActive.focus();
          } else {
            // try to focus the next top layer
            layersVm.focus();
          }
        }
        return true;
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
      var ctx = createContext(vm, routeData || layersVm.controller.getRouteData(), null, function() {
        // console.log('activated layer');
      });

      if (prevCtx) {
        prevCtx.dispose();
      }
      prevCtx = ctx;

      vm.layersVm = layersVm;
      vm.layer = layer;
      vm.activate(ctx);
    });
    layer.vm(viewModel);
    layers.push(layer);

    // ensure nothing under the layer has focus
    layersVm.focus();

    return layer;
  }

  // mimic how the router works
  function createContext(vm, routeData, extraData, cb) {
    var disposed,
      routeCtx;
    if (routeData) {
      routeCtx = {
        routeData: routeData,
        extraData: extraData || {},
        dispose: function() {
          disposed = true;
          delete vm.layersVm;
          delete vm.layer;
          vm.deactivate();
        },
        active: function() {
          return !disposed;
        },
        done: function() {
          cb();
        },
      };
      return routeCtx;
    }
  }

  return LayersViewModel;
});
