define('src/core/controller.vm', [
  'src/core/helpers',
  'src/core/notify',
  'src/core/joiner',
  'jquery',
  'src/core/utils',
  'ko',
  'src/core/base.vm',
], function(
  helpers,
  notify,
  joiner,
  jquery,
  utils,
  ko,
  BaseViewModel
) {
  "use strict";

  function ControllerViewModel(options) {
    var _this = this;
    ControllerViewModel.super_.call(_this, options);

    _this.mixinLoad();
    _this.childs = ko.observableArray();
    _this.activeChild = ko.observable(null);
    _this.updateRouting();
  }
  utils.inherits(ControllerViewModel, BaseViewModel);
  ControllerViewModel.ensureProps = BaseViewModel.ensureProps;
  // ControllerViewModel.prototype.routePart = 'route';
  // ControllerViewModel.prototype.defaultChild = null;

  ControllerViewModel.prototype.updateRouting = function(pcontroller) {
    var _this = this;
    if (arguments.length) {
      _this.pcontroller = pcontroller;
    }
    if (_this.pcontroller) {
      // cache route
      _this.route = _this.pcontroller.getRoute();
      // cache routePart
      _this.routePart = _this.pcontroller.getChildRoutePart();
      // update childs if already loaded
      _this.childs.peek().forEach(function(childVm) {
        if (utils.isFunc(childVm.updateRouting)) {
          childVm.updateRouting(_this);
        }
      });
    }
  };

  ControllerViewModel.prototype.setRoute = function(route) {
    var _this = this;
    if (_this.route) {
      throw new Error('controller can only be associated with one route');
    }
    _this.route = route;
  };
  ControllerViewModel.prototype.getRoute = function() {
    var _this = this,
      result;
    if (_this.route) {
      result = _this.route;
    } else {
      result = _this.pcontroller.getRoute();
    }
    return result;
  };
  ControllerViewModel.prototype.getRoutePart = function() {
    var _this = this,
      result;
    if (_this.route) {
      result = _this.route;
    } else {
      result = _this.pcontroller.getRoute();
    }
    return result;
  };
  ControllerViewModel.prototype.getChildRoutePart = function() {
    var _this = this;
    return _this.getRoute().getNextPart(_this.routePart);
  };


  // activate async
  ControllerViewModel.prototype.activate = function(routeCtx) { // overrides base
    var _this = this,
      lastActiveChild = _this.activeChild.peek();

    // immdediately set as active
    _this.active(true);
    // store last route
    _this._lastRouteData = routeCtx.routeData;
    // load self
    _this.load(routeCtx.routeData, routeCtx.extraData, function() {
      // check if routeCtx is still active
      if (!routeCtx.active()) {
        return;
      }
      // active this controller
      _this.onActivate(routeCtx);
      // deactivate old child if different from newly activated child
      if (lastActiveChild && lastActiveChild !== _this.activeChild.peek()) {
        lastActiveChild.deactivate();
      }
      if (!_this.activeChild.peek()) {
        _this.setTitle();
        // we're done with activating
        routeCtx.done();
      }
    });
  };
  ControllerViewModel.prototype.onActivate = function(routeCtx) { // overrides base
    var _this = this,
      routeData = routeCtx.routeData,
      child = _this.findChild(routeData);
    if (!child) {
      if (_this._prevChild && typeof(routeData[_this._prevChild.routePart]) === 'undefined') {
        //
        child = _this._prevChild;
      } else {
        // no child found
        _this.removeExtraRouteData(routeData);
        // try to use the default child
        child = _this.defaultChild || _this.childs.peek()[0];
      }
    }
    // only set if different than current
    if (_this.activeChild.peek() !== child) {
      _this.activeChild(child);
    }
    if (child) {
      if (child.routePart) {
        routeData[child.routePart] = child.id;
      }
      child.activate(routeCtx);
    }
    _this._prevChild = child;
  };
  ControllerViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      result;
    _this.childs.peek().some(function(item) {
      var routePart = item.routePart;
      if (routePart) {
        /* jshint eqeqeq:false */
        // 10001 == '10001'
        if (item.id == routeData[routePart]) {
          result = item;
          return result;
        }
      }
    });
    return result;
  };
  ControllerViewModel.prototype.removeExtraRouteData = function(routeData) {
    var _this = this;
    return _this.getRoute().removeExtraRouteData(routeData, _this.routePart);
  };

  // synchronous
  ControllerViewModel.prototype.onDeactivate = function() { // overrides base
    var _this = this,
      activeChild = _this.activeChild.peek();
    if (activeChild) {
      activeChild.deactivate();
      if (true) { //@TODO: real if statement
        // only set activeChild to null when we want to unbind
        _this.activeChild(null);
      }
    }
  };

  ControllerViewModel.prototype.canClose = function() { // overrides base
    var _this = this;
    //@TODO: check all childs
    return !_this.closeMsg();
  };
  ControllerViewModel.prototype.closeMsg = function() { // overrides base
    //@TODO: check all childs
    return null;
  };
  ControllerViewModel.prototype.closeChild = function(vm) {
    var _this = this,
      index = -1,
      childs, routeData,
      msg = vm.closeMsg();
    // check if can close
    if (msg) {
      // if can't close navigate to vm
      _this.goTo(vm.getRouteData(), {
        closeFailed: true,
      });
      notify.notify('warn', msg, 7);
    } else {
      index = _this.childs.peek().indexOf(vm);
      if (index > -1) {
        // remove from list
        _this.childs.splice(index, 1);
        // deactivate vm
        vm.deactivate();
        // check if a sibling needs to be activated
        if (_this.activeChild.peek() === vm) {
          // null out previous child
          _this._prevChild = null;
          // try to activate next or prev child
          childs = _this.childs.peek();
          vm = childs[index] || childs[index - 1];
          if (vm) {
            routeData = vm.getRouteData();
          } else {
            // activate default
            routeData = _this.getRouteData();
            _this.removeExtraRouteData(routeData);
          }
          _this.goTo(routeData);
        }
      }
    }
    return index;
  };
  ControllerViewModel.prototype.close = function() {
    var _this = this,
      pcontroller = _this.pcontroller;
    if (pcontroller) {
      return pcontroller.closeChild(_this);
    }
  };

  ControllerViewModel.prototype.goTo = function(routeData, extraData, allowHistory) {
    var _this = this;
    _this.getRoute().goTo(routeData, extraData, allowHistory);
  };
  ControllerViewModel.prototype.selectChild = function(vm) {
    var _this = this;
    _this.goTo(vm.getRouteData());
  };

  ControllerViewModel.prototype.applyRouteData = function(routeData) {
    var _this = this;
    if (!_this.routePart) {
      throw new Error('no routePart');
    }
    if (!_this.id) {
      throw new Error('no id');
    }

    if (_this.pcontroller) {
      // recursively walk parent controllers
      _this.pcontroller.applyRouteData(routeData);
    } else {
      routeData.route = _this.route.name;
    }
    routeData[_this.routePart] = _this.id;
  };
  ControllerViewModel.prototype.getRouteData = function() {
    var _this = this,
      routeData;
    if (_this._lastRouteData) {
      // clone it since we don't want anyone to modify it.
      // it can be stored by multiple controllers and changing
      // one controller shouldn't change all the others
      routeData = utils.clone(_this._lastRouteData);
    } else {
      routeData = {};
    }
    _this.applyRouteData(routeData);
    return routeData;
  };


  ControllerViewModel.prototype.createRouteContext = function(pathOrRouteData, extraData, cb) {
    return this.getRoute().createContext(pathOrRouteData, extraData, cb);
  };



  ControllerViewModel.prototype.setTitle = function() {
    var parts = [],
      title,
      controller = this;
    if (ControllerViewModel.titlePrefix) {
      parts.push(ControllerViewModel.titlePrefix);
    }

    while (!title && controller) {
      title = ko.unwrap(controller.title);
      if (!title) {
        // go up to parent controller
        controller = controller.pcontroller;
      }
    }
    if (title) {
      parts.push(title);
    }
    if (ControllerViewModel.titlePostfix) {
      parts.push(ControllerViewModel.titlePostfix);
    }

    jquery('title').text(parts.join(' '));
  };

  return ControllerViewModel;
});
