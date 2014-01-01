/* global Notification */

var count = 0,
  notificationPermission = Notification.permission;
console.log('notificationPermission:', notificationPermission);

function requestPermission(cb) {
  "use strict";

  Notification.requestPermission(function(permission) {
    notificationPermission = permission;
    console.log('requestion result:', notificationPermission);

    if (typeof(cb) === 'function') {
      cb();
    }
  });
}

function createNotification() {
  "use strict";

  var instance = new Notification("a", {
    // only one notification with this tag name can exist at a time
    // creating a new instance will replace the existing instance
    // even if the page is refreshed or they are from different tabs
    tag: 'count',
    body: ++count,
    icon: "http://www.google.com/favicon.ico"
  });

  instance.onclick = function() {
    // Something to do
    console.log('clicked');
  };
  instance.onerror = function() {
    // Something to do
    console.error('errored', arguments[0]);
    // reset incase of permission issues
    notificationPermission = null;
  };
  instance.onshow = function() {
    // Something to do
    console.log('showed');
  };
  instance.onclose = function() {
    // Something to do
    console.log('closed');
  };
}

function notifyMe() {
  "use strict";

  if (notificationPermission === "granted") {
    // Let's check if the user is okay to get some notification
    createNotification();
  } else if (notificationPermission !== 'denied') {
    // Otherwise, we need to ask the user for permission
    // Note, Chrome does not implement the permission static property
    // So we have to check for NOT 'denied' instead of 'default'
    requestPermission(function() {
      if (notificationPermission === "granted") {
        createNotification();
      }
    });
  } else {
    console.log('notifications have been "' + notificationPermission + '"');
  }

  return false;
}
if (false) {
  notifyMe();
}
