define('src/core/notify', [
  // 'src/core/strings',
  'ko',
], function(
  // strings,
  ko
) {
  "use strict";

  var titleMap = {
    'error': 'Error',
    'warn': 'Warn',
    'info': 'Info',
    'success': 'Success',
  };

  //
  // UiMessage
  //

  function UiMessage(type, title, message, timeoutSec, actionsObj, usePre, onRemove) {
    var _this = this,
      intervalId,
      dismissed = false,
      seconds;

    _this.resources = {};
    _this.type = type;
    _this.title = title;
    _this.message = message;
    _this.actions = [];
    _this.seconds = seconds = ko.observable(0);
    if (timeoutSec > 0) {
      // set seconds
      seconds(Math.max(_this.minTimeout, timeoutSec));
    }
    _this.usePre = usePre;

    function dismiss() {
      _this.pause();
      // onRemove();
      seconds(0.5);
      dismissed = true;
      // try to start the timeout
      _this.resume();
    }
    if (actionsObj) {
      // add actions
      Object.keys(actionsObj).forEach(function(key) {
        _this.actions.push({
          name: key,
          action: function() {
            if (!actionsObj[key]()) {
              dismiss();
            }
          },
        });
      });
    }
    _this.actions.push({
      name: 'dismiss',
      action: dismiss,
    });


    //
    // events
    //
    _this.dismiss = dismiss;
    _this.pause = function() {
      if (dismissed) {
        return false;
      }

      clearInterval(intervalId);
      intervalId = null;
      if (seconds() > 0 && seconds() <= _this.minTimeout) {
        seconds(_this.minTimeout + 1);
      }
      return true;
    };
    _this.resume = function() {
      var s = seconds();
      if (intervalId || s <= 0) {
        return;
      }
      intervalId = setInterval(function() {
        // decrement seconds remaining
        var s = seconds() - 1;
        seconds(s);
        if (s <= 0) {
          // remove from list
          onRemove();
        }
      }, s < 1 ? (s * 1000) : 1000);
    };

    // try to start the timeout
    _this.resume();
  }
  UiMessage.prototype.minTimeout = 5;
  UiMessage.prototype.title = 'This is a title';



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
  }
  Notifier.prototype.init = function(LayersViewModel, DialogViewModel, resources) {
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
  };
  Notifier.prototype.create = function() {
    return new Notifier();
  };

  Notifier.prototype.notify = function(type, title, message, timeoutSec, actionsObj, usePre) {
    var _this = this,
      list = _this.list,
      notification;

    notification = new UiMessage(type, title || titleMap[type], message, timeoutSec, actionsObj, usePre, function() {
      list.remove(notification);
    });

    if (_this.atTop()) {
      // at top - add to end
      list.push(notification);
    } else {
      // at bottom - add to start
      list.unshift(notification);
    }
  };


  //@REVIEW this needs to be rethought
  // Notifier.prototype.send = function(type, resKey, messageArgs, timeoutSec, actionsObj) {
  //   // lookup resource by key and replace {n} with messageArgs
  //   var msg = strings.aformat(this.resources[resKey] || ('invalid resource key `' + resKey + '`'), messageArgs || []);
  //   this.notify(type, msg, timeoutSec, actionsObj);
  // };
  // // add helper functions
  // ['info', 'ok', 'warn', 'error'].forEach(function(type) {
  //   Notifier.prototype[type] = function(resKey, messageArgs, timeoutSec, actionsObj) {
  //     this.send(type, resKey, messageArgs, timeoutSec, actionsObj);
  //   };
  // });


  Notifier.prototype.alert = function(title, msg, cb, layersVm) {
    var _this = this;
    show(_this, title, msg, cb, layersVm, ['ok']);
  };
  Notifier.prototype.confirm = function(title, msg, cb, layersVm) {
    var _this = this;
    show(_this, title, msg, cb, layersVm, ['yes', 'no']);
  };

  function show(_this, title, msg, cb, layersVm, actionNames) {
    var vm = new _this.DialogViewModel({
      title: title || '',
      msg: msg || '',
      actionNames: actionNames,
    });
    (layersVm || _this.layersVm).alert(vm, cb);
  }


  return new Notifier();
});
