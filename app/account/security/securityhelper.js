define("src/account/security/securityhelper", [
  "src/core/strings",
  "src/core/utils",
], function(
  strings,
  utils
) {
  "use strict";

  var securityhelper;

  securityhelper = {
    zoneString: function(zoneVal) {
      if (!zoneVal && zoneVal !== 0) {
        // no zone
        return null;
      } else if (utils.isStr(zoneVal) || utils.isNum(zoneVal)) {
        // ensure correct zone format
        return strings.padLeft(zoneVal, "0", 3);
      } else {
        throw new Error("invalid zone `" + zoneVal + "`");
      }
    },
    zoneStringConverter: function(val) {
      // remove non-numeric characters
      val = parseInt(val.replace(/[^0-9]/g, ""));
      if (isNaN(val)) {
        return new Error("Invalid Zone");
      } else {
        // format
        return securityhelper.zoneString(val);
      }
    },
  };

  return securityhelper;
});
