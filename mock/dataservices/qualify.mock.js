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
          if (id[0] !== 'N' && !result) {
            result = mockery.fromTemplate({
              CompanyID: id,
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
            });
            salesreps.push(result);
          }
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.qualify.addressValidation.read = function(params, setter, cb) {
      send(0, mockery.fromTemplate({
        AddressID: params.id,
        DealerId: '',
        StreetAddress: 'address 1',
        StreetAddress2: 'address 2',
        City: 'Orem',
        StateId: 'UT',
        PostalCode: '12345',
        County: 'Grand County',
        PhoneNumber: '1234567890',
        Latitude: 0,
        Longitude: 0,
        Validated: true,
        SalesRepId: null,
        SeasonId: null,
        TeamLocationId: null,
        TimeZoneId: null,
        TimeZone: 'TimeZoneGoesHere',

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
        StreetNumber: '123',
        StreetName: 'Street Name',
        StreetType: 'RD',
        PreDirectional: 'N',
        PostDirectional: 'W',
        Extension: null,
        ExtensionNumber: null,
        // // CountyCode
        // // Urbanization
        // // UrbanizationCode
        // // DeliveryPoint
        // // Latitude
        // // Longitude
        // // CongressionalDistric
        // // DPV
        DPVResponse: null,
        // // DPVFootnote
        CarrierRoute: null,
        // // IsDeleted
      }), setter, cb);
    };

    dataservice.qualify.leads.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.fromTemplate({
        LeadID: data.LeadID || '@INC(leads)',
        AddressID: data.AddressID,
        CustomerTypeId: data.CustomerTypeId,
        CustomerMasterFileId: data.CustomerMasterFileId || '@NUMBER(3000001,3000100)',
        DealerId: data.DealerId,
        LocalizationId: data.LocalizationId,
        TeamLocationId: data.TeamLocationId,
        SeasonId: data.SeasonId,
        SalesRepId: data.SalesRepId,
        LeadSourceId: data.LeadSourceId,
        LeadDispositionId: data.LeadDispositionId,
        LeadDispositionDateChange: data.LeadDispositionDateChange,
        Salutation: data.Salutation,
        FirstName: data.FirstName,
        MiddleName: data.MiddleName,
        LastName: data.LastName,
        Suffix: data.Suffix,
        Gender: data.Gender,
        SSN: data.SSN,
        DOB: data.DOB,
        DL: data.DL,
        DLStateId: data.DLStateId,
        Email: data.Email,
        PhoneWork: data.PhoneWork,
        PhoneHome: data.PhoneHome,
        PhoneMobile: data.PhoneMobile,
        ProductSkwId: data.ProductSkwId,
      }), setter, cb);
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


    dataservice.qualify.runCredit.save = function(params, setter, cb) {
      send(0, mockery.fromTemplate({
        CreditReportID: 1,
        LeadId: params.id,
        BureauId: 1,
        BureauName: 'BureauName',
        SeasonId: 1,
        CreditReportVendorId: 1,
        CreditReportVendorAbaraId: 1,
        CreditReportVendorMicrobiltId: 1,
        CreditReportVendorEasyAccessId: 1,
        CreditReportVendorManualId: 1,
        Score: '@CREDIT_SCORE',
        IsScored: '@CREDIT_SCORED',
        IsHit: '@CREDIT_SCORE_HIT',
        CreditGroup: '@CREDIT_GROUP',

        // AccountId: '',
        // DOB: '',
        // SSN: '',
        // Phone: '',
        // PhoneStatus: '',
        // AnyError: '',
        // Messages: '',
        // ReportFound: '',

        // IsActive: true,
        // IsDeleted: false,
        // CreatedBy: 'bbobbins',
        // CreatedOn: 'today',
      }), setter, cb);
    };

    dataservice.qualify.customerMasterFiles.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case 'leads':
          result = mockery.fromTemplate({
            'list|2-2': [ //
              {
                LeadID: '@INC(leads)',
                AddressId: '@INC(addresses)',
                CustomerTypeId: '@CUSTOMER_TYPE_ID',
                CustomerMasterFileId: id,
                SalesRepId: '@COMPANYID',
                Salutation: 'Mr.',
                FirstName: '@MNAME',
                MiddleName: null,
                LastName: '@LASTNAME',
                Suffix: null,
                // Gender: '',
                SSN: '@NUMBER(100-999)-@NUMBER(10-99)-@NUMBER(1000-9999)',
                DOB: '@DATE',
                Email: '@EMAIL',
                PhoneHome: null,
                PhoneWork: null,
                PhoneMobile: null,
                InsideSalesId: null,
              },
            ],
          }).list;
          break;
      }
      send(0, result, setter, cb);
    };

    dataservice.qualify.qualifyCustomerInfos.read = function(params, setter, cb) {
      send(0, mockery.fromTemplate({
        LeadID: (params.link === 'lead') ? params.id : '@NUMBER(1,7)', // long
        SeasonId: '@NUMBER(1,7)', // int
        // CustomerName: '@NAME', // string
        CustomerEmail: '@EMAIL', // string
        AddressID: '@NUMBER(1,7)', // long
        StreetAddress: '@NUMBER(1000,2000) @LASTNAME(stree) Rd', // string
        StreetAddress2: '#@NUMBER(10,100)', // string
        City: '@LASTNAME(city)ton', // string
        StateId: 'UT', // string
        County: '@LASTNAME County', // string
        TimeZoneId: '@NUMBER(1,9)', // int
        TimeZoneName: 'TimeZoneName', // string
        PostalCode: '@NUMBER(10000,99999)', // string
        Phone: '@PHONE', // string
        CreditReportID: '@NUMBER(1,7)', // long
        CRStatus: 'CRStatus', // string
        Score: '@CREDIT_SCORE',
        IsScored: '@CREDIT_SCORED',
        IsHit: '@CREDIT_SCORE_HIT',
        CreditGroup: '@CREDIT_GROUP',
        BureauName: 'BureauName', // string
        UserID: null, // int
        CompanyID: '@COMPANYID', // string
        Salutation: 'sal.',
        FirstName: '@NAME', // string
        MiddleName: '@CHAR_UPPER', // string
        LastName: '@LASTNAME', // string
        Suffix: 'suf.',
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
    mockery.addModulusValueFunc('CUSTOMER_TYPE_ID', [
      'PRI',
      'SEC',
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
        result = 'NotFound';
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
  var salesreps = [],
    addresss;

  // salesreps = mockery.fromTemplate({
  //   'list|3-3': [ //
  //     {
  //       CompanyID: '@COMPANYID',
  //       ImagePath: '@IMG(100,100,people)',
  //       FirstName: '@MNAME',
  //       LastName: '@LASTNAME',
  //       Seasons: [ //
  //         {
  //           SeasonID: '@INC(seasons)',
  //           SeasonName: '@SEASON @NUMBER(2012,2015,Year)',
  //         },
  //       ],
  //       PhoneCell: '@PHONE',
  //       Email: '@EMAIL',
  //       TeamLocationId: '@INC(teamLocations)',
  //     },
  //   ],
  // }).list;

  addresss = [];

  return mock;
});
