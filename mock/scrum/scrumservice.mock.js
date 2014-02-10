define('mock/scrum/scrumservice.mock', [
  'src/dataservice',
  'src/core/mockery',
], function(
  dataservice,
  mockery
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

    dataservice.scrum.persons.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = persons;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.sprints.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = sprints;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.epics.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = epics;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.storytypes.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = storytypes;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.storys.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(storys, 'ID', id);
          break;
        case 'bysprint':
          if (id === 'null') {
            id = null;
          }
          result = filterListBy(storys, 'SprintId', id);
          break;
      }
      // include Tasks on result
      result.forEach(function(story) {
        story.Tasks = filterListBy(tasks, 'StoryId', story.ID);
      });
      send(result, setter, cb);
    };
    dataservice.scrum.tasksteps.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = tasksteps;
          break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.tasks.read = function(params, setter, cb) {
      var result;
      switch (params.link || null) {
        case null:
          result = tasks;
          break;
      }
      send(result, setter, cb);
    };






    dataservice.scrum.epics.save = function(data, setter, cb) {
      send(createOrUpdate(epics, 'ID', '@INC(epics)', {
        ID: data.ID,
        Name: data.Name,
      }), setter, cb);
    };
    dataservice.scrum.storys.save = function(data, setter, cb) {
      var result = createOrUpdate(storys, 'ID', '@INC(storys)', {
        ID: data.ID,
        StoryTypeId: data.StoryTypeId,
        SprintId: data.SprintId,
        ParentId: data.ParentId,
        PersonId: data.PersonId,
        Name: data.Name,
        Description: data.Description,
        Points: data.Points,
        IsDeleted: data.IsDeleted,
        Version: data.Version ? data.Version + 1 : 1,
      });
      // // include Tasks on result
      // result.Tasks = filterListBy(tasks, 'StoryId', result.ID);
      send(result, setter, cb);
    };
    dataservice.scrum.tasks.save = function(data, setter, cb) {
      send(createOrUpdate(tasks, 'ID', '@INC(tasks)', {
        ID: data.ID,
        StoryId: data.StoryId,
        TaskStepId: data.TaskStepId,
        Name: data.Name,
        PersonId: data.PersonId,
        Hours: data.Hours,
        IsDeleted: data.IsDeleted,
        Version: data.Version ? data.Version + 1 : 1,
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
    mockery.addModulusValueFunc('SPRINT_STARTON', [
      new Date(2013, 1, 3),
      new Date(2013, 1, 17),
      new Date(2013, 1, 31),
    ]);
    mockery.addModulusValueFunc('SPRINT_ENDON', [
      new Date(2013, 1, 16),
      new Date(2013, 1, 30),
      new Date(2013, 2, 13),
    ]);
    mockery.addModulusValueFunc('SCOPE_PNAME', [
      'Web client',
      'Web server',
    ]);
    mockery.addModulusValueFunc('SCOPE_CNAME', [
      'Panel',
      'Actions',
      'Tests',
    ]);
    mockery.addModulusValueFunc('STORY_TYPE', [
      'Story',
      'Defect',
    ]);
    mockery.fn.STORY_POINTS = [0.5, 1, 2, 3, 5, 8, 13];
    mockery.addModulusValueFunc('TASKSTEP_NAME', [
      'Defined',
      'In-Progress',
      'Complete',
    ]);
  })();

  // data used in mock function
  var persons,
    sprints,
    epics,
    storytypes,
    storys,
    tasksteps,
    tasks;

  persons = mockery.fromTemplate({
    'list|3-3': [
      {
        ID: '@INC(persons)',
        FirstName: '@NAME',
        LastName: '@LASTNAME',
        Email: '@EMAIL',
      },
    ],
  }).list;

  sprints = mockery.fromTemplate({
    'list|3-3': [
      {
        ID: '@INC(sprints)',
        StartOn: '@SPRINT_STARTON',
        EndOn: '@SPRINT_ENDON',
      },
    ],
  }).list;

  epics = mockery.fromTemplate({
    'list|2-2': [
      {
        ParentId: null,
        ID: '@INC(epics)',
        Name: '@SCOPE_PNAME',
        SortOrder: '@NUMBER(0,100000)',
      },
    ],
  }).list.concat(mockery.fromTemplate({
    'list|5-5': [
      {
        ParentId: '@REF_INC(epics)',
        ID: '@INC(epics)',
        Name: '@SCOPE_CNAME',
        SortOrder: '@NUMBER(0,100000)',
      },
    ],
  }).list);

  storytypes = mockery.fromTemplate({
    'list|2-2': [
      {
        ID: '@INC(storytypes)',
        Name: '@STORY_TYPE',
      },
    ],
  }).list;
  storys = mockery.fromTemplate({
    'list|10-10': [
      {
        ID: '@INC(storys)',
        StoryTypeId: '@REF_INC(storytypes)',
        SprintId: 1,
        PersonId: '@REF_INC(persons)',
        EpicId: '@REF_INC(epics)',
        Name: '@TEXT(20,30)',
        Description: '@TEXT(50,80)',
        Points: '@STORY_POINTS',
        SortOrder: '@NUMBER(0,100000)',
        IsDeleted: false,
        Version: 1,
      },
    ],
  }).list.concat(mockery.fromTemplate({
    // backlog storys
    'list|10-10': [
      {
        ID: '@INC(storys)',
        StoryTypeId: '@REF_INC(storytypes)',
        SprintId: null,
        PersonId: null,
        EpicId: '@FK(epics)',
        Name: '@TEXT(20,30)',
        Description: '@TEXT(50,80)',
        Points: '@STORY_POINTS',
        SortOrder: '@NUMBER(0,100000)',
        IsDeleted: false,
        Version: 1,
      },
    ],
  }).list);

  tasksteps = mockery.fromTemplate({
    'list|3-3': [
      {
        ID: '@INC(tasksteps)',
        Name: '@TASKSTEP_NAME',
      },
    ],
  }).list;

  tasks = mockery.fromTemplate({
    'list|40-40': [
      {
        ID: '@INC(storys)',
        StoryId: '@REF_INC(storys)',
        TaskStepId: '@REF_INC(tasksteps)',
        PersonId: '@REF_INC(persons)',
        Name: '@TEXT(15,20)',
        Hours: '@NUMBER(1,4)',
        IsDeleted: false,
        Version: 1,
      },
    ],
  }).list;

  return mock;
});
