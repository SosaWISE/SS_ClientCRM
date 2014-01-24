define('mock/dataservices/qualify.mock', [
  'src/core/mockery',
  'src/dataservices/qualify'
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
            StateId: data.StateId || 'UT',
            // CountryId
            TimeZoneId: data.TimeZoneId || 1,
            // AddressTypeId
            StreetAddress: (data.StreetAddress || '').toUpperCase(),
            StreetAddress2: (data.StreetAddress2 || '').toUpperCase(),
            StreetNumber: data.StreetNumber || '123',
            StreetName: data.StreetName || 'Street Name',
            StreetType: data.StreetType || 'RD',
            PreDirectional: data.PreDirectional || 'N',
            PostDirectional: data.PostDirectional || 'W',
            Extension: data.Extension,
            ExtensionNumber: data.ExtensionNumber,
            County: data.County || 'Grand County',
            // CountyCode
            // Urbanization
            // UrbanizationCode
            City: data.City || 'Orem',
            PostalCode: data.PostalCode,
            PlusFour: data.PlusFour || '1234',
            Phone: data.Phone,
            // DeliveryPoint
            // Latitude
            // Longitude
            // CongressionalDistric
            // DPV
            DPVResponse: data.DPVResponse,
            // DPVFootnote
            CarrierRoute: data.CarrierRoute,
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
