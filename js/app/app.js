define([
  'router/router',
  'vm.panel.login',
  'vm.panel.home',
  'vm.panel.accounts',
  'notify'
], function(
  router,
  LoginViewModel,
  HomePanelViewModel,
  AccountsPanelViewModel,
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
  ]);
  setTemplate(app.panels, 'viewTmpl', 'panel_');


  //
  // add routes
  //
  router.addAnonRoute(app.login, 'user', ':action', {
    action: 'login',
  });

  //
  router.addRoute(app.panelMap.accounts, 'accounts', '', {});
  router.addRoute(app.panelMap.home, 'home', '', {});

  return app;
});
