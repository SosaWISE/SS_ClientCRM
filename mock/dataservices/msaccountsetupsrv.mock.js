define('mock/dataservices/msaccountsetupsrv.mock', [
  'mock/dataservices/survey.mock',
  'mock/dataservices/accountingengine.mock',
  'src/dataservice',
  'src/core/mockery',
], function(
  survey_mock,
  accountingengine_mock,
  dataservice,
  mockery
) {
  'use strict';

  function mock(settings) {
    function send(code, value, setter, cb, timeout) {
      mockery.send(code, value, setter, cb, timeout || settings.timeout);
    }

    dataservice.msaccountsetupsrv.accounts.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(accounts, 'AccountID', id);
          break;
        case 'emergencyContacts':
          result = mockery.filterListBy(emergencyContacts, 'AccountId', id);
          break;
        case 'surveys':
          result = survey_mock.getAccountSurveyResultViews(id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.msaccountsetupsrv.emergencyContactPhoneTypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(emergencyContactPhoneTypes, 'PhoneTypeID', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.msaccountsetupsrv.emergencyContactRelationships.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(emergencyContactRelationships, 'RelationshipID', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.msaccountsetupsrv.systemDetails.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          if (id) {
            result = mockery.fromTemplate({
              AccountID: id,
              AccountPassword: '@SEASON@NUMBER(1,9999)',
              SystemTypeId: '@SYSTEM_TYPE_ID',
              PanelTypeId: '@PANEL_TYPE_ID',
              CellularTypeId: '@CELLULAR_TYPE_ID',
              DslSeizureId: '@DSLSEIZURE_TYPE_ID',
            });
          } else {
            result = null;
          }
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.msaccountsetupsrv.serviceTypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(systemTypes, 'SystemTypeID', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.msaccountsetupsrv.panelTypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(panelTypes, 'PanelTypeID', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.msaccountsetupsrv.dslSeizureTypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(dslSeizureTypes, 'DslSeizureID', id);
          break;
      }
      send(0, result, setter, cb);
    };


    dataservice.msaccountsetupsrv.accounts.post = function(path, data, setter, cb) {
      var billingInfoSummary = accountingengine_mock.addAccount('@INC(customerMasterFile)');

      //@TODO: needs more Id's set
      send(0, mockery.fromTemplate({
        AccountID: billingInfoSummary.AccountId,
        LeadId: data.leadId,
        CustomerId: 0,
        CustomerMasterFileId: billingInfoSummary.CustomerMasterFileId,
        IndustryAccountId: 0,
        SystemTypeId: 0,
        CellularTypeId: 0,
        PanelTypeId: 0,
        PanelItemId: 0,
        CellPackageItemId: 0,
        ContractTemplateId: 0,
      }), setter, cb);
    };
    dataservice.msaccountsetupsrv.emergencyContacts.save = function(params, setter, cb) {
      var data = params.data;
      send(0, mockery.createOrUpdate(emergencyContacts, 'EmergencyContactID', '@INC(emergencyContacts)', {
        EmergencyContactID: data.EmergencyContactID,
        CustomerId: data.CustomerId || null,
        AccountId: data.AccountId || null,
        RelationshipId: data.RelationshipId || null,
        OrderNumber: data.OrderNumber,
        Allergies: data.Allergies,
        MedicalConditions: data.MedicalConditions,
        HasKey: data.HasKey,
        DOB: data.DOB,
        Prefix: data.Prefix,
        FirstName: data.FirstName,
        MiddleName: data.MiddleName,
        LastName: data.LastName,
        Postfix: data.Postfix,
        Email: data.Email,
        Password: data.Password,
        Phone1: data.Phone1,
        Phone1TypeId: data.Phone1TypeId || null,
        Phone2: data.Phone2,
        Phone2TypeId: data.Phone2TypeId || null,
        Phone3: data.Phone3,
        Phone3TypeId: data.Phone3TypeId || null,
        Comment1: data.Comment1,
      }), setter, cb);
    };
    dataservice.msaccountsetupsrv.emergencyContacts.del = function(id, setter, cb) {
      send(0, mockery.deleteItem(emergencyContacts, 'EmergencyContactID', id), setter, cb);
    };


    dataservice.msaccountsetupsrv.systemDetails.save = function(params, setter, cb) {
      var result, data = params.data;
      result = {
        AccountID: data.AccountID,
        AccountPassword: data.AccountPassword || null,
        SystemTypeId: data.SystemTypeId || null,
        PanelTypeId: data.PanelTypeId || null,
        CellularTypeId: data.CellularTypeId || null,
        DslSeizureId: data.DslSeizureId || null,
      };
      send(0, result, setter, cb);
    };
  }

  (function() {
    mockery.addModulusValueFunc('MS_PHONE_TYPE', [
      'C',
      'U',
      'F',
      'H',
      'P',
      'W',
    ]);
    mockery.addModulusValueFunc('PHONE_DESC', [
      'Cell or mobile',
      'Unknown',
      'Fax',
      'Home',
      'Pager',
      'Work or office',
    ]);
    mockery.addModulusValueFunc('REL_DESC', [
      'Aide', 'AlarmCo', 'Aunt', 'Brother', 'Brother-In-Law', 'Call List', 'Caregiver', 'Caseworker',
      'Clergy', 'Cousin', 'Daughter', 'Daughter & Son-In-Law', 'Daughter-In-Law', 'Director', 'Doctor/Physician',
      'Employee', 'Facility', 'Family', 'Father', 'Father-In-Law', 'Friend', 'Front Desk', 'Grand daughter',
      'Grand daughter & Husband', 'Grand son', 'Grandchild', 'Home Health', 'Hospice', 'Housekeeper', 'In-Law',
      'Landlord', 'Lawyer', 'Manager', 'Mother', 'Mother-In-Law', 'Neighbor', 'Nephew', 'Niece', 'Niece/Nephew',
      'Nurse', 'Office', 'Other', 'Owner', 'Parents', 'Partner', 'Pastor', 'POA', 'Property Mgr', 'Relative',
      'Roommate', 'Secretary', 'Security', 'Self', 'Service Tech', 'Sister', 'Sister-In-Law', 'Son',
      'Son & Daughter-In-Law', 'Son-In-Law', 'Spouse', 'Supervisor', 'Uncle',
    ]);


    mockery.addModulusValueFunc('SYSTEM_TYPE_ID', [
      '2WAY',
      'DIGI',
      'GPSC',
      'GPST',
    ]);
    mockery.addModulusValueFunc('SYSTEM_TYPE_NAME', [
      'Two Way',
      'Digital',
      'GPS Cellular',
      'GPS Tracker',
    ]);

    mockery.addModulusValueFunc('PANEL_TYPE_ID', [
      'CONCORD',
      'LYNX',
      'PERS',
      'PERS-A',
      'PERS-C',
      'PERS-E',
      'PERS-M',
      'PERS-P',
      'SIMON',
      'VISTA',
    ]);
    mockery.addModulusValueFunc('PANEL_TYPE_NAME', [
      'Concord',
      'Lynx',
      'PERS Unit',
      'PERS Automobile Unit',
      'PERS Child Unit',
      'PERS Exercise Unit',
      'PERS Medical Unit',
      'PERS Pet Unit',
      'Simon III',
      'Vista',
    ]);

    mockery.addModulusValueFunc('DSLSEIZURE_TYPE_ID', [1, 2, 3]);
    mockery.addModulusValueFunc('DSLSEIZURE_TYPE_NAME', ['No', 'DSL', 'Yes']);
  })();

  // data used in mock function
  var accounts,
    emergencyContacts,
    emergencyContactPhoneTypes,
    emergencyContactRelationships,
    systemTypes,
    panelTypes,
    dslSeizureTypes;

  accounts = [];

  emergencyContactPhoneTypes = mockery.fromTemplate({
    'list|6-6': [
      {
        PhoneTypeID: '@INC(emergencyContactPhoneTypes)',
        PhoneTypeDescription: '@PHONE_DESC',
        MonitoringStationOSId: 'AG_GPSTRACK',
        MsPhoneTypeId: '@MS_PHONE_TYPE',
      },
    ]
  }).list;
  emergencyContactRelationships = mockery.fromTemplate({
    'list|62-62': [
      {
        RelationshipID: '@INC(emergencyContactRelationships)',
        RelationshipDescription: '@REL_DESC',
        MonitoringStationOSId: 'AG_GPSTRACK',
        MsRelationshipId: '@REL_DESC',
        IsEVC: false,
      },
    ]
  }).list;

  emergencyContacts = mockery.fromTemplate({
    'list|15-15': [
      {
        EmergencyContactID: '@INC(emergencyContacts)',
        CustomerId: null,
        AccountId: 1,
        RelationshipId: '@REF_INC(emergencyContactRelationships)',
        OrderNumber: '@NUMBER(1,100)',
        Allergies: null,
        MedicalConditions: null,
        HasKey: '@BOOL',
        DOB: null,
        Prefix: '@CHAR_UPPER(pre)@CHAR_LOWER(pre).',
        FirstName: '@NAME',
        MiddleName: '@CHAR_UPPER.',
        LastName: '@LASTNAME',
        Postfix: '@CHAR_UPPER(post)@CHAR_LOWER(post).',
        Email: '@EMAIL',
        Password: null,
        Phone1: '@PHONE',
        Phone1TypeId: '@REF_INC(emergencyContactPhoneTypes)',
        Phone2: null,
        Phone2TypeId: null,
        Phone3: null,
        Phone3TypeId: null,
        Comment1: null
      },
    ]
  }).list;


  systemTypes = mockery.fromTemplate({
    'list|4-4': [
      {
        SystemTypeID: '@SYSTEM_TYPE_ID',
        SystemTypeName: '@SYSTEM_TYPE_NAME'
      },
    ]
  }).list;
  panelTypes = mockery.fromTemplate({
    'list|10-10': [
      {
        PanelTypeID: '@PANEL_TYPE_ID',
        PanelTypeName: '@PANEL_TYPE_NAME'
      },
    ]
  }).list;
  dslSeizureTypes = mockery.fromTemplate({
    'list|3-3': [
      {
        DslSeizureID: '@DSLSEIZURE_TYPE_ID',
        DslSeizure: '@DSLSEIZURE_TYPE_NAME'
      },
    ]
  }).list;

  return mock;
});
