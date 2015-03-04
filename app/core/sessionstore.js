define("src/core/sessionstore", [
  "src/core/jsonhelpers",
], function(
  jsonhelpers
) {
  "use strict";

  var store = {
    setItem: function(name, value) {
      if (value == null) {
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, jsonhelpers.stringify(value));
      }
    },
    getItem: function(name) {
      var value = sessionStorage.getItem(name);
      if (value == null) {
        return value;
      }
      return jsonhelpers.parse(value);
    },
  };

  return store;
});
