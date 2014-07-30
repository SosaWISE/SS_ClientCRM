define('src/app', [
  'src/core/router',
  'src/scrum/scrum.panel.vm',
  'src/panels/login.panel.vm',
  'src/panels/home.panel.vm',
  'src/panels/accounts.panel.vm',
  'src/panels/surveys.panel.vm',
  'src/panels/swing.panel.vm',
  'src/panels/inventory.panel.vm',
  'src/panels/scheduling.panel.vm',
  'src/core/notify'
], function(
  router,
  ScrumPanelViewModel,
  LoginViewModel,
  HomePanelViewModel,
  AccountsPanelViewModel,
  SurveysPanelViewModel,
  SwingViewModel,
  InventoryViewModel,
  SchedulingViewModel,
  notify
) {
  "use strict";

  function createMap(panels) {
    var map = {};
    panels.forEach(function(panel) {
      map[panel.id] = panel;
    });
    return map;
  }

  function setTemplate(panels, title, prefix, postfix) {
    panels.forEach(function(panel) {
      panel[title] = 'tmpl-' + (prefix || '') + panel.id + (postfix || '');
    });
  }

  var app = {},
    routePart = 'route';

  app.notify = notify;

  app.login = new LoginViewModel({
    routePart: routePart,
    id: 'login',
    title: 'Secure Login',
    ico: null,
  });
  setTemplate([app.login], 'viewTmpl', 'panel_');

  app.panelMap = createMap(app.panels = [
    new HomePanelViewModel({
      routePart: routePart,
      id: 'home',
      title: 'Home',
      ico: '&#8962;',
    }),
    new AccountsPanelViewModel({
      routePart: routePart,
      id: 'accounts',
      title: 'Accounts',
      ico: '&#128101;',
    }),
    new SurveysPanelViewModel({
      routePart: routePart,
      id: 'surveys',
      title: 'Surveys',
      ico: '&#128101;',
    }),
    new SwingViewModel({
      routePart: routePart,
      id: 'swing',
      title: 'Swing',
      ico: '&#128101;',
    }),
    new InventoryViewModel({
      routePart: routePart,
      id: 'inventory',
      title: 'Inventory',
      ico: '&#128101;',
    }),
    new SchedulingViewModel({
      routePart: routePart,
      id: 'scheduling',
      title: 'Scheduling',
      ico: '&#128101;',
    }),
    new ScrumPanelViewModel({
      routePart: routePart,
      id: 'sockets',
      title: 'Sockets',
      ico: '&#9416;',
    }),
  ]);
  setTemplate(app.panels, 'viewTmpl', 'panel_');

  app.clickPanel = function(panelVM) {
    if (panelVM === app) {
      panelVM = app.panelMap.home;
    }

    if (panelVM.active()) {
      return;
    }
    panelVM.goTo(panelVM.getRouteData(), null, true);
  };


  //
  // add routes
  //
  router.addAnonRoute(app.login, 'user', ':action', {
    action: 'login',
  });

  //
  router.addRoute(app.panelMap.accounts, 'accounts', ':masterid/:id/:tab/:p1', {});
  router.addRoute(app.panelMap.accounts, 'leads', ':id/:tab/:p1', {});
  router.addRoute(app.panelMap.home, 'home', '', {});
  router.addRoute(app.panelMap.surveys, 'surveys', ':surveytypeid/:surveyid/:locale', {
    locale: 'en',
  });
  router.addRoute(app.panelMap.sockets, 'sockets', ':projectid', {});

  router.addRoute(app.panelMap.swing, 'swing', '', {});
  router.addRoute(app.panelMap.inventory, 'inventory', ':tab', {});
  router.addRoute(app.panelMap.scheduling, 'scheduling', ':tab', {});

  return app;
});
