define("src/account/accthelper", [
  // "src/core/utils",
  "src/account/mscache",
], function(
  // utils,
  mscache
) {
  "use strict";

  var accthelper = {

    contractStatus: function(cancelDate, approverID, hasRepFrontEndHolds) {
      var st;
      if (cancelDate) {
        st = "canceled";
      } else if (approverID) {
        st = "approved";
      } else if (hasRepFrontEndHolds) {
        st = "blocked";
      } else {
        st = "unapproved";
      }
      return st;
    },

    hasRepFrontEndHolds: function(holds) {
      var map = mscache.getMap("holds/catg2s");
      return holds.some(function(item) {
        // exclude fixed holds
        if (!!item.FixedOn) {
          return false;
        }
        var catg2 = map[item.Catg2Id];
        return catg2 && catg2.IsRepFrontEndHold;
      });
    },
  };


  return accthelper;
});
