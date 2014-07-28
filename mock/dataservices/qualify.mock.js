define('mock/dataservices/qualify.mock', [
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

    dataservice.qualify.salesrep.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(salesreps, 'CompanyID', id);
          break;
      }
      send(0, result, setter, cb);
    };



    dataservice.qualify.addressValidation.post = function(path, data, setter, cb) {
      send(0, mockery.fromTemplate({
        AddressID: '@INC(addresss)',
        DealerId: data.DealerId,
        StreetAddress: (data.StreetAddress || '').toUpperCase(),
        StreetAddress2: data.StreetAddress2 ? data.StreetAddress2.toUpperCase() : null,
        City: data.City || 'Orem',
        StateId: data.State || 'UT',
        PostalCode: data.PostalCode,
        County: data.County || 'Grand County',
        PhoneNumber: data.PhoneNumber,
        Latitude: 0,
        Longitude: 0,
        Validated: true,
        SalesRepId: data.SalesRepId,
        SeasonId: data.SeasonId,
        TeamLocationId: data.TeamLocationId,
        TimeZoneId: data.TimeZoneId || 8,
        TimeZone: data.TimeZone || 'TimeZoneGoesHere',

        // IsActive: false,
        // ModifiedOn: '0001-01-01T00:00:00',
        // ModifiedBy: null,
        // CreatedOn: '0001-01-01T00:00:00',
        // CreatedBy: null


        // //
        // // manual
        // //
        // // ValidationVendorId
        // // AddressValidationStateId
        // // CountryId
        // // AddressTypeId
        // PlusFour: data.PlusFour || '1234',
        StreetNumber: data.StreetNumber || '123',
        StreetName: data.StreetName || 'Street Name',
        StreetType: data.StreetType || 30 || 'RD',
        PreDirectional: data.PreDirectional || 1 || 'N',
        PostDirectional: data.PostDirectional || 4 || 'W',
        Extension: data.Extension,
        ExtensionNumber: data.ExtensionNumber,
        // // CountyCode
        // // Urbanization
        // // UrbanizationCode
        // // DeliveryPoint
        // // Latitude
        // // Longitude
        // // CongressionalDistric
        // // DPV
        DPVResponse: data.DPVResponse,
        // // DPVFootnote
        CarrierRoute: data.CarrierRoute,
        // // IsDeleted
      }), setter, cb);
    };


    dataservice.qualify.runcredit.post = function(path, data, setter, cb) {
      // data = {
      //   LeadId: '',
      //   AddressId: '',
      //   CustomerTypeId: '',
      //   CustomerMasterFileId: '',
      //   DealerId: '',
      //   LocalizationId: '',
      //   LeadSourceId: '',
      //   LeadDispositionId: '',
      //   LeadDispositionDateChange: '',
      //   Salutation: '',
      //   FirstName: '',
      //   MiddleName: '',
      //   LastName: '',
      //   Suffix: '',
      //   Gender: '',
      //   SSN: '',
      //   DOB: '',
      //   Dl: '',
      //   DlStateId: '',
      //   Email: '',
      //   PhoneHome: '',
      //   PhoneWork: '',
      //   PhoneMobile: '',
      // };

      var valid =
        data.AddressId &&
        data.FirstName &&
        data.LastName;

      send(valid ? 0 : 1, mockery.fromTemplate({
        CreditReportID: 1,
        LeadId: 1,
        BureauId: 1,
        BureauName: 'BureauName',
        SeasonId: 1,
        CreditReportVendorId: 1,
        CreditReportVendorAbaraId: 1,
        CreditReportVendorMicrobiltId: 1,
        CreditReportVendorEasyAccessId: 1,
        CreditReportVendorManualId: 1,
        Score: '@CREDIT_SCORE', //678,
        IsScored: '@CREDIT_SCORED', //true,
        IsHit: '@CREDIT_SCORE_HIT', //true,
        CreditGroup: '@CREDIT_GROUP',

        // IsActive: true,
        // IsDeleted: false,
        // CreatedBy: 'bbobbins',
        // CreatedOn: 'today',
      }), setter, cb);
    };

    dataservice.qualify.qualifyCustomerInfos.read = function(params, setter, cb) {
      send(0, mockery.fromTemplate({
        LeadID: (params.link === 'lead') ? params.id : '@NUMBER(1,7)', // long
        SeasonId: '@NUMBER(1,7)', // int
        CustomerName: '@NAME', // string
        CustomerEmail: '@EMAIL', // string
        AddressID: '@NUMBER(1,7)', // long
        StreetAddress: '@NUMBER(1000,2000) @LASTNAME Rd', // string
        StreetAddress2: '#@NUMBER(10,100)', // string
        City: '@LASTNAME()ton', // string
        StateId: 'UT', // string
        County: '@LASTNAME County', // string
        TimeZoneId: '@NUMBER(1,9)', // int
        TimeZoneName: 'TimeZoneName', // string
        PostalCode: '@NUMBER(10000,99999)', // string
        Phone: '@PHONE', // string
        CreditReportID: '@NUMBER(1,7)', // long
        CRStatus: 'CRStatus', // string
        Score: '@NUMBER(500,850)', // int
        BureauName: 'BureauName', // string
        UserID: null, // int
        CompanyID: 'CompanyID', // string
        FirstName: 'FirstName', // string
        MiddleName: 'MiddleName', // string
        LastName: 'LastName', // string
        PreferredName: 'PreferredName', // string
        RepEmail: 'RepEmail', // string
        PhoneCell: 'PhoneCell', // string
        PhoneCellCarrierID: 'PhoneCellCarrierID', // short?
        PhoneCellCarrier: 'PhoneCellCarrier', // string
        SeasonName: 'SeasonName', // string
      }), setter, cb);
    };
  }

  (function() {
    mockery.addModulusValueFunc('COMPANYID', [
      'SOSA001',
      'SHUM001',
      'BOBB001',
    ]);

    mockery.fn.CREDIT_SCORE = [
      500,
      610,
      630,
      700,
      null,
    ];
    mockery.fn.CREDIT_SCORED = function(cache) {
      return !!cache.CREDIT_SCORE;
    };
    mockery.fn.CREDIT_SCORE_HIT = function(cache) {
      return !!cache.CREDIT_SCORE;
    };
    mockery.fn.CREDIT_GROUP = function(cache) {
      var score = cache.CREDIT_SCORE,
        result;
      if (!score) {
        result = '';
      } else if (score >= 650) {
        result = 'Excellent';
      } else if (score >= 625) {
        result = 'Good';
      } else if (score >= 600) {
        result = 'Sub';
      } else {
        result = 'Poor';
      }
      return result;
    };
  })();

  // data used in mock functions
  var salesreps,
    addresss;

  salesreps = mockery.fromTemplate({
    'list|3-3': [ //
      {
        CompanyID: '@COMPANYID',
        ImagePath: '@IMG(100,100,people)',
        FirstName: '@MNAME',
        LastName: '@LASTNAME',
        Seasons: [ //
          {
            SeasonID: '@INC(seasons)',
            SeasonName: '@SEASON @NUMBER(2012,2015,Year)',
          },
        ],
        PhoneCell: '@PHONE',
        Email: '@EMAIL',
        TeamLocationId: '@INC(teamLocations)',
      },
    ],
  }).list;

  addresss = [];

  return mock;
});
