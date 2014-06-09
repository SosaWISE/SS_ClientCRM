define('src/app', [
  'src/core/router',
  'src/panels/login.panel.vm',
  'src/panels/home.panel.vm',
  'src/panels/accounts.panel.vm',
  'src/panels/surveys.panel.vm',
  'src/panels/swing.panel.vm',
  'src/panels/inventory.panel.vm',
  'src/core/notify'
], function(
  router,
  LoginViewModel,
  HomePanelViewModel,
  AccountsPanelViewModel,
  SurveysPanelViewModel,
  SwingViewModel,
  InventoryViewModel,
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

  function setTemplate(panels, name, prefix, postfix) {
    panels.forEach(function(panel) {
      panel[name] = 'tmpl-' + (prefix || '') + panel.id + (postfix || '');
    });
  }

  var app = {},
    routePart = 'route';

  app.notify = notify;

  app.login = new LoginViewModel({
    routePart: routePart,
    id: 'login',
    name: 'Secure Login',
    ico: null,
  });
  setTemplate([app.login], 'viewTmpl', 'panel_');

  app.panelMap = createMap(app.panels = [
    new HomePanelViewModel({
      routePart: routePart,
      id: 'home',
      name: 'Home',
      ico: '&#8962;',
    }),
    new AccountsPanelViewModel({
      routePart: routePart,
      id: 'accounts',
      name: 'Accounts',
      ico: '&#128101;',
    }),
    new SurveysPanelViewModel({
      routePart: routePart,
      id: 'surveys',
      name: 'Surveys',
      ico: '&#128101;',
    }),
    new SwingViewModel({
      routePart: routePart,
      id: 'swing',
      name: 'Swing',
      ico: '&#128101;',
    }),
    new InventoryViewModel({
      routePart: routePart,
      id: 'inventory',
      name: 'Inventory',
      ico: '&#128101;',
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

  router.addRoute(app.panelMap.swing, 'swing', '', {});
  router.addRoute(app.panelMap.inventory, 'inventory', '', {});

  return app;
});
