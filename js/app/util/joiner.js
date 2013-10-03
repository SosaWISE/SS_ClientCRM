define([
 './utils',
], function(
  utils
) {
  "use strict";

  function Joiner() {
    this._added = [];
    this._results = [];
    this._callbacks = [];
  }

  Joiner.prototype.add = function() {
    var _this = this,
      added, results, addKey;
    if (_this._waiting) {
      throw new Error('add() cannot be called after when()');
    }
    added = _this._added;
    results = _this._results;
    addKey = added.length;


    // add addKey
    added.push(addKey);

    function onComplete(val) {
      var index = added.indexOf(addKey);
      if (index < 0) {
        // already called
        return;
      }

      if (arguments.length > 1) {
        val = utils.argsToArray(arguments);
      }

      // add result value
      results[addKey] = val;
      // remove addKey
      added.splice(index, 1);
      _this._tryWhen();
    }
    return onComplete;
  };
  Joiner.prototype.when = function(cb) {
    var _this = this;
    _this._waiting = true;
    _this._callbacks.push(cb);
    _this._tryWhen();
  };

  Joiner.prototype._tryWhen = function() {
    var _this = this,
      results;
    if (_this._added.length) {
      return;
    }

    results = _this._results;
    _this._callbacks.forEach(function(cb) {
      cb(results);
    });
  };

  return function() {
    return new Joiner();
  };
});
