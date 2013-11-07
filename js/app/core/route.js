define('src/core/route', [
], function() {
  "use strict";

  function Route(router, controller, name, regx, parts, defaultRouteData) {
    controller.setRoute(this);

    this.router = router;
    this.controller = controller;
    this.name = name;
    this.regx = regx;
    this.parts = parts;
    this.defaultRouteData = defaultRouteData || {};
    this.defaultRouteData.route = name;
  }


  //
  // public static
  //

  Route.create = function(router, controller, name, routePath, defaultRouteData) {
    // make regx and parts from routePath
    var regxParts = [],
      parts = [];

    // anchor match to start of string
    regxParts.push('^');

    // literally match route name
    regxParts.push('(\/' + name + ')');
    parts.push('route');

    routePath.split('/').forEach(function(name) {
      if (!name) {
        // starting slash or empty routePath can make an empty name
        return;
      }
      if (name[0] !== ':') {
        throw new Error('name must start with a colon');
      }

      regxParts.push('(\/[^\/]*)?');
      parts.push(name.substr(1)); // remove colon
    });

    // anchor match to end of string
    regxParts.push('$');

    return new Route(router, controller, name, new RegExp(regxParts.join('')), parts, defaultRouteData);
  };


  //
  // members
  //

  Route.prototype.addDefaults = function(routeData, breakOnFound) {
    var defaultRouteData = this.defaultRouteData;
    this.parts.some(function(part) {
      if (isNullOrEmpty(routeData[part])) {
        // route value not set, so set to default value
        routeData[part] = defaultRouteData[part];
      } else if (breakOnFound) {
        // break
        return true;
      }
    });
  };

  Route.prototype.fromPath = function(path) {
    var matches = this.regx.exec(path),
      routeData;
    if (matches) {
      routeData = {};
      this.parts.some(function(part, index) {
        var match = matches[index + 1];
        if (match) {
          routeData[part] = match.substr(1);
        }
      });
      this.addDefaults(routeData);
      return routeData;
    }
  };
  Route.prototype.toPath = function(routeData) {
    var pathParts = [],
      routeName = this.name;
    // add an empty string to prefix the path with a slash
    pathParts.push('');
    this.parts.some(function(part) {
      var value = routeData[part];
      if (isNullOrEmpty(value)) {
        if (part === 'route') {
          value = routeName;
        } else {
          // break out of loop when no value is found
          return true;
        }
      }
      // add value to path
      pathParts.push(value);
    });
    // merge parts into path
    return pathParts.join('/');
  };
  Route.prototype.deactivate = function() {
    disposeOnLoaded(this);
    this.controller.deactivate();
  };
  Route.prototype.activate = function(path, cb) {
    var routeData = this.fromPath(path);
    if (routeData) {
      // the path matches this route so we can activate it
      activateRoute(this, routeData, cb);
    }
    // true if this route has been activated
    return !!routeData;
  };

  // use this if the the panel should change
  // this tries to look up the route
  Route.prototype.redirectTo = function(routeData, allowHistory) {
    var _this = this,
      routeName = routeData.route || _this.name,
      // look up new route
      route = _this.router.routeMap[routeName];
    if (route) {
      route.addDefaults(routeData);
    }
    route.lastRouteData = routeData;
    _this.router.redirectTo(routeName, routeData, allowHistory);
  };
  // use this if the panel will stay the same
  Route.prototype.setRouteData = function(routeData) {
    var _this = this;
    if (routeData.route && routeData.route !== _this.name) {
      throw new Error('');
    }
    _this.addDefaults(routeData);
    _this.lastRouteData = routeData;
    _this.router.setPath(_this.toPath(routeData), false);
  };


  //
  // private statics
  //

  function isNullOrEmpty(str) {
    return str == null || str.length === 0;
  }

  function disposeOnLoaded(route) {
    if (route.onLoaded) {
      route.onLoaded.dispose();
      route.onLoaded = null;
    }
  }

  function activateRoute(route, routeData, cb) {
    route.lastRouteData = routeData;

    // ensure the previous has been disposed
    disposeOnLoaded(route);

    function activateController() {
      // we only needed it for one event
      disposeOnLoaded(route);
      // the controller modifies the routeData to fit what it has
      route.controller.activate(routeData);
      // return the path taken
      cb(route.toPath(routeData));
    }

    if (!route.controller.loaded()) {
      // store the subscription to loaded
      route.onLoaded = route.controller.loaded.subscribe(activateController);
      route.controller.load(routeData);
    } else {
      activateController();
    }
  }

  return Route;
});
