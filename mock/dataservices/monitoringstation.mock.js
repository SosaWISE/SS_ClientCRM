define('mock/dataservices/monitoringstation.mock', [
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

    function filterListBy(list, propName, id) {
      return list.filter(function(item) {
        return item[propName] === id;
      });
    }

    function findSingleBy(list, propName, id) {
      return list.filter(function(item) {
        return item[propName] === id;
      })[0];
    }

    function findSingleOrAll(list, propName, id) {
      var result;
      if (id > 0) {
        result = findSingleBy(list, propName, id);
      } else {
        result = list;
      }
      return result;
    }

    dataservice.monitoringstation.accounts.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(accounts, 'AccountID', id);
          break;
        case 'emergencyContacts':
          result = filterListBy(emergencyContacts, 'AccountId', id);
          break;
      }
      send(result, setter, cb);
    };
    dataservice.monitoringstation.emergencyContactPhoneTypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(emergencyContactPhoneTypes, 'PhoneTypeID', id);
          break;
      }
      send(result, setter, cb);
    };
    dataservice.monitoringstation.emergencyContactRelationships.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(emergencyContactRelationships, 'RelationshipID', id);
          break;
      }
      send(result, setter, cb);
    };


    dataservice.monitoringstation.emergencyContacts.save = function(params, setter, cb) {
      var data = params.data;
      send(createOrUpdate(emergencyContacts, 'EmergencyContactID', '@INC(emergencyContacts)', {
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
    dataservice.monitoringstation.emergencyContacts.del = function(id, setter, cb) {
      send(deleteItem(emergencyContacts, 'EmergencyContactID', id), setter, cb);
    };

    function createOrUpdate(list, idName, idTemplate, newValue) {
      var id = newValue[idName],
        index;
      if (id > 0) {
        if (!list.some(function(item, i) {
          if (item[idName] === id) {
            index = i;
            return true;
          }
        })) {
          throw new Error('invalid id. id not in list.');
        }

        // replace old value with new value
        list.splice(index, 1, newValue);
      } else {
        newValue[idName] = mockery.fromTemplate(idTemplate);
        // add new value
        list.push(newValue);
      }
      return newValue;
    }

    function deleteItem(list, idName, id) {
      var result;
      list.some(function(item, index) {
        if (item[idName] === id) {
          // remove
          list.splice(index, 1);
          result = item;
          return true;
        }
      });
      return result;
    }
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
  })();

  // data used in mock function
  var accounts,
    emergencyContacts,
    emergencyContactPhoneTypes,
    emergencyContactRelationships;

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
    'list|3-3': [
      {
        EmergencyContactID: '@INC(emergencyContacts)',
        CustomerId: null,
        AccountId: 1,
        RelationshipId: '@REF_INC(emergencyContactRelationships)',
        OrderNumber: '@NUMBER(1,15)',
        Allergies: null,
        MedicalConditions: null,
        HasKey: '@BOOL',
        DOB: null,
        Prefix: '@TEXT(2,3)',
        FirstName: '@NAME',
        MiddleName: '@CHAR_UPPER',
        LastName: '@LASTNAME',
        Postfix: '@TEXT(2,3)',
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


  return mock;
});
