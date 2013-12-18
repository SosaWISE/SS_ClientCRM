define('src/knockout/ko.command', [
  'ko'
], function(ko) {
  "use strict";

  ko.isCommand = function(obj) {
    return obj && typeof(obj.execute) === 'function';
  };
  ko.command = function(execute, canExecute) {
    var _cmd = ko.observable(),
      can;

    _cmd.busy = ko.observable();

    function onComplete() {
      _cmd.busy(false);
    }
    _cmd.execute = function(cb) {
      if (!can) {
        if (typeof(cb) === 'function') {
          cb();
        }
        return;
      }
      _cmd.busy(true);
      return execute.call(this, function() {
        onComplete();
        if (typeof(cb) === 'function') {
          cb.apply(null, ko.utils.makeArray(arguments));
        }
      });
    };

    if (canExecute) {
      _cmd.canExecute = ko.computed(function() {
        can = canExecute(_cmd.busy());
        return can;
      });
    } else {
      _cmd.canExecute = ko.computed(function() {
        can = !_cmd.busy();
        return can;
      });
    }

    return _cmd;
  };
});
