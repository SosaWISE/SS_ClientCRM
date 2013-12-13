define('mock/app/dataservice.qualify.mock', [
  'mock/mockery',
  'src/dataservice.qualify'
], function(
  mockery,
  QualifyDataservice
) {
  "use strict";

  return function(settings) {
    QualifyDataservice.prototype.saveCustomer = function(data, cb) {
      setTimeout(function() {
        var resp = mockery.fromTemplate({
          Code: 0,
          Message: '',
          Value: {
            LeadID: data.LeadID || '@INC(lead)',
            SalesRepID: data.SalesRepID,
            Salutation: data.Salutation,
            FirstName: data.FirstName,
            MiddleName: data.MiddleName,
            LastName: data.LastName,
            Suffix: data.Suffix,
            SSN: data.SSN,
            DOB: data.DOB,
            Email: data.Email,
          },
        });

        cb(null, resp);
      }, settings.timeout);
    };
    QualifyDataservice.prototype.salesRepRead = function(data, cb) {
      setTimeout(function() {
        var resp = mockery.fromTemplate({
          Code: 0,
          Message: '',
          Value: {
            SalesRepID: data.SalesRepID,
            img: '@IMG(100,100,people)',
            fullname: '@FULLNAME',
            season: '@SEASON @DATE_YYYY',
            office: 'Tampa 1',
            phone: '@PHONE',
            email: '@EMAIL',
          },
        });

        cb(null, resp);
      }, settings.timeout);
    };
    QualifyDataservice.prototype.validateAddress = function(data, cb) {
      setTimeout(function() {
        var resp = mockery.fromTemplate({
          Code: 0,
          Message: '',
          Value: {
            'AddressID': '@INC(address)',
            DealerId: data.DealerId,
            // ValidationVendorId
            // AddressValidationStateId
            StateId: 'UT',
            // CountryId
            // TimeZoneId
            // AddressTypeId
            StreetAddress: (data.StreetAddress || '').toUpperCase(),
            StreetAddress2: (data.StreetAddress2 || '').toUpperCase(),
            // StreetNumber
            // StreetName
            // StreetType
            // PreDirectional
            // PostDirectional
            // Extension
            // ExtensionNumber
            // County
            // CountyCode
            // Urbanization
            // UrbanizationCode
            City: 'Orem',
            PostalCode: data.PostalCode,
            // PlusFour
            Phone: data.Phone,
            // DeliveryPoint
            // Latitude
            // Longitude
            // CongressionalDistric
            // DPV
            // DPVResponse
            // DPVFootnote
            // CarrierRoute
            // IsActive
            // IsDeleted
            // CreatedBy
            // CreatedOn
          },
        });

        cb(null, resp);
      }, settings.timeout);
    };
    QualifyDataservice.prototype.runCredit = function(data, cb) {
      setTimeout(function() {
        var resp, code, msg;
        if (!data.AddressId || !data.LeadId) {
          code = 1;
          msg = 'Missing AddressId or LeadId';
        } else {
          code = 0;
          msg = '';
        }

        resp = mockery.fromTemplate({
          Code: 0,
          Message: '',
          Value: {
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
            IsActive: true,
            IsDeleted: false,
            CreatedBy: 'bbobbins',
            CreatedOn: 'today',
          },
        });

        cb(null, resp);
      }, settings.timeout);
    };
  };
});
