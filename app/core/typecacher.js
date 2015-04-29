define("src/core/typecacher", [
  "ko",
  "src/core/arrays",
  "src/core/utils",
  "src/core/helpers",
], function(
  ko,
  arrays,
  utils,
  helpers
) {
  "use strict";

  var cache = {};

  function prep(prefix, name, metaMap) {
    var meta = metaMap[name];
    name = prefix + name;
    if (!meta) {
      throw new Error(name + " not implemented");
    }
    //
    var obj = cache[name];
    if (obj) {
      return meta;
    }

    if (!utils.isFunc(meta.initItem)) {
      meta.initItem = utils.noop;
    }

    var map = {};

    function ensureItem(list, item, insertInOrder) {
      var id = item[meta.value];
      if (map[id]) {
        return;
      }
      // initialize item stuff
      meta.initItem(list, map, item);
      // add to map and then list
      map[id] = item;
      // try to insert in order
      if (insertInOrder && meta.comparer) {
        arrays.insertOrdered(list, meta.comparer, item);
      } else {
        list.push(item);
      }
    }

    obj = {
      loader: helpers.onetimer(),
      list: ko.observableArray(),
      map: map,
      add: function(item) {
        ensureItem(obj.list, item, true);
      },
      setList: function(val) {
        if (!Array.isArray(val)) {
          throw new Error("value is not an array");
        }
        var tmpList = [];
        // init, add to map, and add to tmpList
        val.forEach(function(item) {
          ensureItem(tmpList, item, false);
        });
        // try to sort tmpList
        if (utils.isFunc(meta.comparer)) {
          tmpList.sort(meta.comparer);
        }
        // set list
        obj.list(tmpList);
      },
    };
    cache[name] = obj;
    //
    return meta;
  }

  function ensureLoaded(cb, name, read) {
    var obj = cache[name];
    if (!obj) {
      throw new Error(name + " not initialized");
    }
    var loader = obj.loader;
    if (loader.loaded.peek() || loader.loading.peek()) {
      loader(cb);
      return;
    }

    // load
    loader(cb);
    read(utils.safeCallback(function(err) {
      loader.loadCb(err, true);
      if (err) {
        loader.reset();
      }
    }, function(err, resp) {
      obj.setList(resp.Value);
    }, utils.noop));
  }

  return {
    ensure: function(prefix, name, metaMap, hardcodedCache, serviceBase, cb) {
      //
      var meta = prep(prefix, name, metaMap);
      ensureLoaded(cb, prefix + name, function(cb) {
        var list = hardcodedCache[name];
        if (list) {
          window.setTimeout(function() {
            cb(null, {
              Value: list,
            });
          }, 0);
          return;
        }
        //
        if (utils.isFunc(meta.read)) {
          meta.read(cb);
          return;
        }
        //
        var service = serviceBase[name];
        if (!service) {
          throw new Error("no service for " + name);
        }
        service.read({}, null, cb);
      });
    },
    getList: function(prefix, name, metaMap) {
      prep(prefix, name, metaMap);
      var result = cache[prefix + name];
      return result.list;
    },
    getMap: function(prefix, name, metaMap) {
      prep(prefix, name, metaMap);
      var result = cache[prefix + name];
      return result.map;
    },
  };
});
