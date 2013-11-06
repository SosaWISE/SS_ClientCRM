define('src/app', [
  'src/core/router',
  'src/vm.panel.login',
  'src/vm.panel.home',
  'src/vm.panel.accounts',
  'src/survey/vm.panel.surveys',
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

  var app = {};

  app.notify = notify;

  app.login = new LoginViewModel({
    id: 'login',
    name: 'Secure Login',
    ico: null,
  });
  setTemplate([app.login], 'viewTmpl', 'panel_');

  app.panelMap = createMap(app.panels = [
    new HomePanelViewModel({
      id: 'home',
      name: 'Home',
      ico: '&#8962;',
    }),
    new AccountsPanelViewModel({
      id: 'accounts',
      name: 'Accounts',
      ico: '&#128101;',
    }),
    new SurveysPanelViewModel({
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
    panelVM.goToRoute(panelVM.lastRouteData || {
      route: panelVM.id,
    });
  };


  //
  // add routes
  //
  router.addAnonRoute(app.login, 'user', ':action', {
    action: 'login',
  });

  //
  router.addRoute(app.panelMap.surveys, 'surveys', ':surveyid', {});
  router.addRoute(app.panelMap.home, 'home', '', {});
  router.addRoute(app.panelMap.accounts, 'accounts', ':id/:action', {});

  return app;
});
