define('src/core/app.vm', [
  'ko',
  'src/core/router',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  Router,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  //
  //
  //
  //
  //
  function LazyPanelViewModel(panels, path, panelOptions) {
    var _this = this;
    LazyPanelViewModel.super_.call(_this, panelOptions);
    _this.panels = panels;
    _this.path = path;
    _this.panelOptions = panelOptions;
  }
  utils.inherits(LazyPanelViewModel, ControllerViewModel);
  LazyPanelViewModel.prototype.lazy = true;
  LazyPanelViewModel.prototype.activate = function(routeCtx) { // overrides base
    var _this = this;
    if (!routeCtx.active()) {
      return;
    }
    // immdediately set as active
    _this.active(true);
    // store last route
    _this._lastRouteData = routeCtx.routeData;
    // load actual panel
    _this.load(routeCtx.routeData, routeCtx.extraData, function() {
      //@NOTE: This callback can be called multiple times, but `onLoad` will only be called once.
      if (_this.panel) {
        // activate it (if the routeCtx has been disposed, this will do nothing)
        _this.panel.activate(routeCtx);
      }
    });
  };
  LazyPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    require(_this.path, function(PanelViewModel) {
      if (!PanelViewModel) {
        setTimeout(function() { // show message after depends.js error
          notify.warn('Failed to load ' + _this.title + ' panel code.');
        }, 0);
      } else {
        // create
        var index = _this.panels.peek().indexOf(_this),
          panelVm;
        if (index < 0) {
          notify.warn('Failed to find panel in list of panels');
        } else {
          panelVm = new PanelViewModel(_this.panelOptions);
          // set as not a lazy panel
          panelVm.lazy = false;
          // copy props
          panelVm._lastRouteData = _this.routeData;
          panelVm.router = _this.router;
          panelVm.routeName = _this.routeName;
          panelVm.routesMap = _this.routesMap;
          panelVm.active = _this.active;
          panelVm.viewTmpl = _this.viewTmpl;
          // set new topController on all routes
          Object.keys(panelVm.routesMap).forEach(function(routeName) {
            panelVm.routesMap[routeName].topController = panelVm;
          });

          //
          // replace lazy panel with the new panel
          //
          _this.panels.splice(index, 1, panelVm);

          // set panel so it can be activated the first time
          _this.panel = panelVm;
        }
      }
      // and we're done
      cb();
    });
  };

  //
  //
  //
  //
  //
  function AppViewModel(options) {
    var _this = this;
    ControllerViewModel.ensureProps(options, [
      'doLogout',
      'createLogin',
      'panelSettings',
      // 'addAnonRoutes',
      // 'addRoutes',
    ]);
    ko.utils.extend(_this, options);

    _this.setUser = _this.setUser.bind(_this);

    _this.router = new Router();
    _this.user = ko.observable(null);
    _this.login = ko.observable(null);
    _this.panels = ko.observableArray([]);
    _this.notify = notify;

    //
    // events
    //
    _this.clickPanel = function(panelVm) {
      if (panelVm === _this) {
        // try to find home route
        var route = _this.router.findRoute('home');
        if (!route) {
          return;
        }
        panelVm = route.topController;
      }
      if (!panelVm || panelVm.active()) {
        return;
      }
      panelVm.goTo(panelVm.getRouteData(), null, true);
    };
    _this.cmdLogout = ko.command(function(cb) {
      _this.doLogout(function(err) {
        if (err) {
          notify.error(err, 10);
        } else {
          _this.user(null);
          // reload page
          window.location.reload();
        }
        cb();
      });
    });

    _this.init();

    _this.os = navigator.platform.split(' ')[0].toLowerCase(); // detect os
  }
  AppViewModel.prototype.prefix = '';
  AppViewModel.prototype.postfix = '-panel';
  AppViewModel.prototype.routePart = 'route';
  AppViewModel.prototype.init = function() {
    var _this = this,
      loginVm;

    // create
    loginVm = _this.createLogin(_this.setUser, _this.routePart);
    setTemplate(loginVm, _this.prefix, _this.postfix);
    // add view models
    _this.login(loginVm);
    // add anonymous routes
    _this.addAnonRoutes(_this.router, loginVm);
  };
  AppViewModel.prototype.setUser = function(user, destPath) {
    var _this = this,
      appsMap, panels, tmpRoutes;
    // do nothing if the user being set is null or we already have a user
    if (user && !_this.user.peek()) {
      // add routes
      appsMap = makeAppsMap(user.Apps);
      panels = [];
      tmpRoutes = [];
      _this.panelSettings.forEach(function(data) {
        var panelVm;
        // allow everyone or those with the appid
        if (data.appid !== -1 && !appsMap[data.appid]) {
          return;
        }
        //
        data.options.routePart = _this.routePart;
        panelVm = new LazyPanelViewModel(_this.panels, data.path, data.options);
        //
        setTemplate(panelVm, _this.prefix, _this.postfix);
        // add routes to temp array
        data.routes.forEach(function(rdata) {
          rdata.panelVm = panelVm;
          rdata.precedence = rdata.precedence || 999;
          tmpRoutes.push(rdata);
        });
        //
        panels.push(panelVm);
      });
      // sort routes by precedence then add to router
      tmpRoutes.sort(function(a, b) {
        return a.precedence - b.precedence;
      });
      tmpRoutes.forEach(function(rdata) {
        _this.router.addRoute(rdata.panelVm, rdata.name, rdata.path, rdata.defaultRouteData || {});
      });
      //
      _this.panels(panels);
      // set user
      _this.user(user);
      // ensure the router is started
      _this.router.init(_this.user);
      if (destPath) {
        // go to destination path
        _this.router.goToPath(destPath);
      }
    } else {
      // ensure the router is started
      _this.router.init(_this.user);
    }
  };

  function setTemplate(panel, prefix, postfix) {
    panel.viewTmpl = 'tmpl-' + (prefix || '') + panel.id + (postfix || '');
  }

  function makeAppsMap(apps) {
    var map = {};
    if (apps) {
      apps.forEach(function(app) {
        if (app) {
          map[app.toLowerCase()] = true;
        }
      });
    }
    return map;
  }

  return AppViewModel;
});
