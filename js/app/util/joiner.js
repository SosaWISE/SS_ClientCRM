define('src/util/joiner', [
 'src/util/utils',
], function(
  utils
) {
  "use strict";

  function Joiner() {
    var _this = this,
      disposed = false;
    _this._count = 0;
    _this._waiting = [];
    _this._results = [];
    _this._callbacks = [];

    _this.dispose = function() {
      disposed = true;
      // remove all
      // effectively ignores all `add` callbacks
      _this._waiting.splice(0);
    };
    _this.isDisposed = function() {
      return disposed;
    };
  }

  function noop() {}
  Joiner.prototype.add = function() {
    var _this = this,
      waiting, results, addKey;
    if (_this.isDisposed()) {
      throw new Error('joiner is disposed');
    }
    if (_this._err) {
      // all further adds are ignored
      return noop;
    }

    waiting = _this._waiting;
    results = _this._results;
    addKey = _this._count++;

    // add addKey
    waiting.push(addKey);

    return function(err, val) {
      var index = waiting.indexOf(addKey);
      if (index < 0) {
        // already called
        return;
      }

      if (arguments.length > 2) {
        // exclude err value
        val = utils.argsToArray(arguments, 1);
      }

      // add result values
      if (err) {
        _this._err = err;
      }
      results[addKey] = val;
      // remove addKey
      waiting.splice(index, 1);
      tryWhen(_this);
    };
  };
  Joiner.prototype.when = function(cb) {
    var _this = this;
    _this._callbacks.push(cb);
    tryWhen(_this);
  };

  Joiner.prototype.results = function() {
    var _this = this;
    return _this._results;
  };
  Joiner.prototype.err = function() {
    var _this = this;
    return _this._err;
  };

  function tryWhen(joiner) {
    var err = joiner._err,
      results;

    if (err) {
      joiner._waiting.splice(0);
    }

    if (joiner._waiting.length || !joiner._callbacks.length) {
      return;
    }

    results = joiner._results;
    joiner._callbacks.forEach(function(cb) {
      cb(err, results);
    });

    // remove all `when` callbacks
    joiner._callbacks.splice(0);
  }

  function create() {
    return new Joiner();
  }
  Joiner.prototype.create = create;

  return create;
});
