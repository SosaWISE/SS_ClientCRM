define("src/sales/app", [
  "ko",
  "src/login/login.panel.vm",
  "src/core/app.vm",
  "src/core/utils",
], function(
  ko,
  LoginPanelViewModel,
  AppViewModel,
  utils
) {
  "use strict";

  var app = new AppViewModel({
    onLogin: utils.noop,
    onLogout: utils.noop,
    createLogin: function(routePart) {
      return new LoginPanelViewModel({
        routePart: routePart,
        id: "login",
        title: "Secure Login",
        icoClass: null,
        onLogin: app.onLogin,
      });
    },
    addAnonRoutes: function(router, loginVm) {
      //
      // add anonymous routes
      //
      router.addAnonRoute(loginVm, "login", ":type/:destPath/:p1", {
        type: "user",
      });
    },
    panelSettings: [ //
      {
        appid: -1,
        path: "src/salesmap/map.panel.vm",
        options: {
          id: "map",
          title: "Map",
          icoClass: "ico fa fa-2x fa-map-marker",
        },
        routes: [ //
          {
            precedence: 1,
            name: "map",
            path: ":id/:tab/:p1",
          },
        ],
      }, {
        appid: -1,
        path: "src/salesreports/salesreports.panel.vm",
        options: {
          id: "reports",
          title: "Reports",
          icoClass: "ico fa fa-2x fa-list-alt",
        },
        routes: [ //
          {
            precedence: 1,
            name: "reports",
            path: ":id/:tab/:p1",
          },
        ],
      },
    ],
  });

  return app;
});
