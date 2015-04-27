define("src/core/harold", [
  "src/core/arrays"
], function(
  arrays
) {
  "use strict";

  // The Herald, aka howie
  function Harold() {}
  Harold.prototype.create = function() {
    return new Harold();
  };


  //
  // fetch
  //
  Harold.prototype.fetch = function(event) {
    this._fetchers = this._fetchers || {};
    var fetcher = this._fetchers[event];
    if (!fetcher) {
      throw new Error("no fetcher");
    }
    return fetcher.cb.apply(this, arrays.argsToArray(arguments, 1));
  };
  Harold.prototype.onFetch = function(event, callback) {
    if (!event || !callback) {
      throw new Error("missing event name and/or callback");
    }

    this._fetchers = this._fetchers || {};
    if (this._fetchers[event]) {
      throw new Error("duplicate fetcher: '" + event + "'");
    }
    this._fetchers[event] = {
      cb: callback,
    };
  };
  Harold.prototype.offFetch = function(event) {
    this._fetchers = this._fetchers || {};
    delete this._fetchers[event];
  };


  //
  // send
  //

  Harold.prototype.send = function(event) {
    var _this = this;
    _this._callbacks = _this._callbacks || {};
    var args = [].slice.call(arguments, 1),
      callbacks = _this._callbacks["$" + event];
    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(_this, args);
      }
    }
    // return _this;
  };

  Harold.prototype.on = function(event, fn) {
    var _this = this;
    _this._callbacks = _this._callbacks || {};
    (_this._callbacks["$" + event] = _this._callbacks["$" + event] || [])
      .push(fn);
    //
    function off() {
      _this.off(event, fn);
    }
    return off;
  };

  Harold.prototype.once = function(event, fn) {
    var _this = this;

    function off() {
      _this.off(event, on);
    }

    function on() {
      off();
      fn.apply(_this, arguments);
    }

    on.oncefn = fn; // allow fn to be removed in `off` function
    _this.on(event, on);
    return off;
  };

  Harold.prototype.off = function(event, fn) {
    this._callbacks = this._callbacks || {};
    // all
    if (0 === arguments.length) {
      this._callbacks = {};
      return this;
    }
    // specific event
    var callbacks = this._callbacks["$" + event];
    if (!callbacks) {
      return this;
    }
    // remove all handlers
    if (1 === arguments.length) {
      delete this._callbacks["$" + event];
      return this;
    }
    // remove specific handler
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    }
    return this;
  };

  return new Harold();
});
