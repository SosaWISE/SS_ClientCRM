// nickname harold
define("howie", [
  "ko",
  "src/core/harold",
  //@HACK
  "src/core/ko.command",
], function(
  ko,
  harold
) {
  "use strict";

  var app = {
    //@HACK
    user: ko.observable(),
    layersVm: {
      show: function() {},
    }
  };
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
