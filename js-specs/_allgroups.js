define('spec/_allgroups', [
  'src/u-kov/specs/_all',
], function(
  ukovSpecs
) {
  "use strict";
  var specGroups = [
    // lib specs
    [
      'spec/lib/spec.depends',
    ],
    [
      'spec/spec.mockery',
    ],

    // u-kov specs
    ukovSpecs,

    // app specs
    [
      'spec/app/router/spec.route',
      'spec/app/router/spec.router',

      'spec/app/util/spec.joiner',
      'spec/app/util/spec.strings',

      'spec/app/spec.dataservice.base',
      'spec/app/spec.harold',
      'spec/app/spec.notify',
    ]
  ];

  return specGroups;
});
