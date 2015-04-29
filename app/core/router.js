define("src/core/router", [
  "jquery",
  "src/core/harold",
  "src/core/route",
  "src/core/utils",
], function(
  jquery,
  harold,
  Route,
  utils
) {
  "use strict";

  function Router() {
    var _this = this;
    _this._inited = false;
    _this.routeMap = {};
    _this.routes = [];
    _this.anonRoutes = [];

    _this.currRouteCtx = null;
    _this._ignoreCount = 0;
  }
  Router.prototype.create = function() {
    return new Router();
  };

  Router.prototype.init = function() {
    var _this = this;
    // ,changeTimeout;
    if (_this._inited) {
      return;
    }
    _this._inited = true;

    function changePath() {
      _this.goToPath(_this.getPath(), null, false);
    }

    // go to initial route, then listen for the route to change
    changePath();
    window.addEventListener("hashchange", function() {
      if (_this._ignoreCount > 0) {
        _this._ignoreCount--;
        return;
      }
      // window.clearTimeout(changeTimeout);
      // changeTimeout = window.setTimeout(function() {
      changePath();
      // }, 0);
    });
  };
  // Router.prototype.useDestPath = function() {
  //   var _this = this,
  //     destPath = decodeDestPath(_this.getPath());
  //   _this.goToPath(destPath, null, false);
  // };

  Router.prototype.addRoute = function(controller, routeName, routePath, defaultRouteData) {
    addRoute(this, this.routes, controller, routeName, routePath, defaultRouteData);
  };
  Router.prototype.addAnonRoute = function(controller, routeName, routePath, defaultRouteData) {
    addRoute(this, this.anonRoutes, controller, routeName, routePath, defaultRouteData);
  };

  Router.prototype.endSession = function() {
    var _this = this;
    // clear the hash so on login the user is taken to the default page
    _this.setPath("", false);
    // prevent hash from being changed again
    _this.setPath = utils.noop;
    // reload page
    window.location.reload();
  };

  Router.prototype.setPath = function(path, allowHistory) {
    if (path[0] !== "#") {
      path = "#" + path;
    }
    if (location.hash !== path) {
      // add to _ignoreCount
      this._ignoreCount++;
      if (allowHistory) {
        location.hash = path;
      } else {
        location.replace(path);
      }
    }
  };
  Router.prototype.getPath = function() {
    var hash = location.hash;
    if (hash && hash.length) {
      // remove # from front and make lowercase
      hash = hash.substr(1).toLowerCase();
    }
    return hash;
  };

  Router.prototype.goToPath = function(path, extraData, allowHistory) {
    var _this = this,
      user = harold.fetch("user"),
      routes = user ? _this.routes : _this.anonRoutes,
      route;

    extraData = extraData || {};
    extraData.destPath = path;

    // find the first route that matches the path
    route = findFirstRoute(routes, path);
    // check if a route was found
    if (!route) {
      // first route is the default route
      route = routes[0];
      // make default path for route
      path = route.toPath(route.fromPath("/" + route.name));
    }

    if (_this.currRouteCtx) {
      //@TODO: store in app data???
      // StateKeys: {
      //   lastView: "state.active-hash"
      // },

      // deactivate current route if it does not match the new route
      _this.currRouteCtx.dispose(_this.currRouteCtx.route !== route);
      _this.currRouteCtx = null;
    }

    // set path before the route is activated
    _this.setPath(path, allowHistory);
    // activate the route
    _this.currRouteCtx = route.activate(path, extraData, function(pathTaken) {
      if (pathTaken !== path) {
        // set pathTaken in address bar
        _this.setPath(pathTaken, false);
      }
    });

    showElements(user, route.name);
  };
  Router.prototype.goTo = function(routeName, routeData, extraData, allowHistory) {
    var _this = this,
      route = _this.routeMap[routeName];
    if (!route) {
      throw new Error("no route named " + routeName);
    }
    return _this.goToPath(route.toPath(routeData), extraData, allowHistory);
  };

  Router.prototype.findRoute = function(routeName) {
    var _this = this,
      user = harold.fetch("user"),
      routes = user ? _this.routes : _this.anonRoutes;
    return findRouteByName(routes, routeName);
  };
  Router.prototype.anonRouteFromPath = function(path) {
    var _this = this;
    return findFirstRoute(_this.anonRoutes, path);
  };


  function addRoute(router, routes, controller, routeName, routePath, defaultRouteData) {
    var route = Route.create(router, controller, routeName, routePath, defaultRouteData);
    if (router.routeMap[route.name]) {
      throw new Error("route named `" + route.name + "` already exists");
    }
    router.routeMap[route.name] = route;
    routes.push(route);
  }

  function findFirstRoute(routes, path) {
    var routeFound;
    // activate the first route that matches the path
    routes.some(function(route) {
      if (route.fromPath(path)) {
        // break out of loop if found
        return (routeFound = route);
      }
    });
    return routeFound;
  }

  function findRouteByName(routes, routeName) {
    var routeFound;
    // activate the first route that matches the path
    routes.some(function(route) {
      if (route.name === routeName) {
        // break out of loop if found
        return (routeFound = route);
      }
    });
    return routeFound;
  }


  var bodyEl = jquery("body"),
    siteLoadingEl = jquery("#siteLoading"),
    loginEl = jquery("#login-container"),
    siteEl = jquery("#site-container");

  function showElements(user, cls) {
    siteLoadingEl.remove();
    if (user) {
      bodyEl.attr("class", cls);
      loginEl.hide();
      siteEl.show();
    } else {
      bodyEl.attr("class", "");
      loginEl.show();
      siteEl.hide();
    }
  }

  return Router;
});
