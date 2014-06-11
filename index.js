function formatError(message, url, line, column, err) {
  'use strict';
  var text = [];
  text.push('Line ' + line + ', Column ' + column);
  text.push('Url: ' + url);
  text.push('');
  text.push('Message: ' + message);
  text.push('');
  text.push('StackTrace: ' + err.stack);
  return text.join('\n');
}
window.onerror = function(message, url, line, column, err) {
  'use strict';
  alert(formatError(message, url, line, column, err));
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
