define("src/admin/admincache", [
  "src/dataservice",
  "src/core/typecacher",
], function(
  dataservice,
  typecacher
) {
  "use strict";

  var prefix = "admin-";

  var admincache = {
    getList: function(name) {
      return typecacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return typecacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return typecacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.api_admin, cb);
    },
    metadata: function(name) {
      return metaMap[name] || defaultMeta;
    },
  };

  var defaultMeta = {
    value: "ID",
    text: "Name",
  };
  var metaMap = {
    "actions": defaultMeta,
    "applications": defaultMeta,
  };

  var hardcodedCache = {};

  return admincache;
});
