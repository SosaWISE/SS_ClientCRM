define('spec/app/_all', [
], function() {
  'use strict';

  var specs = [
    'spec/app/router/spec.route',
    'spec/app/router/spec.router',

    'spec/app/util/spec.joiner',
    'spec/app/util/spec.strings',

    'spec/app/spec.dataservice.base',
    'spec/app/spec.harold',
    'spec/app/spec.notify',
  ];
  return specs;
});
