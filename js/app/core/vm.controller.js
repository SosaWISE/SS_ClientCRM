define('src/core/vm.controller', [
  'jquery',
  'src/config',
  'src/util/utils',
  'ko',
  'src/core/vm.base',
], function(
  $,
  config,
  utils,
  ko,
  BaseViewModel
) {
  "use strict";

  function ControllerViewModel(options) {
    var _this = this;
    ControllerViewModel.super_.call(_this, options);

    _this.loaded = ko.observable(false);
    _this.loading = ko.observable(false);
    _this.activeChild = ko.observable(null);
    _this.list = ko.observableArray();
  }
  utils.inherits(ControllerViewModel, BaseViewModel);
  ControllerViewModel.prototype.childName = 'tab';
  ControllerViewModel.prototype.defaultChild = 'index';
  ControllerViewModel.prototype.extraRouteData = ['id', 'action'];

  ControllerViewModel.prototype.setRoute = function(route) {
    if (this.route) {
      throw new Error('controller can only be associated with one route');
    }
    this.route = route;
  };
  ControllerViewModel.prototype.goToRoute = function(routeData, allowHistory) {
    this.lastRouteData = routeData;
    if (this.parent) {
      this.parent.goToRoute(routeData, allowHistory);
    } else {
      this.route.goTo(routeData, allowHistory);
    }
  };
  ControllerViewModel.prototype.setRouteData = function(routeData) {
    this.lastRouteData = routeData;
    if (this.parent) {
      this.parent.setRouteData(routeData);
    } else {
      this.route.setRouteData(routeData);
    }
  };

  ControllerViewModel.prototype.findChild = function(id) {
    var result;
    if (this.list) {
      this.list().some(function(item) {
        /* jshint eqeqeq:false */
        if (item.id == id) {
          result = item;
          return result;
        }
      });
    }
    return result;
  };
  ControllerViewModel.prototype.removeExtraRouteData = function(routeData) {
    if (this.extraRouteData) {
      this.extraRouteData.forEach(function(paramName) {
        delete routeData[paramName];
      });
    }
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

    $('title').text(parts.join(' '));
  };
  ControllerViewModel.prototype.onActivate = function(routeData) { // overrides base
    var child = this.findChild(routeData[this.childName]);
    if (!child) {
      this.removeExtraRouteData(routeData);
      child = this.findChild(this.defaultChild);
    }
    if (!child) {
      delete routeData[this.childName];
      this.setTitle(this.name || '');
    } else {
      routeData[this.childName] = child.id;
      child.activate(routeData);
      this.setTitle(child.name);
    }
    this.activeChild(child);
    // this.setTitle(this.name + '/' + child.name);
  };
  ControllerViewModel.prototype.onDeactivate = function() { // overrides base
    var activeChild = this.activeChild;
    if (activeChild()) {
      activeChild().deactivate();
      activeChild(null);
    }
  };

  ControllerViewModel.prototype.load = function(routeData) {
    var _this = this;
    if (_this.loaded() || _this.loading()) {
      return;
    }

    //@TODO: user joiner

    _this.loading(true);
    _this.onLoad(routeData, function(loadChilds) {
      var list = loadChilds ? _this.list() : null,
        cbCount = list ? list.length : 0;

      function checkLoaded() {
        if (cbCount === 0) {
          // all of the child view models have loaded
          _this.loading(false);
          _this.loaded(true);
        }
      }

      if (cbCount === 0) {
        checkLoaded();
      } else {
        // load child view models
        list.forEach(function(item) {
          if (item.loaded()) {
            cbCount--;
            checkLoaded();
          } else {
            var sub = item.loaded.subscribe(function() {
              sub.dispose();
              cbCount--;
              checkLoaded();
            });
            item.load();
          }
        });
      }
    });
  };
  ControllerViewModel.prototype.onLoad = function(routeData, cb) { // override me
    cb(true);
  };

  return ControllerViewModel;
});
