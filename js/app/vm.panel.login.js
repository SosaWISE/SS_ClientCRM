define('src/vm.panel.login', [
  'src/notify',
  'src/util/strings',
  'ko',
  'src/util/utils',
  'src/vm.controller',
  'src/dataservice',
  'src/router/router',
  'src/config'
], function(
  notify,
  strings,
  ko,
  utils,
  ControllerViewModel,
  dataservice,
  router,
  config
) {
  "use strict";

  function LoginViewModel(options) {
    var _this = this;
    LoginViewModel.super_.call(_this, options);

    _this.signupVM = ko.observable();
    _this.title = ko.observable(_this.name);
    _this.username = ko.observable('');
    _this.password = ko.observable('');
    _this.rememberMe = ko.observable(false);

    // scoped events
    (function() {
      var index = 0,
        list = [
          'I don\'t know it either?',
        ];
      _this.clickForgot = function() {
        if (index > list.length) {
          index = 0;
        }
        alert(list[index]);
        index++;
      };
    })();
    _this.cmdLogin = ko.command(
      function(cb) {
        setTimeout(function() {
          dataservice.Customer.CustomerAuth({
            SessionID: dataservice.Session.sessionID(),
            Username: _this.username(),
            Password: _this.password(),
            RememberMe: _this.rememberMe(),
          }, function(resp) {
            if (resp.Code !== 0) {
              console.error(resp);
              notify.warn('auth-failed', resp.Code, 6);
            } else {
              config.user(resp.Value);
              router.useDestPath();
            }

            cb();
          });
        }, 500); // the login call is too fast for development purposes...

        // must return true so the form will be submitted and the
        // browser will ask the user if the login info should be saved.
        // basically tells knockout to not call event.preventDefault()
        return true;
      }
    );
  }
  utils.inherits(LoginViewModel, ControllerViewModel);


  //
  // members
  //

  LoginViewModel.prototype.onLoad = function(routeData, cb) { // override me
    cb(false);
  };
  LoginViewModel.prototype.onActivate = function(routeData) {
    routeData.action = 'login';
    this.setTitle(this.title());
  };

  return LoginViewModel;
});
