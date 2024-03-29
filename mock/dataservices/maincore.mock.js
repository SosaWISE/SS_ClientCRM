define('mock/dataservices/maincore.mock', [
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

    dataservice.maincore.departments.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(departments, 'DepartmentID', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.maincore.notecategory1.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = noteCategorys1;
          break;
        case 'departmentid':
          result =
            noteCategorys1;
          mockery.filterListBy(noteCategorys1, 'departmentid???', id); // ????????????????????????
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.maincore.notecategory2.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = noteCategorys2;
          break;
        case 'category1id':
          result = mockery.filterListBy(noteCategorys2, 'NoteCategory1Id', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.maincore.notes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(notes, 'NoteID', id);
          break;
        case 'cmfid':
          result = mockery.filterListBy(notes, 'CustomerMasterFileId', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.maincore.notetypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(departments, 'NoteTypeID', id);
          break;
      }
      send(0, result, setter, cb);
    };
    dataservice.maincore.localizations.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = mockery.findSingleOrAll(localizations, 'LocalizationID', id);
          break;
      }
      send(0, result, setter, cb);
    };






    dataservice.maincore.notes.save = function(params, setter, cb) {
      var data = params.data;
      send(0, createOrUpdate(notes, 'NoteID', '@INC(note)', {
        NoteID: data.NoteID,
        NoteTypeId: data.NoteTypeId,
        CustomerMasterFileId: data.CustomerMasterFileId,
        CustomerId: data.CustomerId || null,
        LeadId: data.LeadId || null,
        NoteCategory1Id: data.NoteCategory1Id || null,
        NoteCategory2Id: data.NoteCategory2Id || null,
        Note: data.Note,
        CreatedBy: data.CreatedBy || null,
        // CreatedOn: data.CreatedOn,
      }), setter, cb);
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
  }

  (function() {
    // mockery.random = Math.random;

    // mockery.addModulusValueFunc('AGING', [
    //   'Current',
    //   '1 to 30',
    //   '31 to 60',
    //   '61 to 90',
    //   '91 to 120',
    //   '> 120',
    // ]);
  })();

  // data used in mock function
  var departments,
    noteCategorys1,
    noteCategorys2,
    notes,
    noteTypes,
    localizations;

  departments = [ //
    {
      DepartmentID: 'COLLEC',
      DepartmentName: 'Collections'
    }, {
      DepartmentID: 'CSERVIC',
      DepartmentName: 'Customer Service'
    }, {
      DepartmentID: 'DENTRY',
      DepartmentName: 'Data Entry'
    }, {
      DepartmentID: 'INSALES',
      DepartmentName: 'Inside Sales'
    },
  ];

  noteCategorys1 = [ //
    {
      NoteCategory1ID: 1,
      Category: 'Cat 1',
      Description: 'Cat 1 Description',
    }, {
      NoteCategory1ID: 2,
      Category: 'Cat 2',
      Description: 'Cat 2 Description',
    },
  ];
  noteCategorys2 = [ //
    {
      NoteCategory2ID: 1,
      NoteCategory1Id: 1,
      Category: 'Cat 1.1',
      Description: 'Cat 1.1 Description',
    }, {
      NoteCategory2ID: 2,
      NoteCategory1Id: 1,
      Category: 'Cat 1.2',
      Description: 'Cat 1.2 Description',
    }, {
      NoteCategory2ID: 3,
      NoteCategory1Id: 2,
      Category: 'Cat 2.1',
      Description: 'Cat 2.1 Description',
    }, {
      NoteCategory2ID: 4,
      NoteCategory1Id: 2,
      Category: 'Cat 2.2',
      Description: 'Cat 2.2 Description',
    },
  ];

  notes = mockery.fromTemplate({
    'list|1-1': [ //
      {
        NoteID: '@INC(note)',
        NoteTypeId: 'AUTO_GEN',
        CustomerMasterFileId: 3000001,
        CustomerId: null,
        LeadId: null,
        NoteCategory1Id: 1,
        NoteCategory2Id: null,
        Note: 'Master account accessed 10. Master account accessed 09.\nMaster account accessed 08. Master account accessed 07. Master account accessed 06. ' +
          'Master account accessed 05. Master account accessed 04. Master account accessed 03. Master account accessed 02. Master account accessed 01.',
        CreatedBy: 'acls',
        CreatedOn: '2012-07-02T23:22:20.693',
      }
    ]
  }).list;

  noteTypes = [ //
    {
      NoteTypeID: 'AUTO_GEN',
      NoteType: 'Auto Generated'
    }, {
      NoteTypeID: 'BILLING_ENGINE',
      NoteType: 'Billing Engine'
    }, {
      NoteTypeID: 'CEN_STATION',
      NoteType: 'Central Station'
    }, {
      NoteTypeID: 'STANDARD',
      NoteType: 'Standard Note'
    },
  ];

  localizations = [ //
    {
      LocalizationID: 'en-US',
      LocalizationName: 'English USA',
    }, {
      LocalizationID: 'es',
      LocalizationName: 'Spanish Standard',
    }
  ];


  return mock;
});
