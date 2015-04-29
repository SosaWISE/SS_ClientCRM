window.onerror = function(message, url, line, column, err) {
  'use strict';
  window.alert(err.stack);
};

// show seconds
(function() {
  'use strict';
  var seconds = 0;

  function tick() {
    var el = document.getElementById('loadingSeconds');
    if (el) {
      el.innerHTML = seconds;
      seconds++;
      window.setTimeout(tick, 1000);
    }
  }
  window.setTimeout(tick, 0);
})();
