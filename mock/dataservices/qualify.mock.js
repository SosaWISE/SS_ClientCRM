define('mock/dataservices/qualify.mock', [
  'src/core/mockery',
  'src/dataservice'
], function(
  mockery,
  dataservice
) {
  "use strict";

  function mock(settings) {
    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function send(code, value, setter, cb, timeout) {
      var err, result;
      if (value) {
        value = clone(value);
      }

      result = {
        Code: code,
        Message: code ? ('Error Code ' + code) : 'Success',
        Value: value,
      };

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

    function findSingleBy(list, propName, id) {
      return list.filter(function(item) {
        return item[propName] === id;
      })[0];
    }

    function findSingleOrAll(list, propName, id) {
      var result;
      if (id > 0 || (typeof(id) === 'string' && id.length)) {
        result = findSingleBy(list, propName, id);
      } else {
        result = list;
      }
      return result;
    }
    dataservice.qualify.salesrep.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(salesreps, 'SalesRepID', id);
          break;
      }
      send(0, result, setter, cb);
    };



    dataservice.qualify.addressValidation.post = function(path, data, setter, cb) {
      send(0, mockery.fromTemplate({
        AddressID: '@INC(addresss)',
        DealerId: data.DealerId,
        Address: (data.StreetAddress || '').toUpperCase(),
        Address2: (data.StreetAddress2 || '').toUpperCase(),
        City: data.City || 'Orem',
        State: data.State || 'UT',
        PostalCode: data.PostalCode,
        County: data.County || 'Grand County',
        PhoneNumber: data.PhoneNumber,
        Latitude: 0,
        Longitude: 0,
        Validated: true,
        SalesRepId: data.SalesRepId,
        SeasonId: data.SeasonId,
        TeamLocationId: data.TeamLocationId,

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
        // TimeZoneId: data.TimeZoneId || 1,
        // // AddressTypeId
        // PlusFour: data.PlusFour || '1234',
        // StreetNumber: data.StreetNumber || '123',
        // StreetName: data.StreetName || 'Street Name',
        // StreetType: data.StreetType || 'RD',
        // PreDirectional: data.PreDirectional || 'N',
        // PostDirectional: data.PostDirectional || 'W',
        // Extension: data.Extension,
        // ExtensionNumber: data.ExtensionNumber,
        // // CountyCode
        // // Urbanization
        // // UrbanizationCode
        // // DeliveryPoint
        // // Latitude
        // // Longitude
        // // CongressionalDistric
        // // DPV
        // DPVResponse: data.DPVResponse,
        // // DPVFootnote
        // CarrierRoute: data.CarrierRoute,
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
        SeasonId: 1,
        CreditReportVendorId: 1,
        CreditReportVendorAbaraId: 1,
        CreditReportVendorMicrobiltId: 1,
        CreditReportVendorEasyAccessId: 1,
        CreditReportVendorManualId: 1,
        Score: 678,
        IsScored: true,
        IsHit: true,

        // IsActive: true,
        // IsDeleted: false,
        // CreatedBy: 'bbobbins',
        // CreatedOn: 'today',
      }), setter, cb);
    };
  }

  (function() {
    mockery.addModulusValueFunc('COMPANYID', [
      'SOSA001',
      'SHUM001',
      'BOBB001',
    ]);
  })();

  // data used in mock functions
  var salesreps,
    addresss;

  salesreps = mockery.fromTemplate({
    'list|3-3': [
      {
        SalesRepID: '@COMPANYID',
        // CompanyID: '@COMPANYID',
        ImagePath: '@IMG(100,100,people)',
        FirstName: '@MNAME',
        LastName: '@LASTNAME',
        Seasons: [
          {
            SeasonName: '@SEASON @DATE_YYYY',
          },
        ],
        PhoneCell: '@PHONE',
        Email: '@EMAIL',
      },
    ],
  }).list;

  addresss = [];

  return mock;
});
