define("mock/scrum/scrumservice.mock", [
  "src/dataservice",
  "src/core/mockery",
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
          Message: "No value",
          Value: null,
        };
      } else {
        result = {
          Code: 0,
          Message: "Success",
          Value: value,
        };
      }

      setTimeout(function() {
        if (!err && result && typeof(setter) === "function") {
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

    function projectsForGroup(scrumGroupId) {
      return filterListBy(projects, "ScrumGroupId", scrumGroupId);
    }

    function storysForGroup(scrumGroupId) {
      var projects = projectsForGroup(scrumGroupId);
      var result = [];
      projects.forEach(function(item) {
        result = result.concat(filterListBy(storys, "ProjectId", item.ID));
      });
      return result;
    }

    function tasksForGroup(scrumGroupId) {
      var storys = storysForGroup(scrumGroupId);
      var result = [];
      storys.forEach(function(item) {
        result = result.concat(filterListBy(tasks, "ParentId", item.ID));
      });
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
    dataservice.scrum.scrumGroups.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(scrumGroups, "ID", id);
          break;
        case "projects":
          result = projectsForGroup(id);
          break;
        case "storys":
          result = storysForGroup(id);
          break;
        case "tasks":
          result = tasksForGroup(id);
          break;
        case "currentSprint":
          result = filterListBy(sprints, "ScrumGroupId", id)[0];
          break;
        case "sprints":
          result = filterListBy(sprints, "ScrumGroupId", id);
          break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.projects.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(projects, "ID", id);
          break;
          // case "sprints":
          //   result = filterListBy(sprints, "ProjectId", id);
          //   break;
          // case "storys":
          //   result = filterListBy(storys, "ProjectId", id);
          //   break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.sprints.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(sprints, "ID", id);
          break;
        case "storys":
          if (id === "null") {
            id = null;
          }
          result = filterListBy(storys, "SprintId", id);
          // include Tasks on result
          result = clone(result);
          result.forEach(function(story) {
            story.Tasks = filterListBy(tasks, "ParentId", story.ID);
          });
          break;
      }
      send(result, setter, cb);
    };
    dataservice.scrum.storys.read = function(params, setter, cb) {
      var result, id = params.id;
      switch (params.link || null) {
        case null:
          result = findSingleOrAll(storys, "ID", id);
          break;
      }
      // include Tasks on result
      result = clone(result);
      result.forEach(function(story) {
        story.Tasks = filterListBy(tasks, "ParentId", story.ID);
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






    dataservice.scrum.storys.save = function(data, setter, cb) {
      var result = mockery.createOrUpdate(storys, "ID", "@INC(storys)", {
        ID: data.ID,
        ScrumGroupId: data.ScrumGroupId,
        ParentId: data.ParentId,
        ProjectId: data.ProjectId,
        PersonId: data.PersonId,
        Name: data.Name,
        Description: data.Description,
        Points: data.Points,
        StepId: data.StepId,
        SortOrder: data.SortOrder,
        IsDeleted: data.IsDeleted,
        Version: data.Version ? data.Version + 1 : 1,
        ModifiedBy: data.ModifiedBy,
        ModifiedOn: mockery.fromTemplate("@NOW"),
      });
      // // include Tasks on result
      // result.Tasks = filterListBy(tasks, "ParentId", result.ID);
      send(result, setter, cb);
    };
    dataservice.scrum.tasks.save = function(data, setter, cb) {
      send(mockery.createOrUpdate(tasks, "ID", "@INC(tasks)", {
        ID: data.ID,
        ParentId: data.ParentId,
        Name: data.Name,
        PersonId: data.PersonId,
        Points: data.Points,
        StepId: data.StepId,
        SortOrder: data.SortOrder,
        IsDeleted: data.IsDeleted,
        Version: data.Version,
        ModifiedBy: data.ModifiedBy,
        ModifiedOn: mockery.fromTemplate("@NOW"),
      }), setter, cb);
    };
  }

  (function() {
    mockery.addModulusValueFunc("SPRINT_STARTON", [
      new Date(2013, 1, 3),
      new Date(2013, 1, 17),
      new Date(2013, 1, 31),
    ]);
    mockery.addModulusValueFunc("SPRINT_ENDON", [
      new Date(2013, 1, 16),
      new Date(2013, 1, 30),
      new Date(2013, 2, 13),
    ]);
    mockery.addModulusValueFunc("FEATURE_TYPE", [
      "Wanted",
      "Unwanted",
    ]);
    mockery.fn.STORY_POINTS = [0.5, 1, 2, 3, 5, 8, 13];
    // mockery.addModulusValueFunc("TASKSTEP_NAME", [
    //   "Pending",
    //   "In-Progress",
    //   "Complete",
    // ]);
  })();

  // data used in mock function
  var persons,
    scrumGroups,
    projects,
    sprints,
    storysteps,
    storys,
    tasksteps,
    tasks;

  persons = mockery.fromTemplate({
    "list|3-3": [ //
      {
        ID: "@INC(persons)",
        FirstName: "@NAME",
        LastName: "@LASTNAME",
        Email: "@EMAIL",
      },
    ],
  }).list;

  scrumGroups = mockery.fromTemplate({
    "list|3-3": [ //
      {
        ID: "@INC(scrumGroups)",
        Name: "Group-@INC(scrumGroups)",
      },
    ],
  }).list;

  projects = mockery.fromTemplate({
    "list|3-3": [ //
      {
        ID: "@INC(projects)",
        Name: "Project-@INC(projects)",
        ScrumGroupId: 1,
      },
    ],
  }).list;

  sprints = mockery.fromTemplate({
    "list|3-3": [ //
      {
        ID: "@INC(sprints)",
        ScrumGroupId: 1,
        StartOn: "@SPRINT_STARTON",
        EndOn: "@SPRINT_ENDON",
      },
    ],
  }).list;

  storysteps = mockery.fromTemplate({
    "list|3-3": [ //
      {
        ID: "@INC(storysteps)",
        // Name: "@STORYSTEP_NAME",
      },
    ],
  }).list;
  storysteps = [ //
    {
      ID: 1,
      Name: "New",
      Css: "waiting",
      Actions: [ //
        {
          StepId: 2,
          Text: "Ready for Testing",
        },
      ],
    }, {
      ID: 2,
      Name: "Testing",
      Css: "testing",
      Actions: [ //
        {
          StepId: 3,
          Text: "Passed",
        }, {
          StepId: 1,
          Text: "Failed",
        },
      ],
    }, {
      ID: 3,
      Name: "Closed",
      Css: "complete",
      Actions: [],
    },
  ];

  storys = mockery.fromTemplate({
    // backlog storys
    "list|10-10": [ //
      {
        ID: "@INC(storys)",
        ProjectId: "@REF_INC(projects)",
        ParentId: null,
        PersonId: null,
        Name: "Story @FK(storys)",
        Description: "@TEXT(50,80)",
        Points: "@STORY_POINTS",
        StepId: "@REF_INC(storysteps)",
        SortOrder: "@INC(SortOrder,-1000)", // "@NUMBER(-1000000,-10)",
        IsDeleted: false,
        Version: 1,
        ModifiedOn: "@DATETIME(-10,1)", // between 10 days in the past and yesterday
        ModifiedBy: "BOBB001",
      },
    ],
  }).list.concat(mockery.fromTemplate({
    // storyboard storys
    "list|10-10": [ //
      {
        ID: "@INC(storys)",
        ProjectId: "@REF_INC(projects)",
        ParentId: null,
        PersonId: "@REF_INC(persons)",
        Name: "Story @FK(storys)",
        Description: "@TEXT(50,80)",
        Points: "@STORY_POINTS",
        StepId: "@REF_INC(storysteps)",
        SortOrder: "@INC(SortOrder2,1000,10)", // "@NUMBER(10,1000000)",
        IsDeleted: false,
        Version: 1,
        ModifiedOn: "@DATETIME(-10,1)", // between 10 days in the past and yesterday
        ModifiedBy: "BOBB001",
      },
    ],
  }).list).concat(mockery.fromTemplate({
    // cooler storys
    "list|20-20": [ //
      {
        ID: "@INC(storys)",
        ProjectId: "@REF_INC(projects)",
        ParentId: null,
        PersonId: null,
        Name: "Story @FK(storys)",
        Description: "@TEXT(50,80)",
        Points: null,
        StepId: "@REF_INC(storysteps)",
        SortOrder: null,
        IsDeleted: false,
        Version: 1,
        ModifiedOn: "@DATETIME(-10,1)", // between 10 days in the past and yesterday
        ModifiedBy: "BOBB001",
      },
    ],
  }).list);

  tasksteps = mockery.fromTemplate({
    "list|3-3": [ //
      {
        ID: "@INC(tasksteps)",
        // Name: "@TASKSTEP_NAME",
      },
    ],
  }).list;
  tasksteps = [ //
    {
      ID: 1,
      Name: "Pending",
      Css: "waiting",
      Actions: [ //
        {
          StepId: 2,
          Text: "Work on",
        },
      ],
    }, {
      ID: 2,
      Name: "In-Progress",
      Css: "progressing",
      Actions: [ //
        {
          StepId: 3,
          Text: "Done",
        },
      ],
    }, {
      ID: 3,
      Name: "Complete",
      Css: "complete",
      Actions: [],
    },
  ];

  tasks = mockery.fromTemplate({
    "list|40-40": [ //
      {
        ID: "@INC(tasks)",
        ParentId: "@REF_INC(storys)",
        Name: "Task @FK(tasks)",
        PersonId: "@REF_INC(persons)",
        Points: "@NUMBER(1,4)",
        StepId: "@REF_INC(tasksteps)",
        SortOrder: "@NUMBER(0,100000)",
        IsDeleted: false,
        Version: 1,
        ModifiedOn: "@DATETIME(-10,1)", // between 10 days in the past and yesterday
        ModifiedBy: "BOBB001",
      },
    ],
  }).list;

  return mock;
});
