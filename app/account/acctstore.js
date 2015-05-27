define("src/account/acctstore", [
  "dataservice",
  "src/core/utils",
], function(
  dataservice,
  utils
) {
  "use strict";

  var metaMap = {
    "holds": {
      idName: "AccountHoldID",
    },
    "accountSalesInformations": {
      idName: "ID",
    },
    "serviceTickets": {
      idName: "ID",
    },
  };

  function AcctStore() {
    var _this = this;
    _this._accts = {};
  }
  AcctStore.prototype.new = function() {
    return new AcctStore();
  };

  AcctStore.prototype.create = function(acctid, link, data, setter, cb) {
    var _this = this;
    assertMeta(link);
    _this.saveAcctLink(acctid, link, data, function(val) {
      try {
        //
        var acct = _this._accts["$" + acctid];
        if (!acct) {
          return;
        }
        var item = acct.linkData[link];
        if (!item) {
          return;
        }
        //
        if (Array.isArray(item.data)) {
          item.data.push(val);
        } else {
          item.data = val;
        }
        //
        notifyLoaded(_this, acctid, link);
      } catch (ex) {
        setter = null;
      } finally {
        if (utils.isFunc(setter)) {
          setter(val);
        }
      }
    }, cb);
  };
  AcctStore.prototype.update = function(acctid, link, id, data, setter, cb) {
    var _this = this;
    assertMeta(link);
    _this.save(link, id, "", data, function(val) {
      try {
        //
        var acct = _this._accts["$" + acctid];
        if (!acct) {
          return;
        }
        var item = acct.linkData[link];
        if (!item) {
          return;
        }
        //
        if (Array.isArray(item.data)) {
          replaceItem(item.data, metaMap[link].idName, val, id);
        } else {
          item.data = val;
        }
        //
        notifyLoaded(_this, acctid, link);
      } catch (ex) {
        setter = null;
      } finally {
        if (utils.isFunc(setter)) {
          setter(val);
        }
      }
    }, cb);
  };

  function replaceItem(list, idName, val, expectedId) {
    var id = val[idName];
    if (id !== expectedId) {
      console.warn("id does not match expected id");
    }
    var found = list.some(function(item, index) {
      if (item[idName] === id) {
        list.splice(index, 1, val);
        return true;
      }
    });
    if (!found) {
      console.warn("failed to find item to replace");
      list.push(val);
    }
  }

  AcctStore.prototype.once = function(acctid, links, fn) {
    var _this = this;
    var off;
    //
    function on() {
      off();
      fn.apply(_this, arguments);
    }
    return (off = _this.on(acctid, links, on));
  };
  AcctStore.prototype.on = function(acctid, links, fn, invalidate) {
    links.forEach(assertMeta);
    var _this = this;
    var acct = _this._accts["$" + acctid];
    if (!acct) {
      _this._accts["$" + acctid] = acct = {
        linkData: {},
        listeners: [],
      };
    }
    var listener = {
      links: links,
      fn: fn,
    };
    acct.listeners.push(listener);
    // ensure links exist
    var linkData = acct.linkData;
    links.forEach(function(link) {
      if (linkData[link]) {
        return;
      }
      linkData[link] = {
        loaded: false,
        loading: false,
        err: null,
        data: null,
      };
    });
    tryLoad(_this, acctid, listener, linkData, invalidate);
    //
    return function off() {
      var index = acct.listeners.indexOf(listener);
      if (index > -1) {
        acct.listeners.splice(index, 1);
      }
    };
  };
  AcctStore.prototype.loadAcctLink = function(acctid, link, setter, cb) {
    var _this = this;
    _this.load("accounts", acctid, link, setter, cb);
  };
  AcctStore.prototype.load = function(type, id, link, setter, cb) {
    dataservice.api_ms[type].read({
      id: id,
      link: link,
    }, setter, cb);
  };

  //
  AcctStore.prototype.saveAcctLink = function(acctid, link, data, setter, cb) {
    var _this = this;
    _this.save("accounts", acctid, link, data, setter, cb);
  };
  //
  AcctStore.prototype.save = function(type, id, link, data, setter, cb) {
    dataservice.api_ms[type].save({
      id: id,
      link: link,
      data: data,
    }, setter, cb);
  };

  function assertMeta(link) {
    if (!metaMap[link]) {
      throw new Error("invalid link: " + link);
    }
  }

  function tryLoad(_this, acctid, listener, linkData, invalidate) {
    listener.async = true;
    listener.links.forEach(function(link) {
      var item = linkData[link];
      if (item.loading || // already loading
        ((item.loaded && !item.err) && !invalidate) // does not need to reload
      ) {
        return;
      }
      // begin loading...
      item.loaded = false;
      item.loading = true;
      _this.loadAcctLink(acctid, link, null, function(err, resp) {
        // done loading
        item.loaded = true;
        item.loading = false;
        item.err = err;
        item.data = (err) ? null : resp.Value;
        notifyLoaded(_this, acctid, link);
      });
    });
    //
    tryCall(_this, listener, linkData);
  }

  function notifyLoaded(_this, acctid, link) {
    var acct = _this._accts["$" + acctid];
    if (acct) {
      var listeners = acct.listeners.slice(0);
      for (var i = 0, len = listeners.length; i < len; ++i) {
        // try to call listener if cares about the link
        if (listeners[i].links.indexOf(link) >= 0) {
          tryCall(_this, listeners[i], acct.linkData);
        }
      }
    }
  }

  function tryCall(_this, listener, linkData) {
    // gather loaded data for listener
    var err;
    var errMap;
    var loadedData = {};
    var all = listener.links.every(function(link) {
      var item = linkData[link];
      if (listener.async && !item.loaded) {
        return false;
      }
      if (item.err) {
        err = err || item.err;
        (errMap || (errMap = {}))[link] = item.err;
      }
      loadedData[link] = item.data;
      return true;
    });
    // if all links are loaded, notify listener
    if (all) {
      listener.async = false;
      listener.fn.call(_this, err, loadedData, errMap);
    }
  }

  return AcctStore.prototype.new();
});
