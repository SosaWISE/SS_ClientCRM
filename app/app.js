define('src/app', [
  'ko',
  'src/dataservice',
  'src/panels/login.panel.vm',
  'src/core/app.vm',
], function(
  ko,
  dataservice,
  LoginViewModel,
  AppViewModel
) {
  "use strict";

  var app = new AppViewModel({
    doLogout: function(cb) {
      dataservice.user.logout(cb);
    },
    createLogin: function(setUser, routePart) {
      return new LoginViewModel({
        setUser: setUser,
        routePart: routePart,
        id: 'login',
        title: 'Secure Login',
        ico: null,
      });
    },
    pathToPanelOptionsMap: {
      'src/panels/home.panel.vm': {
        id: 'home',
        title: 'Home',
        ico: '&#8962;',
      },
      'src/panels/accounts.panel.vm': {
        id: 'accounts',
        title: 'Accounts',
        ico: '&#128101;',
      },
      'src/panels/surveys.panel.vm': {
        id: 'surveys',
        title: 'Surveys',
        ico: '&#128101;',
      },
      'src/panels/swing.panel.vm': {
        id: 'swing',
        title: 'Swing',
        ico: '&#128101;',
      },
      'src/panels/inventory.panel.vm': {
        id: 'inventory',
        title: 'Inventory',
        ico: '&#128101;',
      },
      'src/panels/scheduling.panel.vm': {
        id: 'scheduling',
        title: 'Scheduling',
        ico: '&#128101;',
      },
    },
    addRoutes: function(router, loginVm, idTpPanelsMap) {
      //
      // add anonymous routes
      //
      router.addAnonRoute(loginVm, 'user', ':action', {
        action: 'login',
      });
      //
      // add routes
      //
      router.addRoute(idTpPanelsMap.accounts, 'accounts', ':masterid/:id/:tab/:p1', {});
      router.addRoute(idTpPanelsMap.accounts, 'leads', ':id/:tab/:p1', {});
      router.addRoute(idTpPanelsMap.home, 'home', '', {});
      router.addRoute(idTpPanelsMap.surveys, 'surveys', ':surveytypeid/:surveyid/:locale', {
        locale: 'en',
      });
      router.addRoute(idTpPanelsMap.swing, 'swing', '', {});
      router.addRoute(idTpPanelsMap.inventory, 'inventory', ':tab', {});
      router.addRoute(idTpPanelsMap.scheduling, 'scheduling', ':tab', {});
    },
  });

  return app;
});
