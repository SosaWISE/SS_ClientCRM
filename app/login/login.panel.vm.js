define("src/login/login.panel.vm", [
  "src/core/notify",
  "src/core/utils",
  "src/core/login.vm",
  "src/core/controller.vm",
], function(
  notify,
  utils,
  LoginViewModel,
  ControllerViewModel
) {
  "use strict";

  function LoginPanelViewModel(options) {
    var _this = this;
    LoginPanelViewModel.super_.call(_this, options);

    _this.vm = new LoginViewModel({
      title: options.title,
      onLogin: options.onLogin,
      getDestPath: function() {
        return _this.getRouteData().destPath || "/";
      },
    });

    //
    // events
    //
    // _this.clickForgot = function() {
    //   notify.warn("Not implemented...", null, 10);
    // };
  }
  utils.inherits(LoginPanelViewModel, ControllerViewModel);

  LoginPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    join = join;
  };
  LoginPanelViewModel.prototype.onActivate = function(routeCtx) {
    var _this = this,
      destPath = routeCtx.extraData.destPath;
    routeCtx.routeData.type = "user";
    // set destination path if it doesn't match an anonymous route
    if (!_this.getRouter().anonRouteFromPath(destPath)) {
      routeCtx.routeData.destPath = destPath;
    }
  };

  return LoginPanelViewModel;
});
