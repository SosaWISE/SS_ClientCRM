define([
  '../js/loadDependencies'
], function() {
  "use strict";

  var orderedSpecs = [
      '../../js-specs/app/spec.mocker',
    ],
    specs = [
      '../../js-specs/app/router/spec.route',
      '../../js-specs/app/router/spec.router',

      '../../js-specs/app/util/spec.joiner',
      '../../js-specs/app/util/spec.strings',

      '../../js-specs/app/spec.dataservice.base',
      '../../js-specs/app/spec.notify',
    ];

  console.time('load ordered specs');
  (function loadNext() {
    // pop first spec in array
    var spec = orderedSpecs.shift();
    if (spec) {
      // load next spec
      require([spec], loadNext);
    } else {
      console.timeEnd('load ordered specs');
      console.time('load specs');
      require([
        '../../js-mocks/index'
      ].concat(specs), function(mock) {
        console.timeEnd('load specs');

        mock({});

        var jasmineEnv = jasmine.getEnv(),
          htmlReporter;

        jasmineEnv.updateInterval = 1000;
        htmlReporter = new jasmine.HtmlReporter();
        jasmineEnv.addReporter(htmlReporter);

        jasmineEnv.specFilter = function(spec) {
          return htmlReporter.specFilter(spec);
        };

        jasmineEnv.execute();
      });
    }
  })();
});
