define("src/account/salesinfo/options", [
  "src/core/numbers",
], function(
  numbers
) {
  "use strict";

  var billingDay = (function() {
    var list = [],
      i = 0;
    // billing days are 1st to 25th
    while (i < 25) {
      i++;
      list.push({
        value: i,
        text: numbers.toOrdinal(i),
      });
    }
    return list;
  })();

  return {
    systemTypes: [ //
      {
        value: "NEW",
        text: "New System",
      }, {
        value: "UPG",
        text: "Upgrade",
      }, {
        value: "TKO",
        text: "Takeover",
      },
    ],
    over3Months: [ //
      {
        value: true,
        text: "Over 3 Months",
      }, {
        value: false,
        text: "Paid in Full",
      },
    ],
    paymentType: [ //
      {
        value: "ACH",
        text: "ACH"
      }, {
        value: "CC",
        text: "Credit Card",
      }, {
        value: "CHCK",
        text: "Check",
      }, {
        value: "MAN",
        text: "Manual Invoice",
      },
    ],
    billingDay: billingDay,
    isTakeOver: [ //
      {
        value: false,
        text: "New Install",
      }, {
        value: true,
        text: "Takeover",
      },
    ],
    isOwner: [ //
      {
        value: true,
        text: "Home Owner",
      }, {
        value: false,
        text: "Renter",
      },
    ],
    cellService: [ //
      {
        value: null,
        text: "[No Cell]",
      }, {
        value: "CELL_SRV_TG",
        text: "Telguard",
      }, {
        value: "CELL_SRV_AC",
        text: "Alarm.com",
      }, {
        value: "CELL_SRV_HW",
        text: "HW AlarmNet",
      },
    ],
    cellPackageItem: [ //
      {
        value: "CELL_SRV_AC_AI",
        text: "Advanced Interactive",
      }, {
        value: "CELL_SRV_AC_BI",
        text: "Basic Interactive",
      }, {
        value: "CELL_SRV_AC_IG",
        text: "Interactive Gold",
      }, {
        value: "CELL_SRV_AC_WSF",
        text: "Alarm.Com Wireless Signal Forward",
      }, {
        value: "CELL_SRV_HW",
        text: "Honeywell Alarm.net Service",
      }, {
        value: "CELL_SRV_TG",
        text: "Telguard Monthly",
      },
    ],
    monitoringStation: [ //
      {
        value: true,
        text: "Monitronics",
      }, {
        value: false,
        text: "Other",
      },
    ],
  };
});
