define("src/core/login.vm", [
  "ko",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ko,
  utils,
  BaseViewModel
) {
  "use strict";

  function LoginViewModel(options) {
    var _this = this;
    LoginViewModel.super_.call(_this, options);
    utils.assertPropFuncs(_this, [
      "onLogin",
    ]);

    _this.title = ko.observable(_this.title);
    _this.usernameDisabled = !!_this.username;
    _this.username = ko.observable(_this.username);
    _this.password = ko.observable("");
    _this.rememberMe = ko.observable(false);

    if (_this.usernameDisabled) {
      _this.focus1 = false;
      _this.initActiveFocus("focus2");
    } else {
      _this.initActiveFocus("focus1");
      _this.focus2 = false;
    }

    //
    // events
    //
    _this.cmdLogin = ko.command(function(cb) {
      // window.setTimeout(function() {
      _this.onLogin(_this.getDestPath(), {
        Username: _this.username(),
        Password: _this.password(),
        RememberMe: _this.rememberMe(),
      }, utils.safeCallback(cb, function(err) {
        if (!err) {
          _this.layerResult = true;
          closeLayer(_this);
        }
      }));
      // }, 500); // the login call is too fast for development purposes...

      // must return true so the form will be submitted and the
      // browser will ask the user if the login info should be saved.
      // basically tells knockout to not call event.preventDefault()
      return true;
    });
  }
  utils.inherits(LoginViewModel, BaseViewModel);
  LoginViewModel.prototype.viewTmpl = "tmpl-core-login";
  LoginViewModel.prototype.width = 400;
  LoginViewModel.prototype.height = "auto";
  LoginViewModel.prototype.hideClose = false;
  LoginViewModel.prototype.getDestPath = utils.noop;

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  LoginViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  LoginViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this;
    var msg;
    if (_this.cmdLogin.busy.peek() && !_this.layerResult) {
      msg = "Please wait for login to finish.";
    }
    return msg;
  };
  LoginViewModel.prototype.canClose = function() { // overrides base
    var _this = this;
    if (_this.layerResult) {
      return true;
    }
    return !_this.hideClose;
  };
  LoginViewModel.prototype.forceClose = function() {
    var _this = this;
    var tmp = _this.closeMsg;
    _this.closeMsg = utils.noop;
    _this.layerResult = null;
    _this.hideClose = false;
    closeLayer(_this);
    _this.closeMsg = tmp;
  };

  return LoginViewModel;
});
