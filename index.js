window.onerror = function(message, url, line, column, err) {
  'use strict';
  alert(err.stack);
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
      setTimeout(tick, 1000);
    }
  }
  setTimeout(tick, 0);
})();
