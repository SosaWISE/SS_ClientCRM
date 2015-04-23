// nickname harold
define("howie", [
  "src/core/harold",
  "src/nimis/config",
  "src/nimis/app",
], function(
  howie,
  config,
  app
) {
  "use strict";

  // initial setup of fetchers
  howie.onFetch("app", function() {
    return app;
  });
  howie.onFetch("config", function() {
    return config;
  });

  return howie;
});

define("setup", [
  // load main libs
  "jquery", "ko",
  // load plugins
  "src/core/ko.debug.helpers",
  "src/core/ko.command",
  "src/core/ko.bindingHandlers.all",
  //
  "src/account/ac-cache",
  //
  "src/nimis/resources",
  "src/nimis/errorcodes",
  //
  "src/core/dialog.vm",
  "src/core/layers.vm",
  "src/core/controller.vm",
  "src/core/dataservice.base",
  "src/core/jsonhelpers",
  "src/core/joiner",
  "src/core/notify",
  "howie",
], function(
  jquery, ko, // main libs
  p1, p2, p3, //plugins
  //
  accache,
  //
  resources,
  errorcodes,
  //
  DialogViewModel,
  LayersViewModel,
  ControllerViewModel,
  DataserviceBase,
  jsonhelpers,
  joiner,
  notify,
  howie
) {
  "use strict";

  // add more fetchers
  howie.onFetch("accache", function() {
    return accache;
  });

  var config = howie.fetch("config");

  // set timeouts
  DataserviceBase.timeout = config.apiTimeout;
  joiner.Joiner.prototype.timeout = config.joinerTimeout;

  ControllerViewModel.titlePrefix = config.titlePrefix;
  ControllerViewModel.titlePostfix = config.titlePostfix;
  notify.init(LayersViewModel, DialogViewModel, resources, errorcodes);
  // overwrite jquery's JSON parsing
  jquery.ajaxSetup({
    converters: {
      "text json": jsonhelpers.parse,
    },
  });

  ControllerViewModel.addManualReloadListener();
});

//
define("src/nimis/bootstrapper", [
  "setup",
  "jquery", "ko",
  "src/nimis/apilogger",
  "src/dataservice",
  "src/core/notify",
  "src/core/authorize",
  "src/core/sessionstore",
  "src/core/utils",
  "howie",
], function(
  setup,
  jquery, ko,
  apilogger,
  dataservice,
  notify,
  authorize,
  sessionstore,
  utils,
  howie
) {
  "use strict";

  var config = howie.fetch("config");
  var app = howie.fetch("app");

  console.log("Version: ", config.version);
  console.log("CORS Domain: " + config.serviceDomain);
  console.log("Log Errors: " + config.logErrors);
  console.log("OS: " + app.os);

  // user authorization
  (function() {
    function login(destPath, data, cb) {
      dataservice.user.auth(data, utils.safeCallback(cb, function(err, resp) {
        if (err) {
          console.error(err);
          return notify.error(err, 10);
        }
        var authResult = resp.Value;
        // store session id
        sessionstore.setItem("token", authResult.Token);
        // set user and go to desired destination
        app.setUser(authResult.User, destPath);
      }));
    }
    app.onLogin = authorize.onLogin = login;
    //
    function logout(cb) {
      // logout without caring about response
      dataservice.user.logout(cb);
      // let the request start
      window.setTimeout(function() {
        // remove session id (effectively logging the user out)
        sessionstore.setItem("token", null);
        // call callback
        cb();
      }, 100);
    }
    app.onLogout = authorize.onLogout = logout;
    //
    function actionRequest(data, setter, cb) {
      dataservice.api_ac.actionRequests.save({
        data: data,
      }, setter, cb);
    }
    authorize.onActionRequest = actionRequest;
  })();

  // init app
  app.init();
  // start ko (since notify can"t show anything without it)
  ko.applyBindings(app, document.getElementById("main"));
  // overwrite onerror function set in index.js
  window.onerror = function(msg, url, line, column, ex) {
    // overwrite message with message and stack trace
    msg = ex.stack;
    // append line and column (same as first line of stack trace)
    url += ":" + line + ":" + column;
    // save error
    apilogger.error({
      Header: ex.handledErr ? "Handled exception" : "Unhandled exception",
      Message: msg,
      Version: config.version,
      // ComputerName: "",
      SourceView: url,
    });
    // show error
    var err = ex.handledErr || {
      ex: ex,
      Code: -20,
      Message: msg,
      Url: url,
    };
    ex.handledErr = err;
    notify.error(err);
  };

  var deps = (config.useMocks) ? ["mock/index"] : [];
  require(deps, function(mock) {
    if (mock) {
      mock({
        // timeout: 1000 * 2,
        // timeout: 500,
      }, config);
    }

    app.user.subscribe(function(user) {
      if (user) {
        // once there is a user, destroy the login forms (for security purposes)
        app.login(null);
        jquery("#login-container").remove();
        // incase it didn"t get moved before the user was set
        jquery("#loginform").remove();
      }
    });

    dataservice.session.start("", function(err, resp) {
      if (err) {
        notify.error(err);
      } else {
        // if we are authenticated, this will log us in
        app.setUser(resp.Value);
      }
    });
    //
    dataservice.session.sessionData(function(err, resp) {
      console.log("sessionData:", JSON.stringify(resp, null, "  "));
    });
  });
});
