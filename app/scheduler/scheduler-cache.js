define("src/scheduler/scheduler-cache", [
  "src/dataservice",
  "ko",
  "src/core/cacher",
], function(
  dataservice,
  ko,
  cacher
) {
  "use strict";

  var prefix = "scheduler-",
    schedulercache, hardcodedCache;

  schedulercache = {
    getList: function(name) {
      return hardcodedCache[name] || cacher.getList(prefix + name);
    },
    getMap: function(name) {
      return cacher.getMap(prefix + name);
    },
    ensure: function(name, cb) {
      if (hardcodedCache[name]) {
        setTimeout(function() {
          cb();
        }, 0);
        return;
      }
      switch (name) {
        case "serviceTypes":
        case "skills":
        case "statusCodes":
          ensureType(name, "ID", cb);
          break;
        case "techs":
          ensureType(name, "RecruitId", cb);
          break;
        default:
          throw new Error(name + " not implemented");
      }
    },
  };

  function ensureType(type, idName, cb) {
    cacher.ensure(cb, prefix + type, idName, function(cb) {
      dataservice.ticketsrv[type].read({}, null, cb);
    });
  }

  hardcodedCache = {

  };

  return schedulercache;
});
