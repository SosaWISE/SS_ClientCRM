define("src/login/login.panel.vm", [
  "src/core/notify",
  "ko",
  "src/core/sessionstore",
  "src/core/utils",
  "src/core/controller.vm",
  "src/dataservice",
], function(
  notify,
  ko,
  sessionstore,
  utils,
  ControllerViewModel,
  dataservice
) {
  "use strict";

  function LoginViewModel(options) {
    var _this = this;
    LoginViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ["setUser"]);

    _this.signupVM = ko.observable();
    _this.title = ko.observable(_this.title);
    _this.username = ko.observable("");
    _this.password = ko.observable("");
    _this.rememberMe = ko.observable(false);

    // scoped events
    (function() {
      var index = 0,
        list = [
          "What makes you think I know it?",
        ];
      _this.clickForgot = function() {
        if (index > list.length) {
          index = 0;
        }
        notify.warn(list[index++], "", 10);
      };
    })();
    _this.cmdLogin = ko.command(function(cb) {
      // window.setTimeout(function() {
      dataservice.user.auth({
        Username: _this.username(),
        Password: _this.password(),
        RememberMe: _this.rememberMe(),
      }, function(err, resp) {
        if (err) {
          console.error(err);
          notify.error(err, 10);
        } else {
          var authResult = resp.Value;
          // store session id
          sessionstore.setItem("token", authResult.Token);
          // set user and go to desired destination
          var routeData = _this.getRouteData();
          _this.setUser(authResult.User, routeData.destPath || "/");
        }
        cb();
      });
      // }, 500); // the login call is too fast for development purposes...

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
  LoginViewModel.prototype.onActivate = function(routeCtx) {
    var _this = this,
      destPath = routeCtx.extraData.destPath;
    routeCtx.routeData.type = "user";
    // set destination path if it doesn't match an anonymous route
    if (!_this.getRouter().anonRouteFromPath(destPath)) {
      routeCtx.routeData.destPath = destPath;
    }
  };

  return LoginViewModel;
});
