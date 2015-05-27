define("src/scheduler/scheduler-cache", [
  "dataservice",
  "src/core/typecacher",
], function(
  dataservice,
  typecacher
) {
  "use strict";

  var prefix = "scheduler-";

  var schedulercache = {
    getList: function(name) {
      return typecacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return typecacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return typecacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.ticketsrv, cb);
    },
    metadata: function(name) {
      return metaMap[name] || defaultMeta;
    },
  };

  var defaultMeta = {
    value: "ID",
    text: "Txt", // ???
  };
  var metaMap = {
    techs: {
      value: "RecruitId",
      // text: null,
      // comparer: null,
      // initItem: null,
      // read: function(cb) {},
    },
    serviceTypes: defaultMeta,
    skills: defaultMeta,
    statusCodes: defaultMeta,
  };

  var hardcodedCache = {};

  return schedulercache;
});
