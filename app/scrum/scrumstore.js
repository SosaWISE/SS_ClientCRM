define('src/scrum/scrumstore', [
  'src/dataservice',
  'src/core/utils',
  'src/core/helpers',
  'ko',
], function(
  dataservice,
  utils,
  helpers,
  ko
) {
  "use strict";

  var sprintFn,
    personFn;

  function ScrumStore() {
    var _this = this;

    _this.sprints = ko.observableArray();
    _this.sprintsLoaderMap = {};
  }

  function createSprintStorysLoader(sprints, sprintId) {
    return helpers.onetimer(function(cb) {
      dataservice.scrum.storys.read({
        id: sprintId,
        link: 'bysprint',
      }, null, function(err, resp) {
        utils.safeCallback(err, function() {
          // add sprint with storys
          var sprint = createSprint(resp.Value);
          //@TODO: insert in correct order
          sprints.push(sprint);
        }, cb);
      });
    });
  }

  // load sprint
  ScrumStore.prototype.ensureSprintStorys = function(sprintId, cb) {
    var _this = this,
      loader = _this.sprintsLoaderMap[sprintId];
    if (!loader) {
      _this.sprintsLoaderMap[sprintId] = loader = createSprintStorysLoader(_this.sprints, sprintId);
    }
    loader(cb);
  };
  ScrumStore.prototype.hasStoryId = function(storyId) {
    var _this = this;
    return _this.sprints.some(function(sprint) {
      return sprint.hasStoryId(storyId);
    });
  };

  ScrumStore.prototype.storyUpdated = function(story) {
    story = story;

    // try to find story in store
    // if found
    //    do nothing if Version's are the same
    //    replace if location is same
    //    remove if location is different
    // if not found
    //    insert in correct location

    //  find
    //    find sprint
    //      find person
    //        find story

  };


  //
  // Sprint
  //
  function createSprint(storys) {
    var persons = ko.observableArray(storys);
    ko.utils.extend(persons, sprintFn);

    persons.personMap = {};

    storys.forEach(function(story) {
      var person = persons.personMap[story.PersonId];
      if (!person) {
        persons.personMap[story.PersonId] = person = createPerson();
        //@TODO: insert in correct order
        persons.push(person);
      }
      person.setStory(story);
    });

    // persons.storys = ko.observableArray();
    // persons.storyIdMap = {};

    return persons;
  }
  sprintFn.hasStoryId = function(storyId) {
    var _this = this;
    return !!_this.storyIdMap[storyId];
  };
  sprintFn.setStory = function(story) {
    return !!story;
  };
  sprintFn.removeStory = function(story) {
    return !!story;
  };


  //
  // Person
  //
  function createPerson() {
    var list = ko.observableArray();
    ko.utils.extend(list, personFn);

    list.storyIdMap = {};

    return list;
  }
  personFn.hasStoryId = function(storyId) {
    var _this = this;
    return !!_this.storyIdMap[storyId];
  };
  personFn.setStory = function(story) {
    return !!story;
  };
  personFn.removeStory = function(story) {
    return !!story;
  };


  return ScrumStore;
});
