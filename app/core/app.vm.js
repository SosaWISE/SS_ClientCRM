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
  function LazyPanelViewModel(path, panelOptions) {
    var _this = this;
    LazyPanelViewModel.super_.call(_this, panelOptions);

    _this.panel = ko.observable();
    _this.path = path;
    _this.panelOptions = panelOptions;
  }
  utils.inherits(LazyPanelViewModel, ControllerViewModel);
  LazyPanelViewModel.prototype.activate = function(routeCtx) { // overrides base
    var _this = this;
    if (!routeCtx.active()) {
      return;
    }
    // immdediately set as active
    _this.active(true);
    // load actual panel
    _this.load(routeCtx.routeData, routeCtx.extraData, function() {
      //@NOTE: This function can be called multiple times, but `onLoad` will only be once.
      // activate it (if the routeCtx has been disposed, this will do nothing)
      _this.panel().activate(routeCtx);
    });
  };
  LazyPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    if (_this.panel()) {
      // somehow this panel has already been loaded...
      cb();
      return;
    }
    require(_this.path, function(PanelViewModel) {
      if (!PanelViewModel) {
        setTimeout(function() { // show message after depends.js error
          notify.warn('Failed to load ' + _this.title + ' panel code.');
        }, 0);
        return;
      }
      // create
      var panelVm = new PanelViewModel(_this.panelOptions);
      //
      // Replace LazyPanel in the routing chain with the new panel.
      // LazyPanel.activate should never be called again, after this point.
      //
      // copy props
      panelVm.router = _this.router;
      panelVm.routeName = _this.routeName;
      panelVm.routesMap = _this.routesMap;
      panelVm.active = _this.active;
      panelVm.viewTmpl = _this.viewTmpl;
      // set new topController on all routes
      Object.keys(panelVm.routesMap).forEach(function(routeName) {
        panelVm.routesMap[routeName].topController = panelVm;
      });
      // set as panel
      _this.panel(panelVm);
      //
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
      'pathToPanelOptionsMap',
      'addRoutes',
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
        panelVm = _this.panelMap.home;
      }

      if (panelVm.active()) {
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
  }
  AppViewModel.prototype.prefix = '';
  AppViewModel.prototype.postfix = '-panel';
  AppViewModel.prototype.routePart = 'route';
  AppViewModel.prototype.init = function() {
    var _this = this,
      login, panels;

    // create
    login = _this.createLogin(_this.setUser, _this.routePart);
    setTemplate([login], _this.prefix, _this.postfix);
    panels = [];
    Object.keys(_this.pathToPanelOptionsMap).forEach(function(path) {
      var panelOptions = _this.pathToPanelOptionsMap[path];
      panelOptions.routePart = _this.routePart;
      panels.push(new LazyPanelViewModel(path, panelOptions));
    });
    setTemplate(panels, _this.prefix, _this.postfix);

    // add view models
    _this.login(login);
    _this.panels(panels);
    // add routes
    _this.addRoutes(_this.router, login, createMap(panels));
  };
  AppViewModel.prototype.setUser = function(user, useDestPath) {
    var _this = this;
    _this.user(user);
    // start router
    _this.router.init(_this.user);
    if (useDestPath) {
      _this.router.useDestPath();
    }
  };

  function setTemplate(panels, prefix, postfix) {
    panels.forEach(function(panel) {
      panel.viewTmpl = 'tmpl-' + (prefix || '') + panel.id + (postfix || '');
    });
  }

  function createMap(panels) {
    var map = {};
    panels.forEach(function(panel) {
      map[panel.id] = panel;
    });
    return map;
  }

  return AppViewModel;
});
