define('src/bootstrapper', [
 // load main libs
  'jquery',
  'ko',
 // load plugins
  'src/knockout/ko.debug.helpers',
  'src/knockout/ko.command',
  'src/knockout/ko.bindingHandlers.all',

  'src/config',
  'src/core/router',
  'src/dataservice',
  'src/app'
], function(
  $, ko, // main libs
  p1, p2, p3, //plugins

  config,
  router,
  dataservice,
  app
) {
  "use strict";
  console.log("Bootstrapping version: ", config.version);
  console.log("Application Token: " + config.token);
  console.log("CORS Domain: " + config.serviceDomain);

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
      });
    }

    config.user.subscribe(function(user) {
      if (user) {
        // once there is a user, destroy the login forms (for security purposes)
        delete app.login;
        $('#login-container').remove();
        // incase it didn't get moved before the user was set
        $('#loginform').remove();
      }
    });

    // dataservice.Session.SessionStart(config.token, function(data) {
    //   if (data.Code !== 0) {
    //     console.error(data);
    //   } else {

    // start ko
    ko.applyBindings(app, document.getElementById('main'));
    // // if we are authenticated, this will log us in
    // config.user(data.Value.AuthCustomer);
    // use a dummy user for now
    config.user({});
    // start router
    router.init();

    //   }
    // });
  });
});
