define('src/config', [], function() {
  "use strict";
  return {};
});

require(['spec/runner'], function(runner) {
  "use strict";
  runner({}, ['src/_all.spec'], function() {
    console.log(' - specs loaded');
  });
});
