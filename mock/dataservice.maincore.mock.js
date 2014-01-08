define('mock/dataservice.maincore.mock', [
  'src/dataservice',
  'src/core/mockery',
], function(
  dataservice //,
  // mockery
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
      if (id > 0) {
        result = findSingleBy(list, propName, id);
      } else {
        result = list;
      }
      return result;
    }

    dataservice.accountingengine.departments.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(departments, 'DepartmentID', id);
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.notecategory1.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = noteCategorys1;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.notecategory2.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = noteCategorys2;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.note.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(notes, 'NoteID', id);
          break;
      }
      send(result, setter, cb);
    };
    dataservice.accountingengine.notetypes.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(departments, 'NoteTypeID', id);
          break;
      }
      send(result, setter, cb);
    };
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
    noteTypes;

  departments = [
    {
      DepartmentID: 'COLLEC',
      DepartmentName: 'Collections'
    },
    {
      DepartmentID: 'CSERVIC',
      DepartmentName: 'Customer Service'
    },
    {
      DepartmentID: 'DENTRY',
      DepartmentName: 'Data Entry'
    },
    {
      DepartmentID: 'INSALES',
      DepartmentName: 'Inside Sales'
    },
  ];

  noteCategorys1 = [];
  noteCategorys2 = [
    {
      NoteCategory2ID: 3,
      NoteCategory1Id: 2,
      Category: 'Access Via Search',
      Description: 'Opened from a search screen',
      CreatedBy: 'SYSTEM',
      CreatedOn: '2012-05-04T08:14:36.517'
    },
    {
      NoteCategory2ID: 4,
      NoteCategory1Id: 2,
      Category: 'Access Via Link',
      Description: 'Opened from a link',
      CreatedBy: 'SYSTEM',
      CreatedOn: '2012-05-04T08:14:41.027'
    },
  ];

  notes = [
    {
      NoteID: 278,
      NoteTypeId: 'STANDARD',
      CustomerMasterFileId: 3000001,
      CustomerId: 100172,
      LeadId: 1000046,
      NoteCategory1Id: 3,
      NoteCategory2Id: 6,
      Note: 'Account was accessed via a search from this integration test. And we updated the note'
    },
  ];

  noteTypes = [
    {
      NoteTypeID: 'AUTO_GEN',
      NoteType: 'Auto Generated'
    },
    {
      NoteTypeID: 'BILLING_ENGINE',
      NoteType: 'Billing Engine'
    },
    {
      NoteTypeID: 'CEN_STATION',
      NoteType: 'Central Station'
    },
    {
      NoteTypeID: 'STANDARD',
      NoteType: 'Standard Note'
    },
  ];

  return mock;
});
