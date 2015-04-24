define("src/account/accounts-cache", [
  "src/dataservice",
  "src/core/cacher",
], function(
  dataservice,
  cacher
) {
  "use strict";

  var prefix = "accounts-";

  var accountscache = {
    getList: function(name) {
      return cacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return cacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return cacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.api_ms, cb);
    },
    metadata: function(name) {
      return metaMap[name] || defaultMeta;
    },
  };

  var defaultMeta = {
    value: "ID",
    text: "Txt",
  };
  var metaMap = {
    "invoices/items": {
      value: "ID",
      text: "ItemDesc",
      // comparer: null,
      // initItem: null,
      read: function(cb) {
        dataservice.api_ms.invoices.read({
          link: "items",
        }, null, cb);
      },
    },
    "types/friendsAndFamily": {
      value: "ID",
      text: "Name",
      read: function(cb) {
        dataservice.api_ms.types.read({
          link: "friendsAndFamily",
        }, null, cb);
      },
    },
    "holds/catg1s": {
      value: "ID",
      text: "Name",
      read: function(cb) {
        dataservice.api_ms.holds.read({
          link: "catg1s",
        }, null, cb);
      },
    },
    "holds/catg2s": {
      value: "ID",
      text: "Name",
      read: function(cb) {
        dataservice.api_ms.holds.read({
          link: "catg2s",
        }, null, cb);
      },
    },

    packages: {
      value: "ID",
      text: "AccountPackageName",
    },

    localizations: {
      value: "LocalizationID",
      text: "LocalizationName",
      read: function(cb) {
        dataservice.maincore.localizations.read({}, null, cb);
      },
    },

    accountCreationTypes: defaultMeta,
    paymentTypes: defaultMeta,
    cellServiceTypes: defaultMeta,
    cellPackageItems: defaultMeta,
  };

  var hardcodedCache = {
    accountCreationTypes: [ //
      {
        ID: "NEW",
        Txt: "New System",
      }, {
        ID: "UPG",
        Txt: "Upgrade",
      }, {
        ID: "TKO",
        Txt: "Takeover",
      },
    ],
    paymentTypes: [ //
      {
        ID: "ACH",
        Txt: "ACH"
      }, {
        ID: "CC",
        Txt: "Credit Card",
      }, {
        ID: "CHCK",
        Txt: "Check",
      }, {
        ID: "MAN",
        Txt: "Manual Invoice",
      },
    ],
    cellServiceTypes: [ //
      {
        ID: null,
        Txt: "[No Cell]",
      }, {
        ID: "CELL_SRV_TG",
        Txt: "Telguard",
      }, {
        ID: "CELL_SRV_AC",
        Txt: "Alarm.com",
      }, {
        ID: "CELL_SRV_HW",
        Txt: "HW AlarmNet",
      },
    ],
    cellPackageItems: [ //
      {
        ID: "CELL_SRV_AC_AI",
        Txt: "Advanced Interactive",
      }, {
        ID: "CELL_SRV_AC_BI",
        Txt: "Basic Interactive",
      }, {
        ID: "CELL_SRV_AC_IG",
        Txt: "Interactive Gold",
      }, {
        ID: "CELL_SRV_AC_WSF",
        Txt: "Alarm.Com Wireless Signal Forward",
      }, {
        ID: "CELL_SRV_HW",
        Txt: "Honeywell Alarm.net Service",
      }, {
        ID: "CELL_SRV_TG",
        Txt: "Telguard Monthly",
      },
    ],
  };

  return accountscache;
});
