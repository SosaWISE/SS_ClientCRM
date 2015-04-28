define("src/account/accache", [
  "src/dataservice",
  "src/core/typecacher",
], function(
  dataservice,
  typecacher
) {
  "use strict";

  var prefix = "ac-";

  var accache = {
    getList: function(name) {
      return typecacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return typecacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return typecacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.api_ac, cb);
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
