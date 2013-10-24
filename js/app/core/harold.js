define('src/core/harold', [
  'src/util/utils'
], function(
  utils
) {
  "use strict";

  function Harold() {
    this._fetchers = {};
    this._listeners = {};
  }
  Harold.prototype.create = function() {
    return new Harold();
  };


  //
  // fetch
  //
  Harold.prototype.fetch = function(eventName) {
    var fetcher = this._fetchers[eventName];
    if (!fetcher) {
      throw new Error('no fetcher');
    }
    return fetcher.cb.apply(fetcher.ctx, utils.argsToArray(arguments, 1));
  };
  Harold.prototype.onFetch = function(eventName, context, callback) {
    if (!eventName || !context || !callback) {
      throw new Error('invalid args');
    }

    if (this._fetchers[eventName]) {
      throw new Error('duplicate fetcher: \'' + eventName + '\'');
    }
    this._fetchers[eventName] = {
      cb: callback,
      ctx: context
    };
  };
  Harold.prototype.unFetch = function(eventName) {
    delete this._fetchers[eventName];
  };


  //
  // send
  //
  Harold.prototype.send = function(eventName) {
    var eventListeners = this._listeners[eventName],
      args;
    if (eventListeners) {
      // create args array
      args = utils.argsToArray(arguments, 1);
      // copy listeners
      eventListeners = utils.argsToArray(eventListeners);
      // send
      eventListeners.forEach(function(listener) {
        listener.cb.apply(listener.ctx, args);
      });
    }
  };
  Harold.prototype.onSend = function(eventName, context, callback) {
    if (!eventName || !context || !callback) {
      throw new Error('invalid args');
    }

    var eventListeners = this._listeners[eventName];
    if (!eventListeners) {
      this._listeners[eventName] = eventListeners = [];
    }
    eventListeners.push({
      cb: callback,
      ctx: context
    });
  };
  Harold.prototype.unSend = function(eventName, context) {
    if (!eventName) {
      throw new Error('invalid args');
    }

    var newListeners, eventListeners = this._listeners[eventName];
    if (eventListeners) {
      newListeners = [];
      if (context) {
        eventListeners.forEach(function(listener) {
          if (listener.ctx !== context) {
            newListeners.push(listener);
          }
        });
      }

      if (newListeners.length) {
        this._listeners[eventName] = newListeners;
      } else {
        delete this._listeners[eventName];
      }
    }
    return false;
  };

  return new Harold();
});
