define('mock/dataservice.accountingengine.mock', [
  'src/dataservice',
  'src/core/mockery',
], function(
  dataservice,
  mockery
) {
  "use strict";

  function mock(settings) {
    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function send(value, setter, cb, timeout) {
      var err, result;
      if (value) {
        value = clone(value);
      }
      if (false && !value) {
        err = {
          Code: 12345,
          Message: 'No value',
          Value: null,
        };
      } else {
        result = {
          Code: 0,
          Message: 'Success',
          Value: value,
        };
      }

      setTimeout(function() {
        if (!err && result && typeof(setter) === 'function') {
          setter(result.Value);
        }
        cb(err, result);
      }, timeout || settings.timeout);
    }

    // function filterListBy(list, propName, id) {
    //   return list.filter(function(item) {
    //     return item[propName] === id;
    //   });
    // }

    // function findSingleBy(list, propName, id) {
    //   return list.filter(function(item) {
    //     return item[propName] === id;
    //   })[0];
    // }

    // function findSingleOrAll(list, propName, id) {
    //   var result;
    //   if (id > 0) {
    //     result = findSingleBy(list, propName, id);
    //   } else {
    //     result = list;
    //   }
    //   return result;
    // }

    dataservice.accountingengine.pointsystems.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = pointsystems;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.cellulartypes.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = cellulartypes;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.vendoralarmcompacakges.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = vendoralarmcompacakges;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.contractlengthsget.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = contractlengthsget;
          break;
      }
      send(result, setter, cb);
    };
  }

  (function() {
    // mockery.random = Math.random;

    mockery = mockery; // remove me
    // mockery.addModulusValueFunc('ASDF', [
    // ]);
  })();

  // data used in mock function
  var pointsystems,
    // activationfees,
    // surveytypes,
    cellulartypes,
    vendoralarmcompacakges,
    // equipmentbypointsget,
    contractlengthsget;

  pointsystems = [
    {
      InvoiceTemplateID: 1,
      DealerId: 5000,
      ActivationItemId: "SETUP_FEE_199",
      ActivationDiscountItemId: "SREP_DISC_SETUP",
      MMRItemId: "MON_CONT_5000",
      MMRDiscountItemId: "SREP_DISC",
      ActivationOverThreeMonthsId: "MON_CONT_3MOS",
      TemplateName: "8 Point System with Alarm.com",
      ActivationDiscountAmount: 0,
      MMRDiscountAmount: 0,
      SystemPoints: 8
    },
    {
      InvoiceTemplateID: 2,
      DealerId: 5000,
      ActivationItemId: "SETUP_FEE_99",
      ActivationDiscountItemId: "SREP_DISC_SETUP",
      MMRItemId: "MON_CONT_5000",
      MMRDiscountItemId: "SREP_DISC",
      ActivationOverThreeMonthsId: "MON_CONT_3MOS",
      TemplateName: "6.5 Point System with Alarm.com",
      ActivationDiscountAmount: 0,
      MMRDiscountAmount: 0,
      SystemPoints: 6.5
    }
  ];

  cellulartypes = [
    {
      "CellularTypeID": "CELLPRI",
      "CellularTypeName": "Cell Primary"
    },
    {
      "CellularTypeID": "CELLSEC",
      "CellularTypeName": "Cell Backup"
    },
    {
      "CellularTypeID": "CELLTRKR",
      "CellularTypeName": "Cell Tracker"
    },
    {
      "CellularTypeID": "NOCELL",
      "CellularTypeName": "No Cellular"
    }
  ];

  vendoralarmcompacakges = [
    {
      "AlarmComPackageID": "ADVINT",
      "PackageName": "Advanced Interactive",
      "DefaultValue": false
    },
    {
      "AlarmComPackageID": "BSCINT",
      "PackageName": "Basic Interactive",
      "DefaultValue": false
    },
    {
      "AlarmComPackageID": "WRLFWN",
      "PackageName": "Wireless Forwarding",
      "DefaultValue": true
    }
  ];

  contractlengthsget = [
    {
      "ContractTemplateID": 1,
      "ContractName": "Full Contract 3 Years",
      "ContractLength": 36,
      "MonthlyFee": 45,
      "ShortDesc": "Full 3 year contract that converts to month to month after that.",
      "IsActive": false,
      "IsDeleted": false,
      "ModifiedOn": "2014-01-08T14:03:02.9517605-07:00",
      "ModifiedBy": "",
      "CreatedOn": "2014-01-08T14:03:02.9517605-07:00",
      "CreatedBy": "",
      "DEX_ROW_TS": "1900-01-01T00:00:00"
    },
    {
      "ContractTemplateID": 2,
      "ContractName": "Full Contract 5 Years",
      "ContractLength": 60,
      "MonthlyFee": 45,
      "ShortDesc": "Full 5 year contract that convert to a month to month after that.",
      "IsActive": false,
      "IsDeleted": false,
      "ModifiedOn": "2014-01-08T14:03:02.9517605-07:00",
      "ModifiedBy": "",
      "CreatedOn": "2014-01-08T14:03:02.9517605-07:00",
      "CreatedBy": "",
      "DEX_ROW_TS": "1900-01-01T00:00:00"
    }
  ];

  return mock;
});
