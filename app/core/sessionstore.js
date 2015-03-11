define("src/core/sessionstore", [
  "src/core/jsonhelpers",
], function(
  jsonhelpers
) {
  "use strict";
  // var storage = sessionStorage; // doesn't work for new tabs, unless the tab is created by the existing tab (e.g.: duplicate tab)
  var storage = localStorage;

  var store = {
    setItem: function(name, value) {
      if (value == null) {
        storage.removeItem(name);
      } else {
        storage.setItem(name, jsonhelpers.stringify(value));
      }
    },
    getItem: function(name) {
      var value = storage.getItem(name);
      if (value == null) {
        return value;
      }
      return jsonhelpers.parse(value);
    },
  };

  return store;
});
