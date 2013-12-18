require(['spec/runner'], function(runner) {
  "use strict";
  runner({}, [
    'lib/_all.spec',
    'src/_all.spec',
  ], function() {
    console.log(' - specs loaded');
  });
});
