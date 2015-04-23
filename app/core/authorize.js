define("src/core/authorize", [
  // "ko",
  // "src/core/arrays",
  "src/core/override.vm",
  "src/core/login.vm",
  "src/core/harold",
  "src/core/bigticker",
  "src/core/notify",
  "src/core/utils",
], function(
  // ko,
  // arrays,
  OverrideViewModel,
  LoginViewModel,
  harold,
  bigticker,
  notify,
  utils
) {
  "use strict";

  function Authorize() {
    var _this = this;

    // _this._hasError = false;
    _this._noauths = null;
    _this._bypass = false;
  }
  Authorize.prototype.onLogin = utils.noop;
  Authorize.prototype.onLogout = utils.noop;
  Authorize.prototype.onActionRequest = utils.noop;

  Authorize.prototype.create = function() {
    return new Authorize();
  };

  Authorize.prototype.ensureLogin = function() {
    var _this = this;
    bigticker.pause();
    if (_this._loginVm) {
      return;
    }
    var app = harold.fetch("app");
    var user = app.user.peek();
    var vm = _this._loginVm = new LoginViewModel({
      mustAuthorize: true,
      hideClose: true,
      title: "Re-Authentication Requried",
      username: user ? user.Username : "",
      onLogin: function(destPath, data, cb) {
        _this._bypass = true;
        _this.onLogin(destPath, data, cb);
        _this._bypass = false;
      },
    });
    app.layersVm.show(vm, function() {
      _this._loginVm = null;
    });
  };
  Authorize.prototype.showActionRequest = function(execute, ctx, authNeeds) {
    var _this = this;
    var app = harold.fetch("app");
    var vm = new OverrideViewModel({
      title: "Request Action Override",
      requestUrl: ctx.requestUrl,
      authNeeds: authNeeds,
      onActionRequest: _this.onActionRequest,
    });
    bigticker.pause();
    app.layersVm.show(vm, function(token) {
      bigticker.restart();
      // set token to use on request
      ctx.token = token;
      // make request
      execute(ctx);
    });
  };

  Authorize.prototype.execute = function(ctx, execute) {
    var _this = this;
    if (!_this._bypass && _this._noauths) {
      _this._noauths.push({
        retry: false,
        execute: execute,
        ctx: ctx,
      });
      _this.ensureLogin();
    } else if (utils.isFunc(execute)) {
      execute(ctx);
    } else {
      console.log("execute is not a function");
    }
  };

  Authorize.prototype.handleResponse = function(resp, p2, p3, ctx, onComplete, retryExecute) {
    retryExecute = retryExecute;
    var _this = this;

    if (resp && resp.Code === 401) {
      var val = resp.Value;
      if (!_this._noauths && val && (val.ApplicationId || val.ActionId)) {
        // not authorized for action
        _this.showActionRequest(retryExecute, ctx, val);
      } else {
        // logged out
        (_this._noauths = _this._noauths || []).push({
          retry: true,
          execute: retryExecute,
          ctx: ctx,
        });
        _this.ensureLogin();
      }
    } else {
      if (utils.isFunc(onComplete)) {
        onComplete(resp, p2, p3, ctx);
      } else {
        console.log("onComplete is not a function");
      }

      if (_this._noauths) {
        bigticker.restart();

        var noauths = _this._noauths;
        _this._noauths = null;
        noauths.forEach(function(obj) {
          obj.execute(obj.ctx);
        });
      }
    }
  };

  return new Authorize();
});
