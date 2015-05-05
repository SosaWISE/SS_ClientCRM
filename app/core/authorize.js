define("src/core/authorize", [
  "src/core/override.vm",
  "src/core/login.vm",
  "src/core/storage",
  "src/core/harold",
  "src/core/bigticker",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
], function(
  OverrideViewModel,
  LoginViewModel,
  storage,
  harold,
  bigticker,
  strings,
  notify,
  utils
) {
  "use strict";

  function Authorize() {
    var _this = this;
    _this._out = null;
    _this._bypass = false;
    _this._overrideVm = null;
  }
  Authorize.prototype.onLogin = utils.noop;
  Authorize.prototype.onLogout = utils.noop;
  Authorize.prototype.onActionRequest = utils.noop;

  Authorize.prototype.create = function() {
    return new Authorize();
  };

  Authorize.prototype.execute = function(ctx, execute) {
    var _this = this;
    if (!_this._bypass && _this._out) {
      addNoAuth(_this, ctx, execute, false);
    } else if (utils.isFunc(execute)) {
      execute(ctx);
    } else {
      console.log("execute is not a function");
    }
  };
  Authorize.prototype.handleResponse = function(resp, p2, p3, ctx, onComplete, retryExecute) {
    var _this = this;

    if (resp && resp.Code === 401) {
      var val = resp.Value;
      if (!_this._out && val && (val.ApplicationId || val.ActionId)) {
        // not authorized for action
        showActionRequest(_this, retryExecute, ctx, val, function() {
          if (utils.isFunc(onComplete)) {
            onComplete(resp, p2, p3, ctx);
          } else {
            console.log("onComplete is not a function");
          }
        });
      } else {
        // logged out
        // remove invalid auth
        storage.setItem("auth", null);
        ensureLoginShowing(_this);
        //
        addNoAuth(_this, ctx, retryExecute, true);
      }
    } else if (utils.isFunc(onComplete)) {
      onComplete(resp, p2, p3, ctx);
    } else {
      console.log("onComplete is not a function");
    }
  };

  Authorize.prototype.init = function() {
    var _this = this;
    _this.onAuthChanged = function() {
      var auth = storage.getItem("auth");
      if (!auth) {
        // logged out
        ensureLoginShowing(_this);
      } else {
        // logged in
        var user = harold.fetch("user");
        if (user && user.Username !== auth.User.Username) {
          showWrongUser(_this, user.Username, auth.User.Username);
        } else {
          if (_this._wrongVm) {
            _this._wrongVm.forceClose();
          }
          ensureLoginClosed(_this);
        }
      }
    };
    storage.on("auth", _this.onAuthChanged);
  };
  Authorize.prototype.dispose = function() {
    var _this = this;
    storage.off("auth", _this.onAuthChanged);
  };

  function ensureLoginShowing(_this) {
    if (_this._out) {
      return;
    }
    bigticker.pause();
    //
    _this._out = {
      noauths: [],
      vm: null,
    };
    //
    var user = harold.fetch("user");
    _this._out.vm = new LoginViewModel({
      hideClose: true,
      title: "Re-Authentication Requried",
      username: user ? user.Username : "",
      onLogin: function(destPath, data, cb) {
        try {
          _this._bypass = true;
          _this.onLogin(destPath, data, cb);
        } finally {
          _this._bypass = false;
        }
      },
    });
    //
    harold.fetch("app").layersVm.show(_this._out.vm, function() {
      //
    });
  }

  function ensureLoginClosed(_this) {
    if (!_this._out) {
      return;
    }
    //
    bigticker.restart();
    //
    var out = _this._out;
    _this._out = null;
    // close login dialog
    out.vm.forceClose();
    // re-execute
    out.noauths.forEach(function(obj) {
      obj.execute(obj.ctx);
    });
  }

  function addNoAuth(_this, ctx, execute, isRetry) {
    if (!_this._out) {
      console.warn("failed to add noauth. executing immediately", ctx);
      _this.execute(ctx, execute);
      return;
    }
    _this._out.noauths.push({
      retry: isRetry,
      execute: execute,
      ctx: ctx,
    });
  }

  function showActionRequest(_this, execute, ctx, authNeeds, cancelRequest) {
    if (_this._out) {
      addNoAuth(_this, ctx, execute, true);
      return;
    }
    var app = harold.fetch("app");
    _this._overrideVm = new OverrideViewModel({
      title: "Request Action Override",
      requestUrl: ctx.requestUrl,
      authNeeds: authNeeds,
      onActionRequest: _this.onActionRequest,
    });
    bigticker.pause();
    app.layersVm.show(_this._overrideVm, function(token) {
      _this._overrideVm = null;
      if (token) {
        bigticker.restart();
        // set token to use on request
        ctx.token = token;
        // make request
        execute(ctx);
      } else if (_this._out) {
        // force closed
        // try to re-execute
        _this.execute(ctx, execute);
      } else {
        // do nothing, the user cancelled
        cancelRequest();
      }
    });
  }

  function showWrongUser(_this, username, newusername) {
    bigticker.pause();
    if (_this._wrongVm) {
      return;
    }
    var msg = strings.format("The logged in user has changed from {0} to {1}. The page will reload now.", username, newusername);
    _this._wrongVm = notify.alert("Logged in user change!", msg, function(result) {
      _this._wrongVm = null;
      if (result === "ok") {
        window.location.reload();
      } else { // if (_this._out) {
        // force closed
        //
      }
    }, harold.fetch("app").layersVm, {
      hideClose: true,
    });
  }

  return (function() {
    var authorize = new Authorize();
    authorize.init();
    return authorize;
  })();
});
