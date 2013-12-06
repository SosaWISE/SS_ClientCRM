define('src/core/notify', [
  'ko',
  'src/resources',
  'src/core/strings'
], function(
  ko,
  resources,
  strings
) {
  "use strict";

  //
  // Notification
  //

  function Notification(type, message, timeoutSec, actionsObj, onRemove) {
    var _this = this,
      interval,
      seconds;

    _this.type = type;
    _this.message = message;
    _this.actions = [];
    _this.seconds = seconds = ko.observable(0);
    if (timeoutSec > 0) {
      // set seconds
      seconds(Math.max(_this.minTimeout, timeoutSec));
    }

    function dismiss() {
      _this.pause();
      onRemove();
    }
    if (actionsObj) {
      // add actions
      Object.keys(actionsObj).forEach(function(key) {
        _this.actions.push({
          name: key,
          action: function() {
            actionsObj[key]();
            dismiss();
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
      clearInterval(interval);
      interval = null;
      if (seconds() > 0 && seconds() <= _this.minTimeout) {
        seconds(_this.minTimeout + 1);
      }
    };
    _this.resume = function() {
      if (interval || seconds() <= 0) {
        return;
      }
      interval = setInterval(function() {
        // decrement seconds remaining
        var s = seconds() - 1;
        seconds(s);
        if (s <= 0) {
          // remove from list
          onRemove();
        }
      }, 1000);
    };

    // try to start the timeout
    _this.resume();
  }
  Notification.prototype.minTimeout = 5;



  //
  // Notifier
  //

  function Notifier() {
    this.list = ko.observableArray();
    this.addAtTop = true;
  }
  Notifier.prototype.create = function() {
    return new Notifier();
  };

  Notifier.prototype.notify = function(type, message, timeoutSec, actionsObj) {
    var list = this.list,
      notification;

    notification = new Notification(type, message, timeoutSec, actionsObj, function() {
      list.remove(notification);
    });

    if (this.addAtTop) {
      // add at top
      list.unshift(notification);
    } else {
      // add at bottom
      list.push(notification);
    }
  };


  Notifier.prototype.send = function(type, resKey, messageArgs, timeoutSec, actionsObj) {
    // lookup resource by key and replace {n} with messageArgs
    var msg = strings.aformat(resources[resKey] || ('invalid resource key `' + resKey + '`'), messageArgs || []);
    this.notify(type, msg, timeoutSec, actionsObj);
  };
  // add helper functions
  ['info', 'ok', 'warn', 'error'].forEach(function(type) {
    Notifier.prototype[type] = function(resKey, messageArgs, timeoutSec, actionsObj) {
      this.send(type, resKey, messageArgs, timeoutSec, actionsObj);
    };
  });

  return new Notifier();
});
