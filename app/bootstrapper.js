define('src/bootstrapper', [
 // load main libs
  'jquery',
  'ko',
 // load plugins
  'src/core/ko.debug.helpers',
  'src/core/ko.command',
  'src/core/ko.bindingHandlers.all',

  'src/core/jsonhelpers',
  'src/config',
  'src/resources',
  'src/core/notify',
  'src/core/router',
  'src/core/controller.vm',
  'src/dataservice',
  'src/app'
], function(
  jquery, ko, // main libs
  p1, p2, p3, //plugins

  jsonhelpers,
  config,
  resources,
  notify,
  router,
  ControllerViewModel,
  dataservice,
  app
) {
  "use strict";
  console.log("Bootstrapping version: ", config.version);
  console.log("Application Token: " + config.token);
  console.log("CORS Domain: " + config.serviceDomain);

  ControllerViewModel.titlePrefix = config.titlePrefix;
  ControllerViewModel.titlePostfix = config.titlePostfix;
  notify.resources = resources;
  // overwrite jquery's parseJSON
  jquery.parseJSON = function(data) {
    JSON.parse(data, jsonhelpers.reviver);
  };

  var deps = [];
  if (config.useMocks) {
    deps = ['mock/index'];
  } else {
    deps = [];
  }
  require(deps, function(mock) {
    if (mock) {
      mock({
        // timeout: 1000 * 2,
        // timeout: 500,
      });
    }

    config.user.subscribe(function(user) {
      if (user) {
        // once there is a user, destroy the login forms (for security purposes)
        delete app.login;
        jquery('#login-container').remove();
        // incase it didn't get moved before the user was set
        jquery('#loginform').remove();
      }
    });

    dataservice.session.start(config.token, function(err, resp) {
      if (err) {
        console.error(err);
      } else {
        // start ko
        ko.applyBindings(app, document.getElementById('main'));
        // if we are authenticated, this will log us in
        config.user(resp.Value.AuthUser);
        // start router
        router.init(config.user);
      }
    });
  });
});
