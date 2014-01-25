define('src/scrum/scrumrepo', [
  'src/core/notify',
  'ko',
  'src/scrum/repository',
], function(
  notify,
  ko,
  Repository
) {
  "use strict";

  function ScrumRepo(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }

    _this.storyRepo = new Repository({
      sorter: storySorter,
      metadata: [
        {
          field: 'SprintId',
          sorter: function(a, b) {
            // sort by sprint dates
            //@TODO: return -1, 0, or 1
            a = b;
            return 0;
          },
        },
        {
          field: 'PersonId',
          sorter: function(a, b) {
            // sort by name of Person
            //@TODO: return -1, 0, or 1
            a = b;
            return 0;
          },
        },
      ],
    });
    _this.taskRepo = new Repository({
      sorter: taskSorter,
      metadata: [
        {
          field: 'StoryId',
          sorter: function(a, b) {
            //@TODO: return -1, 0, or 1
            a = b;
            return 0;
          },
        },
        {
          values: options ? options.stepValues : null,
          field: 'TaskStepId',
          sorter: function(a, b) {
            // ascending
            return b.id - a.id;
          },
        },
        {
          field: 'PersonId',
          sorter: function(a, b) {
            // sort by name of Person
            //@TODO: return -1, 0, or 1
            a = b;
            return 0;
          },
        },
      ],
    });
  }

  ScrumRepo.prototype.updateStory = function(story) {
    var _this = this,
      tasks = story.Tasks,
      taskRepo = _this.taskRepo,
      storyRepo = _this.storyRepo;

    if (tasks && Array.isArray(tasks) && tasks.length) {
      // update all story Tasks
      tasks.forEach(function(task) {
        taskRepo.update(task);
      });
    } else if (!taskRepo.structureMap[story.ID]) {
      taskRepo.structureMap[story.ID] = Repository.createObj(story.ID);
    }
    // set Steps to internal recursive observable array
    story.Steps = taskRepo.structureMap[story.ID].list;

    // do actual update
    storyRepo.update(story);
  };
  ScrumRepo.prototype.updateTask = function(task) {
    var _this = this,
      taskRepo = _this.taskRepo;
    // do actual update
    taskRepo.update(task);
  };

  function storySorter(a, b) {
    //@TODO: return -1, 0, or 1
    a = b;
    return 0;
  }

  function taskSorter(a, b) {
    //@TODO: return -1, 0, or 1
    a = b;
    return 0;
  }


  return ScrumRepo;
});
