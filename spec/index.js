// create howie
define("howie", [
  "src/core/harold",
], function(
  harold
) {
  "use strict";

  var app = {};
  harold.onFetch("app", function() {
    return app;
  });
  var config = {};
  harold.onFetch("config", function() {
    return config;
  });

  return harold;
});

require(["spec/runner"], function(runner) {
  "use strict";
  runner({}, ["src/_all.spec"], function() {
    console.log(" - specs loaded");
  });
});
