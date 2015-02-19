define("src/hr/hr-cache", [
  "src/dataservice",
  "ko",
  "src/core/cacher",
], function(
  dataservice,
  ko,
  cacher
) {
  "use strict";

  var prefix = "hr-",
    hrcache, hardcodedCache;

  hrcache = {
    getList: function(name) {
      return hardcodedCache[name] || cacher.getList(prefix + name);
    },
    getMap: function(name) {
      return cacher.getMap(prefix + name);
    },
    ensure: function(name, cb) {
      if (hardcodedCache[name]) {
        setTimeout(function() {
          cb();
        }, 0);
        return;
      }
      switch (name) {
        case "payscales":
          ensureType(name, "PayscaleID", cb);
          break;
        case "phoneCellCarriers":
          ensureType(name, "PhoneCellCarrierID", cb);
          break;
        case "roleLocations":
          ensureType(name, "RoleLocationID", cb);
          break;
        case "schools":
          ensureType(name, "SchoolID", cb);
          break;
        case "seasons":
          ensureType(name, "SeasonID", cb);
          break;
        case "teams":
          ensureType(name, "TeamID", cb);
          break;
        case "teamLocations":
          ensureType(name, "TeamLocationID", cb);
          break;
        case "userEmployeeTypes":
          ensureType(name, "UserEmployeeTypeID", cb);
          break;
        case "userTypes":
          ensureType(name, "UserTypeID", cb);
          break;
        default:
          throw new Error(name + " not implemented");
      }
    },
  };

  function ensureType(type, idName, cb) {
    cacher.ensure(cb, prefix + type, idName, function(cb) {
      dataservice.hr[type].read({}, null, cb);
    });
  }

  hardcodedCache = {
    shirtSizes: ko.observableArray([ //
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
    ]),
    hatSizes: ko.observableArray([ //
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
    ]),
    sexs: ko.observableArray([ //
      {
        ID: 1,
        Txt: "Male"
      }, {
        ID: 2,
        Txt: "Female"
      },
    ]),
    maritalStatuses: ko.observableArray([ //
      {
        ID: false,
        Txt: "Single"
      }, {
        ID: true,
        Txt: "Married"
      },
    ]),

    docStatuses: ko.observableArray([ //
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
    ]),
    countrys: ko.observableArray([ //
      // {
      //   ID: "CAN",
      //   Txt: "Canada",
      // },
      {
        ID: "USA",
        Txt: "United States of America",
      },
    ]),
    recruitCohabbitTypes: ko.observableArray([ //
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
    ]),



    // colors from pages 37 & 38 of http://www.fbi.gov/about-us/cjis/fingerprints_biometrics/guidelines-for-preparation-of-fingerprint-cards-and-association-criminal-history-information
    eyeColors: ko.observableArray([ //
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
    ]),
    hairColors: ko.observableArray([ //
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
    ]),
  };

  return hrcache;
});
