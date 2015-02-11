define("src/scrum/scrum-cache", [
  "src/dataservice",
  "ko",
  "src/core/strings",
  "src/core/cacher",
], function(
  dataservice,
  ko,
  strings,
  cacher
) {
  "use strict";

  var prefix = "scrum-",
    // projectsPrefix = "projects_", //+ScrumGroupId
    scrumcache, hardcodedCache;

  scrumcache = {
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
      // if (strings.startsWith(name, projectsPrefix)) {
      //   ensureScrumGroupType(name.substr(projectsPrefix.length), "projects", "ID", cb);
      //   return;
      // }
      switch (name) {
        case "persons":
          ensureType(name, "ID", cb);
          break;
        case "tasksteps":
          ensureType(name, "ID", cb);
          break;
        default:
          throw new Error(name + " not implemented");
      }
    },
  };

  function ensureType(type, idName, cb) {
    cacher.ensure(cb, prefix + type, idName, function(cb) {
      dataservice.scrum[type].read({}, null, cb);
    });
  }

  // function ensureScrumGroupType(scrumGroupId, link, idName, cb) {
  //   cacher.ensure(cb, prefix + link, idName, function(cb) {
  //     dataservice.scrum.scrumGroups.read({
  //       id: scrumGroupId,
  //       link: link,
  //     }, null, cb);
  //   });
  // }

  hardcodedCache = {
    //
  };

  return scrumcache;
});
