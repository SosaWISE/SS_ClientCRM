// create howie
define("howie", [
  "src/core/harold",
  //
  "src/nimis/app",
  "src/nimis/config",
], function(
  harold,
  app,
  config
) {
  "use strict";

  harold.onFetch("app", function() {
    return app;
  });
  harold.onFetch("config", function() {
    return config;
  });

  return harold;
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
  "src/nimis/apilogger",
  "src/nimis/resources", "src/nimis/errorcodes",
  "howie",
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
  apilogger,
  resources, errorcodes,
  howie
) {
  "use strict";

  var config = howie.fetch("config");
  var app = howie.fetch("app");

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
