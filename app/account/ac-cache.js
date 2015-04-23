define("src/account/ac-cache", [
  "src/dataservice",
  "src/core/cacher",
], function(
  dataservice,
  cacher
) {
  "use strict";

  var prefix = "ac-";

  var accache = {
    getList: function(name) {
      return cacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return cacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return cacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.api_ms, cb);
    },
    metadata: function(name) {
      return metaMap[name] || defaultMeta;
    },
  };

  var defaultMeta = {
    value: "ID",
    text: "Txt",
  };
  var metaMap = {
    "types/requestReasons": {
      value: "ID",
      text: "Name",
      // comparer: null,
      // initItem: null,
      read: function(cb) {
        dataservice.api_ac.types.read({
          link: "requestReasons",
        }, null, cb);
      },
    },
  };

  var hardcodedCache = {};

  return accache;
});
