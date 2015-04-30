define("src/core/bigticker", [
  "ko",
  "src/core/utils",
  "src/core/arrays",
], function(
  ko,
  utils,
  arrays
) {
  "use strict";

  var _count = 0;

  function BigTicker() {
    var _this = this;

    _this._timeoutMap = {};
    _this._paused = false;
  }
  BigTicker.prototype.create = function() {
    return new BigTicker();
  };

  BigTicker.prototype.setTimeout = function( /*fn, ms*/ ) {
    var _this = this;
    return createTimeout(_this, {
      btid: 0,
      args: arguments,
    });
  };
  BigTicker.prototype.clearTimeout = function(btid) {
    var _this = this;
    var map = _this._timeoutMap;
    var obj = map[btid];
    if (obj) {
      delete map[btid];
      window.clearTimeout(obj.id);
    }
  };

  BigTicker.prototype.isPaused = function() {
    var _this = this;
    return _this._paused;
  };
  BigTicker.prototype.pause = function() {
    var _this = this;
    if (_this._paused) {
      return;
    }
    _this._paused = true;
    // stop all started timeouts
    var map = _this._timeoutMap;
    Object.keys(map).forEach(function(btid) {
      var obj = map[btid];
      window.clearTimeout(obj.id);
      obj.id = 0;
    });
  };
  BigTicker.prototype.restart = function() {
    var _this = this;
    if (!_this._paused) {
      return;
    }
    _this._paused = false;
    // restart all stopped timeouts
    var map = _this._timeoutMap;
    Object.keys(map).forEach(function(btid) {
      createTimeout(_this, map[btid]);
    });
  };

  function createTimeout(_this, obj) {
    obj.btid = obj.btid || ++_count;
    if (_this._paused) {
      obj.id = 0;
    } else {
      var args = obj.args;
      obj.id = window.setTimeout(function() {
        obj.id = 0;
        args[0].apply(null, arrays.argsToArray(args, 2));
      }, args[1]);
      //
    }
    _this._timeoutMap[obj.btid] = obj;

    return obj.btid;
  }

  return new BigTicker();
});
