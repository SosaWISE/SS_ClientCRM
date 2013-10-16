define('spec/allspecs', [
  'spec/runner'
], function(runner) {
  "use strict";
  runner([
    [
      'spec/lib/spec.depends',
    ],
    [
      'spec/spec.mockery',
    ],
    [
      'spec/app/router/spec.route',
      'spec/app/router/spec.router',

      'spec/app/util/spec.joiner',
      'spec/app/util/spec.strings',

      'spec/app/spec.dataservice.base',
      'spec/app/spec.notify',
    ]
  ], {});
});
