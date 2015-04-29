define("src/hr/hr-cache", [
  "src/dataservice",
  "ko",
  "src/core/typecacher",
], function(
  dataservice,
  ko,
  typecacher
) {
  "use strict";

  var prefix = "hr-";

  var hrcache = {
    getList: function(name) {
      return typecacher.getList(prefix, name, metaMap);
    },
    getMap: function(name) {
      return typecacher.getMap(prefix, name, metaMap);
    },
    ensure: function(name, cb) {
      return typecacher.ensure(prefix, name, metaMap,
        hardcodedCache, dataservice.hr, cb);
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
    payscales: {
      value: "PayscaleID",
      text: "Name",
      // comparer: null,
      // initItem: null,
      // read: function(cb) {},
    },
    phoneCellCarriers: {
      value: "PhoneCellCarrierID",
      text: "Description",
    },
    roleLocations: {
      value: "RoleLocationID",
      text: "Role",
    },
    schools: {
      value: "SchoolID",
      text: "SchoolName",
    },
    seasons: {
      value: "SeasonID",
      text: "SeasonName",
    },
    teams: {
      value: "TeamID",
      text: "Description",
    },
    teamLocations: {
      value: "TeamLocationID",
      text: "Description",
    },
    userEmployeeTypes: {
      value: "UserEmployeeTypeID",
      text: "UserEmployeeTypeName",
    },
    userTypes: {
      value: "UserTypeID",
      text: "Description",
    },

    shirtSizes: defaultMeta,
    hatSizes: defaultMeta,
    sexs: defaultMeta,
    maritalStatuses: defaultMeta,
    docStatuses: defaultMeta,
    countrys: defaultMeta,
    recruitCohabbitTypes: defaultMeta,
    eyeColors: defaultMeta,
    hairColors: defaultMeta,
  };

  var hardcodedCache = {
    shirtSizes: [ //
      {
        ID: 1,
        Txt: "XXS"
      }, {
        ID: 2,
        Txt: "XS"
      }, {
        ID: 3,
        Txt: "S"
      }, {
        ID: 4,
        Txt: "M"
      }, {
        ID: 5,
        Txt: "L"
      }, {
        ID: 6,
        Txt: "XL"
      }, {
        ID: 7,
        Txt: "XXL"
      }, {
        ID: 8,
        Txt: "XXXL"
      },
    ],
    hatSizes: [ //
      {
        ID: 1,
        Txt: "S"
      }, {
        ID: 2,
        Txt: "M"
      }, {
        ID: 3,
        Txt: "L"
      },
    ],
    sexs: [ //
      {
        ID: 1,
        Txt: "Male"
      }, {
        ID: 2,
        Txt: "Female"
      },
    ],
    maritalStatuses: [ //
      {
        ID: false,
        Txt: "Single"
      }, {
        ID: true,
        Txt: "Married"
      },
    ],

    docStatuses: [ //
      {
        ID: 1,
        Txt: "Not Received",
      }, {
        ID: 2,
        Txt: "Incomplete",
      }, {
        ID: 3,
        Txt: "Complete",
      },
    ],
    countrys: [ //
      // {
      //   ID: "CAN",
      //   Txt: "Canada",
      // },
      {
        ID: "USA",
        Txt: "United States of America",
      },
    ],
    recruitCohabbitTypes: [ //
      {
        ID: 1,
        Txt: "Single",
      }, {
        ID: 2,
        Txt: "Cohabbit",
      }, {
        ID: 3,
        Txt: "Off Site",
      },
    ],



    // colors from pages 37 & 38 of http://www.fbi.gov/about-us/cjis/fingerprints_biometrics/guidelines-for-preparation-of-fingerprint-cards-and-association-criminal-history-information
    eyeColors: [ //
      {
        ID: "BLK",
        Txt: "Black",
      }, {
        ID: "BLU",
        Txt: "Blue",
      }, {
        ID: "BRO",
        Txt: "Brown",
      }, {
        ID: "GRY",
        Txt: "Gray",
      }, {
        ID: "GRN",
        Txt: "Green",
      }, {
        ID: "HAZ",
        Txt: "Hazel",
      }, {
        ID: "MAR",
        Txt: "Maroon",
      }, {
        ID: "DIC",
        Txt: "Dichromatic (two different colors)",
      },
    ],
    hairColors: [ //
      {
        ID: "BLD",
        Txt: "Bald",
      }, {
        ID: "BLK",
        Txt: "Black",
      }, {
        ID: "BLN",
        Txt: "Blonde (or strawberry)",
      }, {
        ID: "BLU",
        Txt: "Blue",
      }, {
        ID: "BRO",
        Txt: "Brown",
      }, {
        ID: "GRY",
        Txt: "Gray (or partially gray)",
      }, {
        ID: "GRN",
        Txt: "Green",
      }, {
        ID: "ONG",
        Txt: "Orange",
      }, {
        ID: "PLE",
        Txt: "Purple",
      }, {
        ID: "PNK",
        Txt: "Pink",
      }, {
        ID: "RED (or auburn)",
        Txt: "Red",
      }, {
        ID: "SDY",
        Txt: "Sandy",
      }, {
        ID: "WHI",
        Txt: "White",
      },
    ],
  };

  return hrcache;
});
