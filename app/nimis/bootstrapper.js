// conventional paths
define("src/app", ["src/nimis/app"], function(app) { // alias actual app
  "use strict";
  return app;
});
define("src/config", ["src/nimis/config"], function(config) { // alias actual config
  "use strict";
  return config;
});

//
define("src/nimis/bootstrapper", [
  // load main libs
  "jquery",
  "ko",
  // load plugins
  "src/core/ko.debug.helpers",
  "src/core/ko.command",
  "src/core/ko.bindingHandlers.all",

  "src/core/jsonhelpers",
  "src/core/dialog.vm",
  "src/core/layers.vm",
  "src/core/notify",
  "src/core/controller.vm",
  "src/core/dataservice.base",
  "src/core/joiner",
  "src/dataservice",
  "src/nimis/ping",
  "src/nimis/apilogger",
  "src/nimis/config", "src/nimis/resources", "src/nimis/errorcodes",
  "src/nimis/app",
], function(
  jquery, ko, // main libs
  p1, p2, p3, //plugins

  jsonhelpers,
  DialogViewModel,
  LayersViewModel,
  notify,
  ControllerViewModel,
  DataserviceBase,
  joiner,
  dataservice,
  ping,
  apilogger,
  config, resources, errorcodes,
  app
) {
  "use strict";

  console.log("Version: ", config.version);
  console.log("CORS Domain: " + config.serviceDomain);
  console.log("Log Errors: " + config.logErrors);
  console.log("OS: " + app.os);

  ControllerViewModel.titlePrefix = config.titlePrefix;
  ControllerViewModel.titlePostfix = config.titlePostfix;
  notify.init(LayersViewModel, DialogViewModel, resources, errorcodes);
  // overwrite jquery's JSON parsing
  jquery.ajaxSetup({
    converters: {
      "text json": jsonhelpers.parse,
    },
  });
  // set timeouts
  DataserviceBase.prototype.timeout = config.apiTimeout;
  joiner.Joiner.prototype.timeout = config.joinerTimeout;

  // start ko (since notify can"t show anything without it)
  ko.applyBindings(app, document.getElementById("main"));

  // overwrite onerror function set in index.js
  window.onerror = function(msg, url, line, column, err) {
    // overwrite message with message and stack trace
    msg = err.stack;
    // append line and column (same as first line of stack trace)
    url += ":" + line + ":" + column;
    // save error
    apilogger.error({
      Header: "Unhandled exception",
      Message: msg,
      Version: config.version,
      // ComputerName: "",
      SourceView: url,
    });
    // show error
    notify.error({
      Code: -2,
      Message: msg,
      Url: url,
    }, 0);
  };

  var deps = [];
  if (config.useMocks) {
    deps = ["mock/index"];
  } else {
    deps = [];
  }
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
        // start pinging to keep session alive
        ping.start("ping");
      } else {
        ping.stop();
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

  ControllerViewModel.addManualReloadListener();
});
