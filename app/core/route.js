define('src/core/route', [
], function() {
  "use strict";

  function Route(router, topController, name, regx, parts, defaultRouteData) {
    topController.setRoute(this);

    this.router = router;
    this.topController = topController;
    this.name = name;
    this.regx = regx;
    this.parts = parts;
    this.defaultRouteData = defaultRouteData || {};
    this.defaultRouteData.route = name;
  }


  //
  // public static
  //

  Route.create = function(router, topController, name, routePath, defaultRouteData) {
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

    return new Route(router, topController, name, new RegExp(regxParts.join('')), parts, defaultRouteData);
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
  Route.prototype.activate = function(path, cb) {
    var _this = this,
      routeCtx = _this.createContext(path, cb);
    if (routeCtx) {
      // the path matches this route so we can activate it
      _this.topController.activate(routeCtx);
    }
    // undefined if this route has NOT been activated
    return routeCtx;
  };

  Route.prototype.createContext = function(pathOrRouteData, cb) {
    var _this = this,
      disposed,
      routeData = typeof(pathOrRouteData) === 'string' ? _this.fromPath(pathOrRouteData) : pathOrRouteData,
      routeCtx;
    if (routeData) {
      routeCtx = {
        route: _this,
        routeData: routeData,
        dispose: function() {
          disposed = true;
          routeCtx.route.topController.deactivate();
        },
        active: function() {
          return !disposed;
        },
        done: function() {
          if (!disposed) {
            cb(routeCtx.route.toPath(routeCtx.routeData));
          }
        },
      };
      return routeCtx;
    }
  };

  // runs route activation process
  Route.prototype.goTo = function(routeData, allowHistory) {
    var _this = this,
      route = lookupRoute(_this, routeData);
    route.router.goTo(route.name, routeData, allowHistory);
  };
  // only changes url in address bar
  Route.prototype.setRouteData = function(routeData) {
    var _this = this,
      route = lookupRoute(_this, routeData);
    route.router.setPath(_this.toPath(routeData), false);
  };



  Route.prototype.removeExtraRouteData = function(routeData, afterRoutePart) {
    var _this = this,
      remove = false;
    if (afterRoutePart == null) {
      return;
    }
    _this.parts.some(function(part) {
      if (remove) {
        // keep key order
        routeData[part] = undefined;
        // delete routeData[prop];
      } else {
        remove = (part === afterRoutePart);
      }
    });
  };

  //
  // private statics
  //

  function isNullOrEmpty(str) {
    return str == null || str.length === 0;
  }

  function lookupRoute(route, routeData) {
    if (routeData.route) {
      // look up new route
      route = route.router.routeMap[routeData.route] || route;
    }
    if (route) {
      route.addDefaults(routeData);
    }
    return route;
  }

  return Route;
});
