define("src/core/notify", [
  "jquery",
  // "src/core/strings",
  "ko",
], function(
  jquery,
  // strings,
  ko
) {
  "use strict";

  ko.bindingHandlers.notice = {
    init: function(element, valueAccessor) {
      var value = valueAccessor(),
        el = jquery(element),
        sub;

      sub = value.seconds.subscribe(function(seconds) {
        if (0 < seconds && seconds <= 3 && !el.hasClass("fade")) {
          if (seconds <= 1) {
            el.addClass("fast");
          }
          el.addClass("fade");
        }
      });
      // dispose of subscription when removed
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        sub.dispose();
      });

      el.mouseover(function() {
        if (value.pause()) {
          el.removeClass("fade");
        }
      });
      el.mouseout(function() {
        value.resume();
      });
      el.click(function() {
        value.stop();
      });
    }
  };

  //
  // Notifier
  //

  function Notifier() {
    var _this = this;
    _this.list = ko.observableArray();
    // _this.addAtTop = true; // when notices appear at bottom
    _this.atTop = ko.observable(false);

    //
    // events
    //
    _this.clickToggle = function() {
      _this.atTop(!_this.atTop());
    };

    //
    // bind functions
    //
    _this.init = _this.init.bind(_this);
    _this.error = _this.error.bind(_this);
    _this.iferror = _this.iferror.bind(_this);
    _this.warn = _this.warn.bind(_this);
    _this.info = _this.info.bind(_this);
    _this.alert = _this.alert.bind(_this);
    _this.confirm = _this.confirm.bind(_this);
  }
  Notifier.prototype.init = function(LayersViewModel, DialogViewModel, resources, errorCodeMap) {
    var _this = this;
    // default layers view model for dialogs
    _this.layersVm = new LayersViewModel({
      controller: {
        getRouteData: function() {
          return {};
        },
      },
    });
    _this.DialogViewModel = DialogViewModel;
    _this.resources = resources;
    _this.errorCodeMap = errorCodeMap;
  };
  Notifier.prototype.create = function() {
    return new Notifier();
  };
  // for displaying errors or warning messages returned from web server
  Notifier.prototype.error = function(err, delay, options) {
    var _this = this;
    if (!err || err._notified) {
      return false;
    }
    err._notified = true;
    notify(_this, (err.Code === 0 ? "info" : "error"), err.Url, err.Code,
      _this.errorCodeMap[err.Code] || "Error (code not recognized)", err.Message, delay, options);
    return true;
  };
  // same as `error` but only uses the first argument.
  // useful when using as a callback
  Notifier.prototype.iferror = function(err) {
    var _this = this;
    return _this.error(err);
  };
  // for displaying validation warnings
  Notifier.prototype.warn = function(title, message, delay, options) {
    notify(this, "warn", null, null, title, message, delay, options);
  };
  // for displaying information
  Notifier.prototype.info = function(title, message, delay, options) {
    notify(this, "info", null, null, title, message, delay, options);
  };

  var titleMap = {
    "error": "Error",
    "warn": "Warn",
    "info": "Info",
    "success": "Success",
  };

  function notify(notifier, type, url, code, title, message, delay, options) {
    var list = notifier.list,
      dismissed = false,
      intervalId, n;

    // default to 10 second delay
    if (delay == null) {
      delay = 10;
    }
    delay = (delay > 0) ? Math.max(1.5, delay) : 0;
    if (delay === 3) {
      // delay of 3 doesn't work correctly. it hides before sliding.
      delay = 3.1;
    }

    // removed unwanted html formatting
    message = (message ? String(message) : "")
      .replace("<li>", "").replace("</li>", "\n");

    n = {
      type: type,
      url: url,
      code: (code != null) ? "(" + code + ")" : code,
      title: title || titleMap[type] || type,
      message: message,
      noPre: options && options.noPre || false,
      onRemove: function() {
        list.remove(n);
      },
      actions: [],
      seconds: ko.observable(delay),
    };

    function dismiss() {
      n.pause();
      n.seconds(0.5);
      dismissed = true;
      // start the timeout
      n.resume();
    }
    if (options && options.actions) {
      // add actions
      Object.keys(options.actions).forEach(function(key) {
        n.actions.push({
          name: key,
          action: function() {
            if (!options.actions[key]()) {
              dismiss();
            }
          },
        });
      });
    }
    n.actions.push({
      name: "dismiss",
      action: dismiss,
    });

    //
    if (delay < 2) {
      delay = 2;
    } else {
      delay = 6;
    }

    //
    // events
    //
    n.dismiss = dismiss;
    n.pause = function() {
      if (dismissed) {
        return false;
      }

      clearInterval(intervalId);
      intervalId = null;
      if (n.seconds() > 0 && n.seconds() < delay) {
        n.seconds(delay);
      }
      return true;
    };
    n.resume = function() {
      var s = n.seconds();
      if (intervalId || s <= 0) {
        return;
      }
      intervalId = setInterval(function() {
        // decrement seconds remaining
        var s = n.seconds() - 1;
        n.seconds(s);
        if (s <= 0) {
          // remove from list
          n.onRemove();
          // make sure the interval stops
          clearInterval(intervalId);
        }
      }, s < 1 ? (s * 1000) : 1000);
    };
    n.stop = function() {
      if (n.pause()) {
        n.seconds(0);
      }
    };

    // try to start the timeout
    n.resume();

    // add to list
    if (notifier.atTop()) {
      // at top - add to end
      list.push(n);
    } else {
      // at bottom - add to start
      list.unshift(n);
    }
  }


  //@REVIEW this needs to be rethought
  // Notifier.prototype.send = function(type, resKey, messageArgs, delay, options) {
  //   // lookup resource by key and replace {n} with messageArgs
  //   var msg = strings.aformat(this.resources[resKey] || ("invalid resource key `" + resKey + "`"), messageArgs || []);
  //   this.notify(type, msg, delay, options);
  // };
  // // add helper functions
  // ["info", "ok", "warn", "error"].forEach(function(type) {
  //   Notifier.prototype[type] = function(resKey, messageArgs, delay, options) {
  //     this.send(type, resKey, messageArgs, delay, options);
  //   };
  // });


  Notifier.prototype.alert = function(title, msg, cb, layersVm) {
    var _this = this;
    show(_this, title, msg, cb, layersVm, ["ok"]);
  };
  Notifier.prototype.confirm = function(title, msg, cb, layersVm) {
    var _this = this;
    show(_this, title, msg, cb, layersVm, ["yes", "no"]);
  };

  function show(_this, title, msg, cb, layersVm, actionNames) {
    var vm = new _this.DialogViewModel({
      title: title || "",
      msg: msg || "",
      actionNames: actionNames,
    });
    (layersVm || _this.layersVm).alert(vm, cb);
  }


  return new Notifier();
});
