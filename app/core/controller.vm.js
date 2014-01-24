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

    _this.initMixinLoad();

    _this.childs = ko.observableArray();
    _this.activeChild = ko.observable(null);
  }
  utils.inherits(ControllerViewModel, BaseViewModel);
  ControllerViewModel.ensureProps = BaseViewModel.ensureProps;
  // ControllerViewModel.prototype.routePart = 'route';
  // ControllerViewModel.prototype.defaultChild = null;

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

  // activate async
  ControllerViewModel.prototype.activate = function(routeCtx) {
    var _this = this,
      lastActiveChild = _this.activeChild();

    // immdediately set as active
    _this.active(true);
    // store last route
    _this._lastRouteData = routeCtx.routeData;
    // load self
    _this.load(routeCtx.routeData, function() {
      // check if routeCtx is still active
      if (!routeCtx.active()) {
        return;
      }
      // active this controller
      _this.onActivate(routeCtx);
      // deactivate old child if different from newly activated child
      if (lastActiveChild && lastActiveChild !== _this.activeChild()) {
        lastActiveChild.deactivate();
      }
      if (!_this.activeChild()) {
        _this.setTitle();
        // we're done with activating
        routeCtx.done();
      }
    });
  };
  ControllerViewModel.prototype.onActivate = function(routeCtx) {
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
        child = _this.defaultChild || _this.childs()[0];
      }
    }
    // only set if different than current
    if (_this.activeChild() !== child) {
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
    _this.childs().some(function(item) {
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
  ControllerViewModel.prototype.deactivate = function() {
    var _this = this;
    _this.onDeactivate();
    _this.active(false);
  };
  ControllerViewModel.prototype.onDeactivate = function() {
    var _this = this,
      activeChild = _this.activeChild();
    if (activeChild) {
      activeChild.deactivate();
      if (true) { //@TODO: real if statement
        // only set activeChild to null when we want to unbind
        _this.activeChild(null);
      }
    }
  };

  ControllerViewModel.prototype.goTo = function(routeData, allowHistory) {
    var _this = this;
    _this.getRoute().goTo(routeData, allowHistory);
  };
  ControllerViewModel.prototype.selectChild = function(vm) {
    var _this = this;
    _this.goTo(vm.getRouteData());
  };

  function applyRouteData(controller, routeData) {
    if (!controller.routePart) {
      throw new Error('no routePart');
    }
    if (!controller.id) {
      throw new Error('no id');
    }

    if (controller.route) {
      routeData.route = controller.route.name;
    } else {
      applyRouteData(controller.pcontroller, routeData);
    }
    routeData[controller.routePart] = controller.id;
  }
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
    applyRouteData(_this, routeData);
    return routeData;
  };


  ControllerViewModel.prototype.createRouteContext = function(pathOrRouteData, cb) {
    return this.getRoute().createContext(pathOrRouteData, cb);
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
