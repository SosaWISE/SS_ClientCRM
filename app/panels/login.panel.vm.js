define('src/panels/login.panel.vm', [
  'src/core/notify',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
  'src/dataservice',
], function(
  notify,
  ko,
  utils,
  ControllerViewModel,
  dataservice
) {
  "use strict";

  function LoginViewModel(options) {
    var _this = this;
    LoginViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['setUser']);

    _this.signupVM = ko.observable();
    _this.title = ko.observable(_this.title);
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
        notify.warn(list[index], '', 10);
        index++;
      };
    })();
    _this.cmdLogin = ko.command(function(cb) {
      setTimeout(function() {
        dataservice.user.auth({
          SessionID: dataservice.session.sessionID(),
          Username: _this.username(),
          Password: _this.password(),
          RememberMe: _this.rememberMe(),
        }, function(err, resp) {
          if (err) {
            console.error(err);
            notify.error(err, 10);
          } else {
            _this.setUser(resp.Value, true);
          }

          cb();
        });
      }, 500); // the login call is too fast for development purposes...

      // must return true so the form will be submitted and the
      // browser will ask the user if the login info should be saved.
      // basically tells knockout to not call event.preventDefault()
      return true;
    });
  }
  utils.inherits(LoginViewModel, ControllerViewModel);


  //
  // members
  //

  LoginViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    join = join;
  };
  LoginViewModel.prototype.onActivate = function(routeData) {
    routeData.action = 'login';
  };

  return LoginViewModel;
});
