/* global describe, it, expect, beforeEach */
define('src/scrum/scrumrepo.spec', [
  'src/scrum/scrumrepo',
], function(
  ScrumRepo
) {
  "use strict";

  describe('ScrumRepo', function() {
    var repo;
    beforeEach(function() {
      repo = new ScrumRepo();
    });

    it('should ', function() {
      expect(null).toBe(null);
    });

    describe('updateStory with empty repo', function() {
      beforeEach(function() {

      });

      it('should correctly add new items', function() {
        repo.updateStory(createStory(10, 20, 30, 1, [
          createTask(50, 10, 60, 30, 1),
          createTask(51, 10, 60, 30, 1),
        ]));
        expect(Object.keys(repo.storyRepo.map)).toEqual(['10']);
        expectKeys(Object.keys(repo.storyRepo.structureMap), ['20', '20_30']);
        expect(Object.keys(repo.taskRepo.map)).toEqual(['50', '51']);
        expectKeys(Object.keys(repo.taskRepo.structureMap), ['10', '10_60', '10_60_30']);

        repo.updateStory(createStory(11, 20, 30, 1, [ //
        ]));
        expect(Object.keys(repo.storyRepo.map)).toEqual(['10', '11']);
        expectKeys(Object.keys(repo.storyRepo.structureMap), ['20', '20_30']);
        expect(Object.keys(repo.taskRepo.map)).toEqual(['50', '51']);
        expectKeys(Object.keys(repo.taskRepo.structureMap), ['10', '10_60', '10_60_30', '11']);
      });
    });

    describe('updateStory with non-empty repo', function() {
      beforeEach(function() {
        repo.updateStory(createStory(10, 20, 30, 1, [
          createTask(50, 10, 60, 30, 1),
          createTask(51, 10, 60, 30, 1),
        ]));
      });

      it('should correctly update tasks', function() {
        repo.updateStory(createStory(10, 20, 30, 1, [
          createTask(50, 10, 60, 30, 1),
          createTask(51, 10, 60, 30, 1),
        ]));
        expect(Object.keys(repo.storyRepo.map)).toEqual(['10']);
        expectKeys(Object.keys(repo.storyRepo.structureMap), ['20', '20_30']);
        expect(Object.keys(repo.taskRepo.map)).toEqual(['50', '51']);
        expectKeys(Object.keys(repo.taskRepo.structureMap), ['10', '10_60', '10_60_30']);
      });
    });
  });


  function createStory(id, sprintId, personId, version, tasks) {
    return {
      ID: id,
      SprintId: sprintId,
      PersonId: personId,
      Version: version,
      Tasks: tasks || [],
    };
  }

  function createTask(id, storyId, taskStepId, personId, version) {
    return {
      ID: id,
      StoryId: storyId,
      TaskStepId: taskStepId,
      PersonId: personId,
      Version: version,
    };
  }

  function expectKeys(keys, expectedKeys) {
    keys.sort();
    expectedKeys.sort();

    expect(keys.length).toBe(expectedKeys.length);
    expectedKeys.forEach(function(eKey, i) {
      expect(keys[i]).toBe(eKey);
    });
  }
});
