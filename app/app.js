define('src/app', [
  'src/core/router',
  'src/panels/vm.panel.login',
  'src/panels/vm.panel.home',
  'src/panels/vm.panel.accounts',
  'src/panels/vm.panel.surveys',
  'src/core/notify'
], function(
  router,
  LoginViewModel,
  HomePanelViewModel,
  AccountsPanelViewModel,
  SurveysPanelViewModel,
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
  ]);
  setTemplate(app.panels, 'viewTmpl', 'panel_');

  app.clickPanel = function(panelVM) {
    if (panelVM.active()) {
      return;
    }
    panelVM.goTo(panelVM.getRouteData(), true);
  };


  //
  // add routes
  //
  router.addAnonRoute(app.login, 'user', ':action', {
    action: 'login',
  });

  //
  router.addRoute(app.panelMap.surveys, 'surveys', ':surveyid/:locale', {
    locale: 'en',
  });
  router.addRoute(app.panelMap.home, 'home', '', {});
  router.addRoute(app.panelMap.accounts, 'accounts', ':masterid/:accountid/:tab', {});

  return app;
});
