define('src/app', [
  'src/core/router',
  'src/panels/login.panel.vm',
  'src/panels/home.panel.vm',
  'src/panels/accounts.panel.vm',
  'src/panels/surveys.panel.vm',
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
    if (panelVM === app) {
      panelVM = app.panelMap.home;
    }

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
  router.addRoute(app.panelMap.accounts, 'accounts', ':masterid/:id/:tab/:p1', {});
  router.addRoute(app.panelMap.home, 'home', '', {});
  router.addRoute(app.panelMap.surveys, 'surveys', ':surveytypeid/:surveyid/:locale', {
    locale: 'en',
  });

  window.onerror = function(message, url, line, column, err) {
    var text = [];
    text.push('Line ' + line + ', Column ' + column);
    text.push('Url: ' + url);
    text.push('');
    text.push('Message: ' + message);
    text.push('');
    // err = err;
    text.push('StackTrace: ' + err.stack);
    alert(text.join('\n'));
  };

  return app;
});
