define('src/core/router', [
  'jquery',
  'src/core/route',
  'src/core/utils',
], function(
  jquery,
  Route,
  utils
) {
  "use strict";

  function no_op() {}

  function Router() {
    this.getUser = no_op;
    this.routeMap = {};
    this.routes = [];
    this.anonRoutes = [];

    this.destPath = null;
    this.currRouteCtx = null;
    this._ignoreCount = 0;
  }
  Router.prototype.create = function() {
    return new Router();
  };

  Router.prototype.init = function(getUser) {
    var _this = this;
    // ,changeTimeout;

    if (utils.isFunc(getUser)) {
      // set getUser
      _this.getUser = getUser;
    }

    function changePath() {
      _this.goToPath(_this.getPath(), null, false);
    }

    // check the user is logged in
    if (!_this.getUser()) {
      // save destination path
      this.destPath = this.getPath();
    }

    // go to initial route, then listen for the route to change
    changePath();
    window.addEventListener('hashchange', function() {
      if (_this._ignoreCount > 0) {
        _this._ignoreCount--;
        return;
      }
      // clearTimeout(changeTimeout);
      // changeTimeout = setTimeout(function() {
      changePath();
      // }, 0);
    });
  };
  Router.prototype.useDestPath = function() {
    this.goToPath(this.destPath, null, false);
    this.destPath = null;
  };

  Router.prototype.addRoute = function(controller, routeName, routePath, defaultRouteData) {
    addRoute(this, this.routes, controller, routeName, routePath, defaultRouteData);
  };
  Router.prototype.addAnonRoute = function(controller, routeName, routePath, defaultRouteData) {
    addRoute(this, this.anonRoutes, controller, routeName, routePath, defaultRouteData);
  };

  Router.prototype.setPath = function(path, allowHistory) {
    if (path[0] !== '#') {
      path = '#' + path;
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
      user = _this.getUser(),
      routes = user ? _this.routes : _this.anonRoutes,
      route;

    // find the first route that matches the path
    route = findFirstRoute(routes, path);
    // check if a route was found
    if (!route) {
      // first route is the default route
      route = routes[0];
      // make default path for route
      path = route.toPath(route.fromPath('/' + route.name));
    }

    if (_this.currRouteCtx) {
      //@TODO: store in app data???
      // StateKeys: {
      //   lastView: 'state.active-hash'
      // },

      // deactivate current route if it doesn't match the new route
      _this.currRouteCtx.dispose(_this.currRouteCtx.route !== route);
      _this.currRouteCtx = null;
    }

    // set path before the route is activated
    _this.setPath(path, allowHistory);
    // activate the route
    _this.currRouteCtx = route.activate(path, extraData, function onActivated(pathTaken) {
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
      throw new Error('no route named ' + routeName);
    }
    return _this.goToPath(route.toPath(routeData), extraData, allowHistory);
  };

  Router.prototype.findRoute = function(routeName) {
    var _this = this,
      user = _this.getUser(),
      routes = user ? _this.routes : _this.anonRoutes;
    return findRouteByName(routes, routeName);
  };


  function addRoute(router, routes, controller, routeName, routePath, defaultRouteData) {
    var route = Route.create(router, controller, routeName, routePath, defaultRouteData);
    if (router.routeMap[route.name]) {
      throw new Error('route named `' + route.name + '` already exists');
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


  var bodyEl = jquery('body'),
    siteLoadingEl = jquery('#siteLoading'),
    loginEl = jquery('#login-container'),
    siteEl = jquery('#site-container');

  function showElements(user, cls) {
    siteLoadingEl.remove();
    if (user) {
      bodyEl.attr('class', cls);
      loginEl.hide();
      siteEl.show();
    } else {
      bodyEl.attr('class', '');
      loginEl.show();
      siteEl.hide();
    }
  }

  return new Router();
});
