define("src/core/handler", [], function() {
  "use strict";

  function Handler() {
    var _this = this;

    _this.destroy = function() {
      _this.disposeAll();
      _this.offAll();
      _this.removeOffs();
      return _this; // allow chaining
    };

    //
    // ko subscriptions
    //
    var _subs = [];
    _this.subscribe = function(observable, fn, preventInitialSet) {
      _subs.push({
        fn: fn,
        subscription: observable.subscribe(fn),
      });
      if (!preventInitialSet) {
        fn(observable.peek());
      }
      return _this; // allow chaining
    };
    _this.dispose = function(fn) {
      var i = _subs.length;
      while (i--) {
        if (_subs[i].fn === fn) {
          _subs[i].subscription.dispose();
          _subs.splice(i, 1);
        }
      }
      return _this; // allow chaining
    };
    _this.disposeAll = function() {
      var i = _subs.length;
      while (i--) {
        _subs[i].subscription.dispose();
      }
      _subs = [];
      return _this; // allow chaining
    };

    //
    // heralds/events
    //
    var _evts = [];
    _this.on = function(harold, event, fn) {
      _evts.push({
        event: event,
        fn: fn,
        off: harold.on(event, fn),
      });
      return _this; // allow chaining
    };
    _this.off = function(event, fn) {
      var i = _evts.length;
      while (i--) {
        var evt = _evts[i];
        if (evt.event === event && evt.fn === fn) {
          evt.off();
          _evts.splice(i, 1);
        }
      }
      return _this; // allow chaining
    };
    _this.offAll = function() {
      var i = _evts.length;
      while (i--) {
        _evts[i].off();
      }
      _evts = [];
      return _this; // allow chaining
    };

    //
    //
    //
    var _offs = [];
    _this.addOff = function(off) {
      _offs.push(off);
    };
    _this.removeOffs = function() {
      var i = _offs.length;
      while (i--) {
        _offs[i]();
      }
      _offs = [];
      return _this; // allow chaining
    };
  }

  return Handler;
});
