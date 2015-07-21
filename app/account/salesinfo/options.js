define("src/account/salesinfo/options", [
  "src/core/numbers",
], function(
  numbers
) {
  "use strict";

  return {
    billingDays: (function() {
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
    })(),
    over3Months: [ //
      {
        value: true,
        text: "Over 3 Months",
      }, {
        value: false,
        text: "Paid in Full",
      },
    ],
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
    isMonitronics: [ //
      {
        value: true,
        text: "Monitronics",
      }, {
        value: false,
        text: "Other",
      },
    ],
    isRMRPaidInFull: [ //
      {
        value: true,
        text: "Paid by Month",
      }, {
        value: false,
        text: "Paid in Full",
      }, {
        value: false,
        text: "Paid Quarterly",
      }, {
        value: false,
        text: "Paid Semi-Anually",
      }, {
        value: false,
        text: "Paid Anually",
      }
    ],
  };
});