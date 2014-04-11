define('mock/dataservices/salessummary.mock', [
  'src/dataservice',
  'src/core/mockery',
], function(
  dataservice,
  mockery
) {
  "use strict";

  function mock(settings) {
    function send(code, value, setter, cb, timeout) {
      mockery.send(code, value, setter, cb, timeout || settings.timeout);
    }

    dataservice.salessummary.pointSystems.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = pointSystems;
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.salessummary.cellularTypes.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = cellularTypes;
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.salessummary.vendorAlarmcomPacakges.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = vendorAlarmcomPacakges;
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.salessummary.contractLengthsGet.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = contractLengthsGet;
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.salessummary.frequentlyInstalledEquipmentGet.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = frequentlyInstalledEquipmentGet;
          break;
      }
      send(0, result, setter, cb);
    };
  }

  (function() {
    // mockery.random = Math.random;

    mockery = mockery; // remove me
    // mockery.addModulusValueFunc('ASDF', [
    // ]);

    mockery.addModulusValueFunc('CELLULAR_TYPE_ID', [
      'CELLPRI',
      'CELLSEC',
      'CELLTRKR',
      'NOCELL',
    ]);
    mockery.addModulusValueFunc('CELLULAR_TYPE_NAME', [
      'Cell Primary',
      'Cell Backup',
      'Cell Tracker',
      'No Cellular',
    ]);
  })();

  // data used in mock function
  var pointSystems,
    // activationfees,
    // surveytypes,
    cellularTypes,
    vendorAlarmcomPacakges,
    // equipmentbypointsget,
    contractLengthsGet,
    frequentlyInstalledEquipmentGet,
    invoiceMsIsntalls;

  pointSystems = [
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

  cellularTypes = mockery.fromTemplate({
    'list|4-4': [
      {
        CellularTypeID: '@CELLULAR_TYPE_ID',
        CellularTypeName: '@CELLULAR_TYPE_NAME',
      },
    ]
  }).list;

  vendorAlarmcomPacakges = [
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

  contractLengthsGet = [
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

  frequentlyInstalledEquipmentGet = [
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

  invoiceMsIsntalls = [
    {
      "InvoiceID": 10010064,
      "AccountId": 100212,
      "ActivationFeeItemId": "SETUP_FEE_199",
      "ActivationFee": 199,
      "ActivationFeeActual": 199,
      "MonthlyMonitoringRateItemId": "MON_CONT_5000",
      "MonthlyMonitoringRateActual": 39.95,
      "MonthlyMonitoringRate": 39.95,
      "AlarmComPackageId": "WRLFWN",
      "Over3Months": false,
      "CellularTypeId": null,
      "ContractTemplateId": 1
    }
  ];

  return mock;
});
