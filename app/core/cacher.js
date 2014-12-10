define('src/core/cacher', [
  'ko',
  'src/core/arrays',
  'src/core/utils',
  'src/core/helpers',
], function(
  ko,
  arrays,
  utils,
  helpers
) {
  "use strict";

  var cache = {};

  function ensure(cb, name, idName, read, comparer, initItem) {
    var obj = cache[name];
    if (obj) {
      obj.loader(cb);
      return;
    }

    if (!utils.isFunc(initItem)) {
      initItem = utils.noop;
    }

    function ensureItem(list, map, item, insertInOrder) {
      var id = item[idName];
      if (map[id]) {
        return;
      }
      // initialize item stuff
      initItem(list, map, item);
      // add to map and then list
      map[id] = item;
      // try to insert in order
      if (insertInOrder) {
        arrays.insertOrdered(list, comparer, item);
      } else {
        list.push(item);
      }
    }

    obj = {
      loader: helpers.onetimer(),
      list: ko.observableArray(),
      map: {},
      add: function(item) {
        ensureItem(obj.list, obj.map, item, true);
      },
    };
    cache[name] = obj;

    // load
    obj.loader(cb);
    read(utils.safeCallback(function(err) {
      obj.loader.loadCb(err, true);
    }, function(err, resp) {
      if (!Array.isArray(resp.Value)) {
        throw new Error('resp.Value is not an array');
      }
      var val = resp.Value,
        tmpList = [];
      // init, add to map, and add to tmpList
      val.forEach(function(item) {
        ensureItem(tmpList, obj.map, item, false);
      });
      // try to sort tmpList
      if (utils.isFunc(comparer)) {
        tmpList.sort(comparer);
      }
      // set list
      obj.list(tmpList);
    }, utils.noop));
  }

  return {
    ensure: ensure,
    getList: function(name) {
      var result = cache[name];
      if (!result) {
        return null;
        // throw new Error(name + ' not in cache');
      }
      return result.list;
    },
    getMap: function(name) {
      var result = cache[name];
      if (!result) {
        return null;
        // throw new Error(name + ' not in cache');
      }
      return result.map;
    },
  };
});
