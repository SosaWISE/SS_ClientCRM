define("src/admin/admincache", [
  "src/dataservice",
  "src/core/cacher",
], function(
  dataservice,
  cacher
) {
  "use strict";

  var prefix = "admin-";

  var admincache = {
    getList: function(name) {
      return cacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return cacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return cacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.api_admin, cb);
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
    "actions": {
      value: "ID",
      text: "ItemDesc",
      // comparer: null,
      // initItem: null,
      // read: function(cb) {},
    },
    "applications": {
      value: "ID",
      text: "ItemDesc",
    },
  };

  var hardcodedCache = {};

  return admincache;
});
