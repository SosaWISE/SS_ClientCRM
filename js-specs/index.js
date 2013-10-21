define('spec/index', [
  'spec/runner',
  'spec/lib/_all',
  'src/u-kov/specs/_all',
  'spec/app/_all',
], function(
  runner,
  libSpecs,
  ukovSpecs,
  appSpecs
) {
  "use strict";
  runner({}, [
    // lib specs
    libSpecs,
    [
      'spec/spec.mockery',
    ],

    // app specs
    ukovSpecs,
    appSpecs,
  ], function() {
    console.log(' - specs loaded');
  });
});
