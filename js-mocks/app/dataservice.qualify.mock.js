define('mock/app/dataservice.qualify.mock', [
  'src/mocker',
  'src/dataservice.qualify'
], function(
  mocker,
  QualifyDataservice
) {
  "use strict";

  return function(settings) {
    QualifyDataservice.prototype.salesRepRead = function(data, cb) {
      setTimeout(function() {
        var resp = mocker.fromTemplate({
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

        cb(resp);
      }, settings.timeout);
    };
    QualifyDataservice.prototype.validateAddress = function(data, cb) {
      setTimeout(function() {
        var resp = mocker.fromTemplate({
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

        cb(resp);
      }, settings.timeout);
    };
  };
});
