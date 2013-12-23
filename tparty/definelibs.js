// needed when app is compiled
(function() {
  "use strict";
  define('underscore', [], function() {
    return window._;
  });
  define('markdown', [], function() {
    return window.markdown;
  });
})();
