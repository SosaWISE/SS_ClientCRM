define("src/core/storage", [
  "src/core/harold",
  "src/core/jsonhelpers",
], function(
  harold,
  jsonhelpers
) {
  "use strict";
  // var storage = sessionStorage; // does not work for new tabs, unless the tab is created by the existing tab (e.g.: duplicate tab)
  var storage = localStorage;
  // make our own harold
  harold = harold.create();

  var store = {
    setItem: function(key, value, forceNotify) {
      var oldValue = storage.getItem(key);
      var newValue = (value == null) ? null : jsonhelpers.stringify(value);
      if (!forceNotify && newValue === oldValue) {
        return;
      }
      if (newValue == null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, newValue);
      }
      // notify local handlers
      notify(key, oldValue, newValue, true);
    },
    getItem: function(key) {
      var value = storage.getItem(key);
      if (value == null) {
        return value;
      }
      return jsonhelpers.parse(value);
    },
    on: function(key, fn) {
      harold.on(key, fn);
    },
    off: function(key, fn) {
      harold.off(key, fn);
    },
  };

  //
  //
  //
  function notify(key, oldValue, newValue, isLocal) {
    harold.send(key, {
      isLocal: isLocal,
      oldValue: oldValue,
      newValue: newValue,
    });
  }

  function onStorageEvent(storageEvent) {
    notify(storageEvent.key, storageEvent.oldValue, storageEvent.newValue, false);
  }
  window.addEventListener("storage", onStorageEvent, false);

  return store;
});
