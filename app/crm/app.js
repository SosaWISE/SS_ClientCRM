define('src/crm/app', [
  'ko',
  'src/dataservice',
  'src/login/login.panel.vm',
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
    addAnonRoutes: function(router, loginVm) {
      //
      // add anonymous routes
      //
      router.addAnonRoute(loginVm, 'login', ':type/:destPath/:p1', {
        type: 'user',
      });
    },
    panelSettings: [ //
      {
        appid: -1,
        path: 'src/home/home.panel.vm',
        options: {
          id: 'home',
          title: 'Home',
          ico: '&#8962;',
        },
        routes: [ //
          {
            precedence: 2,
            name: 'home',
            path: '',
          },
        ],
      }, {
        appid: 'sse_cms_cors',
        path: 'src/account/accounts.panel.vm',
        options: {
          id: 'accounts',
          title: 'Accounts',
          ico: '&#128101;',
        },
        routes: [ //
          {
            precedence: 1,
            name: 'accounts',
            path: ':masterid/:id/:tab/:p1',
          }, {
            precedence: 1,
            name: 'leads',
            path: ':masterid/:tab/:p1',
          },
        ],
      }, {
        appid: 'survey_man',
        path: 'src/survey/surveys.panel.vm',
        options: {
          id: 'surveys',
          title: 'Surveys',
          ico: '&#128101;',
        },
        routes: [ //
          {
            precedence: 1,
            name: 'surveys',
            path: ':surveytypeid/:surveyid/:locale',
            defaultRouteData: {
              // locale: 'en',
            },
          },
        ],
      }, {
        appid: 'sse_cms_cors',
        path: 'src/swing/swing.panel.vm',
        options: {
          id: 'swing',
          title: 'Swing',
          ico: '&#128101;',
        },
        routes: [ //
          {
            precedence: 1,
            name: 'swing',
            path: '',
          },
        ],
      }, {
        appid: 'sse_cms_cors',
        path: 'src/inventory/inventory.panel.vm',
        options: {
          id: 'inventory',
          title: 'Inventory',
          ico: '&#128101;',
        },
        routes: [ //
          {
            precedence: 1,
            name: 'inventory',
            path: ':tab',
          },
        ],
      }, {
        appid: 'sse_cms_cors',
        path: 'src/scheduler/scheduler.panel.vm',
        options: {
          id: 'scheduler',
          title: 'Scheduler',
          ico: '&#128101;',
        },
        routes: [ //
          {
            precedence: 1,
            name: 'scheduler',
            path: ':id/:ticketid',
          },
        ],
      }, {
        appid: 'sse_cms_cors',
        path: 'src/scheduling/scheduling.panel.vm',
        options: {
          id: 'scheduling',
          title: 'Scheduling',
          ico: '&#128101;',
        },
        routes: [ //
          {
            precedence: 1,
            name: 'scheduling',
            path: ':id/:ticketid',
          },
        ],
      }, {
        appid: 'hr_man',
        path: 'src/hr/hr.panel.vm',
        options: {
          id: 'hr',
          title: 'HR',
          ico: '&#128101;',
        },
        routes: [ //
          {
            precedence: 1,
            name: 'hr',
            path: ':collection/:id/:p1',
          },
        ],
      },
    ],
  });

  return app;
});
