define("src/inventory/invcache", [
  "dataservice",
  "src/core/typecacher",
], function(
  dataservice,
  typecacher
) {
  "use strict";

  var prefix = "inv-";

  var invcache = {
    getList: function(name) {
      return typecacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return typecacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return typecacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.api_inv, cb);
    },
    metadata: function(name) {
      return metaMap[name] || defaultMeta;
    },
  };

  function compareName(a, b) {
    a = a.Name;
    b = b.Name;
    var result = 0;
    if (a < b) {
      result = -1;
    } else if (a > b) {
      result = 1;
    }
    return result;
  }

  var defaultMeta = {
    value: "ID",
    text: "Txt",
  };
  var metaMap = {
    "locationTypes": {
      value: "ID",
      text: "Name",
      comparer: compareName,
      // initItem: null,
      // read: function(cb) {},
    },
  };

  var hardcodedCache = {};

  return invcache;
});
