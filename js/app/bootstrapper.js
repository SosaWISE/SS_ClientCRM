define(['../loadDependencies'], function() {
  "use strict";

  require([
    'jquery',
    'config',
    'router/router',
    'dataservice',
    'ko',
    'app',
    '../../js-mocks/index'
  ], function(
    $,
    config,
    router,
    dataservice,
    ko,
    app,
    mock
  ) {
    console.log("Bootstrapping version: ", config.version);
    console.log("Application Token: " + config.token);
    console.log("CORS Domain: " + config.serviceDomain);

    mock({
      timeout: 1000 * 2,
    });

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
