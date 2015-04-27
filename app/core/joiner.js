define("src/core/joiner", [
  "src/core/bigticker",
  "src/core/arrays",
], function(
  bigticker,
  arrays
) {
  "use strict";
  var _totalCount = 0;

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
  Joiner.prototype.timeout = 1000 * 30;

  function no_op() {}
  Joiner.prototype.add = function(name, timeoutMultiplier, timeoutCb) {
    var _this = this,
      waiting, results, addKey,
      timeout;
    if (_this.isDisposed()) {
      throw new Error("joiner is disposed");
    }
    if (_this._err) {
      // all further adds are ignored
      return no_op;
    }
    var c = ++_totalCount;

    waiting = _this._waiting;
    results = _this._results;
    addKey = _this._count++;

    // add addKey
    waiting.push(addKey);

    function cb(err, val) {
      bigticker.clearTimeout(timeout);
      var index = waiting.indexOf(addKey);
      if (index < 0) {
        // already called or a previous callback passed a value for err
        return;
      }

      if (arguments.length > 2) {
        // exclude err value
        val = arrays.argsToArray(arguments, 1);
      }

      // add result values
      if (err) {
        _this._err = err;
      }
      results[addKey] = val;
      // remove addKey
      waiting.splice(index, 1);
      tryWhen(_this);
    }

    timeout = bigticker.setTimeout(function() {
      if (timeoutCb) {
        timeoutCb();
      }
      cb({
        Code: 1, // ???,
        Message: "Joiner.add(" + c + ") timed out - " + (name || "[unnamed]"),
      });
    }, _this.timeout * (timeoutMultiplier || 1));

    return cb;
  };
  Joiner.prototype.when = function(cb) {
    var _this = this;
    _this._callbacks.push(cb);
    tryWhen(_this);
    return _this; // allow chaining
  };
  Joiner.prototype.after = function(cb) {
    var _this = this;
    _this._callbacks.push(cb);
    // only call `tryWhen` if an error has already occurred
    if (_this._err) {
      tryWhen(_this);
    }
    return _this; // allow chaining
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

  create.Joiner = Joiner;
  return create;
});
