define('src/core/vm.controller', [
  'src/core/notify',
  'src/core/joiner',
  'jquery',
  'src/config',
  'src/core/utils',
  'ko',
  'src/core/vm.base',
], function(
  notify,
  joiner,
  jquery,
  config,
  utils,
  ko,
  BaseViewModel
) {
  "use strict";

  function ControllerViewModel(options) {
    var _this = this;
    ControllerViewModel.super_.call(_this, options);

    _this.loading = ko.observable(false);
    _this.activeChild = ko.observable(null);

    _this.childs = ko.observableArray();
    _this.deps = ko.observableArray();
  }
  utils.inherits(ControllerViewModel, BaseViewModel);
  ControllerViewModel.prototype.routePart = 'route';
  ControllerViewModel.prototype.defaultChild = null;

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
      result = _this.controller.getRoute();
    }
    return result;
  };

  // activate async
  ControllerViewModel.prototype.activate = function(routeCtx) {
    var _this = this;
    // ensure the routeCtx is active ?????
    if (!routeCtx.active()) {
      return;
    }
    // immdediately set as active
    _this.active(true);
    // load self
    _this.load(routeCtx.routeData, function() {
      // check if routeCtx is still active
      if (!routeCtx.active()) {
        return;
      }
      // active this controller
      _this.onActivate(routeCtx);
    });
  };
  ControllerViewModel.prototype.onActivate = function(routeCtx) {
    var _this = this,
      routeData = routeCtx.routeData,
      child = _this.findChild(routeData);
    if (!child) {
      // no child found
      _this.removeExtraRouteData(routeData);
      // try to use the default child
      child = _this.defaultChild;
    }
    _this.activeChild(child);
    if (child) {
      if (child.routePart) {
        routeData[child.routePart] = child.id;
      }
      _this.setTitle(child.name || _this.name);
      child.activate(routeCtx);
    } else {
      // no child
      _this.setTitle(_this.name);
      // we're done with activating
      routeCtx.done();
    }
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
    var _this = this,
      routePart = _this.routePart,
      remove = false;
    if (!routePart) {
      return;
    }
    // remove all properties after this controllers routePart
    Object.keys(routeData).forEach(function(prop) {
      if (remove) {
        delete routeData[prop];
      } else {
        remove = prop === routePart;
      }
    });
  };

  // synchronous
  ControllerViewModel.prototype.deactivate = function() {
    var _this = this;
    _this.onDeactivate();
    _this.active(false);
  };
  ControllerViewModel.prototype.onDeactivate = function() {
    var _this = this,
      activeChild = _this.activeChild;
    if (activeChild()) {
      activeChild().deactivate();
      activeChild(null);
    }
  };

  ControllerViewModel.prototype.load = function(routeData, cb) {
    var _this = this,
      join,
      subscription;

    if (_this._loaded) {
      // we're done here
      return cb();
    }

    if (!_this.loading()) {
      // load
      _this.loading(true);
      join = joiner();
      _this.onLoad(routeData, join);
      join.when(function(errResp) {
        if (errResp) {
          notify.notify('error', errResp.Message);
        }
        _this._loaded = true;
        // setting this should call all subscriptions made below (if any)
        _this.loading(false);
        //
        cb();
      });
    } else {
      // notify when we're done loading
      subscription = _this.loading.subscribe(function() {
        subscription.dispose();
        cb();
      });
    }
  };
  ControllerViewModel.prototype.onLoad = function(routeData, join) {
    join.add()();
  };


  ControllerViewModel.prototype.getLastRouteData = function() {
    return this.getRoute().lastRouteData;
  };

  ControllerViewModel.prototype.goTo = function(routeData, allowHistory) {
    this.getRoute().goTo(routeData, allowHistory);
  };
  ControllerViewModel.prototype.setRouteData = function(routeData) {
    this.getRoute().setRouteData(routeData);
  };

  ControllerViewModel.prototype.createRouteContext = function(pathOrRouteData, cb) {
    return this.getRoute().createContext(pathOrRouteData, cb);
  };



  ControllerViewModel.prototype.setTitle = function(title) {
    var parts = [];
    if (config.titlePrefix) {
      parts.push(config.titlePrefix);
    }
    if (title) {
      parts.push(title);
    }
    if (config.titlePostfix) {
      parts.push(config.titlePostfix);
    }

    jquery('title').text(parts.join(' '));
  };

  return ControllerViewModel;
});
