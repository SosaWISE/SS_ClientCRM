define("src/core/subscriptionhandler", [], function() {
  "use strict";

  function SubscriptionHandler() {
    var _this = this;
    var list = [];

    _this.subscribe = function(observable, fn, preventInitialSet) {
      list.push({
        observable: observable,
        fn: fn,
        subscription: observable.subscribe(fn),
      });
      if (!preventInitialSet) {
        fn(observable.peek());
      }
      return _this; // allow chaining
    };

    _this.unsubscribe = function(fn) {
      var i = list.length;
      while (i--) {
        if (list[i].fn === fn) {
          list[i].subscription.dispose();
          list.splice(i, 1);
        }
      }
      return _this; // allow chaining
    };

    _this.unsubscribeAll = function() {
      var i = list.length;
      while (i--) {
        list[i].subscription.dispose();
      }
      list = [];
      return _this; // allow chaining
    };
  }

  return SubscriptionHandler;
});
