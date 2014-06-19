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
  'src/errorcodes',
  'src/core/dialog.vm',
  'src/core/layers.vm',
  'src/core/strings',
  'src/core/notify',
  'src/core/router',
  'src/core/controller.vm',
  'src/core/dataservice.base',
  'src/core/joiner',
  'src/dataservice',
  'src/ping',
  'src/apilogger',
  'src/app'
], function(
  jquery, ko, // main libs
  p1, p2, p3, //plugins

  jsonhelpers,
  config,
  resources,
  errorcodes,
  DialogViewModel,
  LayersViewModel,
  strings,
  notify,
  router,
  ControllerViewModel,
  DataserviceBase,
  joiner,
  dataservice,
  ping,
  apilogger,
  app
) {
  "use strict";

  // ////////////////////////TESTING////////////////////////////////////////////////
  // throw new Error('test error');
  // ////////////////////////TESTING////////////////////////////////////////////////

  // overwrite onerror function set in index.js
  window.onerror = function(msg, url, line, column, err) {
    // overwrite message with message and stack trace
    msg = err.stack;
    // append line and column (same as first line of stack trace)
    url += ':' + line + ':' + column;
    // save error
    apilogger.error({
      Header: 'Unhandled exception',
      Message: msg,
      Version: config.version,
      // ComputerName: '',
      SourceView: url,
    });
    // show error
    notify.error({
      Code: -2,
      Message: msg,
      Url: url,
    });

    // ////////////////////////TESTING////////////////////////////////////////////////
    // notify.info('Info', msg, 0, {
    //   actions: {
    //     'alert1 and dismiss': function() {
    //       alert('alert1 and dismiss!');
    //     },
    //     'alert2': function() {
    //       alert('alert2!');
    //       return true;
    //     },
    //     'alert3': function() {
    //       alert('alert3!');
    //       return true;
    //     },
    //   },
    //   noPre: false,
    // });
    // notify.info('Info', msg, 0, {
    //   actions: {
    //     'alert1': function() {
    //       alert('alert1!');
    //       return true;
    //     },
    //     'alert2': function() {
    //       alert('alert2!');
    //       return true;
    //     },
    //     'alert3': function() {
    //       alert('alert3!');
    //       return true;
    //     },
    //   },
    //   noPre: true,
    // });
    // notify.info('Info', 'Line 132, Column 13 Url: http://dev-crm.nexsense.com:1024/app/bootstrapper.js', 0, {
    //   actions: {
    //     'alert1': function() {
    //       alert('alert1!');
    //       return true;
    //     },
    //     'alert2': function() {
    //       alert('alert2!');
    //       return true;
    //     },
    //     'alert3': function() {
    //       alert('alert3!');
    //       return true;
    //     },
    //   },
    //   noPre: true,
    // });
    // notify.info('Info', 'crm.nexsense.com:1024/app/bootstrapper.js');
    // notify.warn('Warn', 'crm.nexsense.com:1024/app/bootstrapper.js');
    // notify.error({
    //   Code: -1,
    //   Message: 'crm.nexsense.com:1024/app/bootstrapper.js',
    // });
    // ////////////////////////TESTING////////////////////////////////////////////////
  };
  // ////////////////////////TESTING////////////////////////////////////////////////
  // setTimeout(function() {
  //   function a() {
  //     throw new Error('test error');
  //   }
  //   //
  //   function b() {
  //     a();
  //   }
  //   //
  //   function c() {
  //     b();
  //   }
  //   //
  //   function d() {
  //     c();
  //   }
  //   //
  //   function e() {
  //     d();
  //   }
  //   //
  //   function f() {
  //     e();
  //   }
  //   //
  //   f();
  // }, 1000);
  // ////////////////////////TESTING////////////////////////////////////////////////

  console.log("Version: ", config.version);
  console.log("Application Token: " + config.token);
  console.log("CORS Domain: " + config.serviceDomain);
  console.log("Log Errors: " + config.logErrors);

  ControllerViewModel.titlePrefix = config.titlePrefix;
  ControllerViewModel.titlePostfix = config.titlePostfix;
  notify.init(LayersViewModel, DialogViewModel, resources, errorcodes);
  // overwrite jquery's JSON parsing
  jquery.ajaxSetup({
    converters: {
      'text json': jsonhelpers.parse,
    },
  });
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
      }, config);
    }

    config.user.subscribe(function(user) {
      if (user) {
        // once there is a user, destroy the login forms (for security purposes)
        delete app.login;
        jquery('#login-container').remove();
        // incase it didn't get moved before the user was set
        jquery('#loginform').remove();
        // start pinging to keep session alive
        ping.start('ping');
      } else {
        ping.stop();
      }
    });

    dataservice.session.start(config.token, function(err, resp) {
      // start ko (since notify can't show anything without it)
      ko.applyBindings(app, document.getElementById('main'));

      if (err) {
        notify.error(err);
      } else {
        // if we are authenticated, this will log us in
        config.user(resp.Value.AuthUser);
        // start router
        router.init(config.user);
      }
    });
  });

  //
  document.addEventListener("click", function(evt) {
    // shift+ctrl or shift+alt or shift+ctrl+alt should get passed this
    if (!evt.shiftKey || !(evt.ctrlKey || evt.altKey)) {
      return;
    }
    // stop the event from firing
    evt.stopPropagation();

    var vm, el = evt.target;
    // find the first view model that can be reloaded
    while (!vm && el) {
      vm = ko.dataFor(el);
      // only ControllerViewModels can be reloaded
      if (!vm || !ko.isObservable(vm.mayReload) || !(vm instanceof ControllerViewModel)) {
        vm = null;
        // go up one level
        el = el.parentNode;
      }
    }
    if (vm) {
      vm.attemptReload();
    }
  }, true); // useCapture - this event is called before all other clicks
});
