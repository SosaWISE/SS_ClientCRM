window.onerror = function(message, url, line, column, err) {
  "use strict";
  var text = [];
  text.push('Line ' + line + ', Column ' + column);
  text.push('Url: ' + url);
  text.push('');
  text.push('Message: ' + message);
  text.push('');
  // err = err;
  text.push('StackTrace: ' + err.stack);
  alert(text.join('\n'));
};

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
  'src/core/dialog.vm',
  'src/core/layers.vm',
  'src/core/notify',
  'src/core/router',
  'src/core/controller.vm',
  'src/core/dataservice.base',
  'src/core/joiner',
  'src/dataservice',
  'src/app'
], function(
  jquery, ko, // main libs
  p1, p2, p3, //plugins

  jsonhelpers,
  config,
  resources,
  DialogViewModel,
  LayersViewModel,
  notify,
  router,
  ControllerViewModel,
  DataserviceBase,
  joiner,
  dataservice,
  app
) {
  "use strict";
  console.log("Bootstrapping version: ", config.version);
  console.log("Application Token: " + config.token);
  console.log("CORS Domain: " + config.serviceDomain);

  ControllerViewModel.titlePrefix = config.titlePrefix;
  ControllerViewModel.titlePostfix = config.titlePostfix;
  notify.init(LayersViewModel, DialogViewModel, resources);
  // overwrite jquery's parseJSON
  jquery.parseJSON = jsonhelpers.parse;
  // set timeouts
  DataserviceBase.prototype.timeout = config.apiTimeout;
  joiner.Joiner.prototype.timeout = config.joinerTimeout;

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
