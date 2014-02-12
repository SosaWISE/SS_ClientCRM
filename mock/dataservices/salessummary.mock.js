define('mock/dataservices/salessummary.mock', [
  'src/dataservice',
  'src/core/mockery',
  'src/core/utils',
], function(
  dataservice,
  mockery,
  utils
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
        if (!err && result && utils.isFunc(setter)) {
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

    dataservice.salessummary.pointsystems.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = pointsystems;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.salessummary.cellulartypes.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = cellulartypes;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.salessummary.vendoralarmcompacakges.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = vendoralarmcompacakges;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.salessummary.contractlengthsget.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = contractlengthsget;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.salessummary.frequentlyinstalledequipmentget.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = frequentlyinstalledequipmentget;
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
    contractlengthsget,
    frequentlyinstalledequipmentget;

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

  frequentlyinstalledequipmentget = [
    {
      "ItemID": "EQPM_INVT126",
      "ItemTypeId": "EQPM_INVT",
      "TaxOptionId": "TAX",
      "ItemFKID": "126",
      "ItemSKU": "GEC-13553 ",
      "ItemDesc": "HARDWIRE & WIRELESS TAKEOVER TRANSFORMER ",
      "Price": 0,
      "Cost": 0,
      "SystemPoints": 0,
      "IsCatalogItem": true,
      "IsActive": true,
      "IsDeleted": false
    },
    {
      "ItemID": "EQPM_INVT128",
      "ItemTypeId": "EQPM_INVT",
      "TaxOptionId": "TAX",
      "ItemFKID": "128",
      "ItemSKU": "GEC-TX4014012 ",
      "ItemDesc": "KEYCHAIN REMOTE ",
      "Price": 0,
      "Cost": 0,
      "SystemPoints": 1,
      "IsCatalogItem": true,
      "IsActive": true,
      "IsDeleted": false
    },
    {
      "ItemID": "EQPM_INVT131",
      "ItemTypeId": "EQPM_INVT",
      "TaxOptionId": "TAX",
      "ItemFKID": "131",
      "ItemSKU": "GEC-6080795R ",
      "ItemDesc": "MOTION ",
      "Price": 0,
      "Cost": 0,
      "SystemPoints": 2,
      "IsCatalogItem": true,
      "IsActive": true,
      "IsDeleted": false
    },
    {
      "ItemID": "EQPM_INVT132",
      "ItemTypeId": "EQPM_INVT",
      "TaxOptionId": "TAX",
      "ItemFKID": "132",
      "ItemSKU": "GEC-6063995ROD ",
      "ItemDesc": "OUTDOOR MOTION ",
      "Price": 0,
      "Cost": 0,
      "SystemPoints": 2,
      "IsCatalogItem": true,
      "IsActive": true,
      "IsDeleted": false
    },
    {
      "ItemID": "EQPM_INVT133",
      "ItemTypeId": "EQPM_INVT",
      "TaxOptionId": "TAX",
      "ItemFKID": "133",
      "ItemSKU": "GEC-TX1510011 ",
      "ItemDesc": "RECESSED DOOR/WINDOW ",
      "Price": 0,
      "Cost": 0,
      "SystemPoints": 1,
      "IsCatalogItem": true,
      "IsActive": true,
      "IsDeleted": false
    },
    {
      "ItemID": "EQPM_INVT139",
      "ItemTypeId": "EQPM_INVT",
      "TaxOptionId": "TAX",
      "ItemFKID": "139",
      "ItemSKU": "GEC-60899 ",
      "ItemDesc": "SIMONXT TRANSFORMER ",
      "Price": 0,
      "Cost": 0,
      "SystemPoints": 0,
      "IsCatalogItem": true,
      "IsActive": true,
      "IsDeleted": false
    }
  ];

  return mock;
});
