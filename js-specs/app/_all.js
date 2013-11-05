define('spec/app/_all', [
], function() {
  'use strict';

  var specs = [
    'spec/app/util/joiner.spec',
    'spec/app/util/strings.spec',

    'spec/app/vm.combo.spec',
    'spec/app/core/dataservice.base.spec',
    'spec/app/core/harold.spec',
    'spec/app/core/notify.spec',
    'spec/app/core/route.spec',
    'spec/app/core/router.spec',
  ];
  return specs;
});
