define(['ko'], function(ko) {
  "use strict";

  ko.isCommand = function(obj) {
    return obj && typeof(obj.execute) === 'function';
  };
  ko.command = function(execute, canExecute) {
    var _cmd = ko.observable(),
      can;

    _cmd.isExecuting = ko.observable();

    function onComplete() {
      _cmd.isExecuting(false);
    }
    _cmd.execute = function() {
      if (!can) {
        return;
      }
      _cmd.isExecuting(true);
      return execute.call(this, onComplete);
    };

    if (canExecute) {
      _cmd.canExecute = ko.computed(function() {
        can = canExecute(_cmd.isExecuting());
        return can;
      });
    } else {
      _cmd.canExecute = ko.computed(function() {
        can = !_cmd.isExecuting();
        return can;
      });
    }

    return _cmd;
  };
});
