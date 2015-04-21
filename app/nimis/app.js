define("src/nimis/app", [
  "ko",
  "src/dataservice",
  "src/login/login.panel.vm",
  "src/core/sessionstore",
  "src/core/app.vm",
], function(
  ko,
  dataservice,
  LoginViewModel,
  sessionstore,
  AppViewModel
) {
  "use strict";

  var app = new AppViewModel({
    doLogout: function(cb) {
      // logout without caring about response
      dataservice.user.logout();
      // let the request start
      window.setTimeout(function() {
        // remove session id (effectively logging the user out)
        sessionstore.setItem("token", null);
        // call callback
        cb();
      }, 100);
    },
    createLogin: function(setUser, routePart) {
      return new LoginViewModel({
        setUser: setUser,
        routePart: routePart,
        id: "login",
        title: "Secure Login",
        icoClass: null,
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
        path: "src/home/home.panel.vm",
        options: {
          id: "home",
          title: "Home",
          icoClass: "ico fa fa-3x fa-home",
        },
        routes: [ //
          {
            precedence: 2,
            name: "home",
            path: "",
          },
        ],
      }, {
        appid: "sse_cms_cors",
        path: "src/account/accounts.panel.vm",
        options: {
          id: "crm",
          title: "CRM",
          icoClass: "ico fa fa-3x fa-shield",
        },
        routes: [ //
          {
            precedence: 1,
            name: "accounts",
            path: ":masterid/:id/:tab/:p1",
          }, {
            precedence: 1,
            name: "leads",
            path: ":masterid/:tab/:p1",
          },
        ],
      }, {
        appid: "survey_man",
        path: "src/survey/surveys.panel.vm",
        options: {
          id: "surveys",
          title: "Surveys",
          icoClass: "ico fa fa-3x fa-align-left rotate180",
        },
        routes: [ //
          {
            precedence: 1,
            name: "surveys",
            path: ":surveytypeid/:surveyid/:locale",
            defaultRouteData: {
              // locale: "en",
            },
          },
        ],
      }, {
        appid: "sse_cms_cors",
        path: "src/swing/swing.panel.vm",
        options: {
          id: "swing",
          title: "Swing",
          icoClass: "ico fa fa-3x fa-exchange",
        },
        routes: [ //
          {
            precedence: 1,
            name: "swing",
            path: "",
          },
        ],
      }, {
        appid: "sse_cms_cors",
        path: "src/inventory/inventory.panel.vm",
        options: {
          id: "inventory",
          title: "Inventory",
          icoClass: "ico fa fa-3x fa-barcode",
        },
        routes: [ //
          {
            precedence: 1,
            name: "inventory",
            path: ":tab",
          },
        ],
      }, {
        appid: "sse_cms_cors",
        path: "src/scheduler/scheduler.panel.vm",
        options: {
          id: "scheduler",
          title: "Schedule\nAdmin",
          icoClass: "ico fa fa-3x fa-calendar",
        },
        routes: [ //
          {
            precedence: 1,
            name: "scheduler",
            path: ":tab/:id/:p1",
          },
        ],
      }, {
        appid: "hr_man",
        path: "src/hr/hr.panel.vm",
        options: {
          id: "hr",
          title: "HR",
          icoClass: "ico fa fa-3x fa-users",
        },
        routes: [ //
          {
            precedence: 1,
            name: "hr",
            path: ":collection/:id/:p1",
          },
        ],
      }, {
        appid: "contract_admin",
        path: "src/contracts/contracts.panel.vm",
        options: {
          id: "contracts",
          title: "Contracts",
          icoClass: "ico fa fa-3x fa-gears"
        },
        routes: [ //
          {
            precedence: 1,
            name: "contracts",
            path: ":masterid/:id",
          },
        ],
      }, {
        appid: "funding_admin",
        path: "src/funding/funding.panel.vm",
        options: {
          id: "funding",
          title: "Funding",
          icoClass: "ico fa fa-3x fa-btc"
        },
        routes: [ //
          {
            precedence: 1,
            name: "funding",
            path: ":id",
          },
        ],
      },
    ],
  });

  return app;
});
