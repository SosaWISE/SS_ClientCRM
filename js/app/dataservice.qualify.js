define('src/dataservice.qualify', [
  'src/core/utils',
  'src/core/dataservice.base',
  'src/config'
], function(
  utils,
  DataserviceBase,
  config
) {
  "use strict";

  function QualifyDataservice() {
    QualifyDataservice.super_.call(this, 'qualify', config.serviceDomain);
  }
  utils.inherits(QualifyDataservice, DataserviceBase);

  //
  // helper functions
  //

  //------------input-SalesRepParam-------------
  // SalesRepID                   string     (require)
  // SeasonId                     int        (require)
  // TeamLocationId               int        (require)
  //-----------result-RuSalesRep-------------
  QualifyDataservice.prototype.salesRepRead = function(data, cb) {
    this.post('SalesRepRead', data, null, cb);
  };

  /* input/results
    //------------input-AddressParam-------------
    // AddressID                    long
    // DealerId                     int        (require)
    // StreetAddress                string     (require)
    // StreetAddress2               string
    // City                         string
    // State                        string
    // PostalCode                   string     (require)
    // PhoneNumber                  string
    //-----------result-QlAddress-------------
    // AddressID
    // DealerId
    // ValidationVendorId
    // AddressValidationStateId
    // StateId
    // CountryId
    // TimeZoneId
    // AddressTypeId
    // StreetAddress
    // StreetAddress2
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
    // City
    // PostalCode
    // PlusFour
    // Phone
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
  */
  QualifyDataservice.prototype.validateAddress = function(data, cb) {
    this.post('validateAddress', data, null, cb);
  };

  //------------input-AddressParam-------------
  // AddressID                    long       (require)
  // DealerId                     int
  // StreetAddress                string
  // StreetAddress2               string
  // City                         string
  // State                        string
  // PostalCode                   string
  // PhoneNumber                  string
  //-----------result-[]QlHomeOwner-------------
  QualifyDataservice.prototype.propertyOwner = function(data, cb) {
    this.post('PropertyOwner', data, null, cb);
  };

  //------------input-LeadParam-------------
  // LeadID                       Long
  // AddressId                    Long
  // CustomerTypeId               String
  // CustomerMasterFileId         String
  // DealerId                     String
  // LocalizationId               String
  // TeamLocationId               String
  // SeasonId                     String
  // SalesRepId                   String     (required)
  // LeadSourceId                 Int
  // LeadDispositionId            Int
  // LeadDispositionDateChange    DateTime
  // Salutation                   String
  // FirstName                    String     (required)
  // MiddleName                   String
  // LastName                     String     (required)
  // Suffix                       String
  // Gender                       String     (required)
  // SSN                          String     (required 1)
  // DOB                          DateTime   (required 1)
  // DL                           String
  // DLStateID                    String
  // Email                        String
  // PhoneHome                    String     (required §)
  // PhoneWork                    String     (required §)
  // PhoneMobile                  String     (required §)
  //-----------result-QlCreditReport-------------
  QualifyDataservice.prototype.runCredit = function(data, cb) {
    this.post('RunCredit', data, null, cb);
  };

  return QualifyDataservice;
});
