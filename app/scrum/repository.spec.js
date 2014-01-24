/* global describe, it, expect, beforeEach */
define('src/scrum/repository.spec', [
  'src/scrum/repository',
], function(
  Repository
) {
  "use strict";

  describe('Repository', function() {
    var repo;
    beforeEach(function() {
      function taskSorter(a, b) {
        a = b;
        return 0;
      }

      repo = new Repository({
        sorter: taskSorter,
        metadata: [
          {
            field: 'Fk1',
            sorter: function(a, b) {
              a = b;
              return 0;
            },
          },
          {
            field: 'Fk2',
            sorter: function(a, b) {
              a = b;
              return 0;
            },
          },
          {
            field: 'Fk3',
            sorter: function(a, b) {
              a = b;
              return 0;
            },
          },
        ],
      });
    });

    it('should ', function() {
      expect(null).toBe(null);
    });

    describe('`update` with empty repo', function() {
      beforeEach(function() {

      });

      it('should correctly add new items', function() {
        repo.update(createItem(1, 10, 20, 30, 1));
        expect(Object.keys(repo.map)).toEqual(['1']);
        expectKeys(Object.keys(repo.structureMap), ['10', '10_20', '10_20_30']);

        expect(stripRepoObservableArrays(repo)).toEqual([
          {
            // fk1
            id: 10,
            list: [
              // fk2
              {
                id: 20,
                list: [
                  // fk3
                  {
                    id: 30,
                    list: [
                      {
                        ID: 1,
                        Version: 1,
                      },
                    ],
                  },
                ],
              },
            ]
          }
        ]);

        repo.update(createItem(2, 10, 20, 30, 1));
        expect(Object.keys(repo.map)).toEqual(['1', '2']);
        expectKeys(Object.keys(repo.structureMap), ['10', '10_20', '10_20_30']);

        expect(stripRepoObservableArrays(repo)).toEqual([
          {
            // fk1
            id: 10,
            list: [
              // fk2
              {
                id: 20,
                list: [
                  // fk3
                  {
                    id: 30,
                    list: [
                      {
                        ID: 1,
                        Version: 1,
                      },
                      {
                        ID: 2,
                        Version: 1,
                      },
                    ],
                  },
                ],
              },
            ]
          }
        ]);
      });
    });

    describe('`update` with non-empty repo', function() {
      beforeEach(function() {
        repo.update(createItem(1, 10, 20, 30, 1));
        repo.update(createItem(2, 10, 20, 30, 1));
      });

      it('should correctly change fk3 from 30 to 31', function() {
        repo.update(createItem(2, 10, 20, 31, 1));

        expect(Object.keys(repo.map)).toEqual(['1', '2']);
        expectKeys(Object.keys(repo.structureMap), ['10', '10_20', '10_20_30', '10_20_31']);

        expect(stripRepoObservableArrays(repo)).toEqual([
          {
            // fk1
            id: 10,
            list: [
              // fk2
              {
                id: 20,
                list: [
                  // fk3
                  {
                    id: 30,
                    list: [
                      {
                        ID: 1,
                        Version: 1,
                      },
                    ],
                  },
                  {
                    id: 31,
                    list: [
                      {
                        ID: 2,
                        Version: 1,
                      },
                    ],
                  },
                ],
              },
            ]
          }
        ]);
      });
      it('should correctly change fk2 from 20 to 21', function() {
        repo.update(createItem(2, 10, 21, 30, 1));

        expect(Object.keys(repo.map)).toEqual(['1', '2']);
        expect(Object.keys(repo.structureMap)).toEqual(['10', '10_20', '10_20_30', '10_21', '10_21_30']);

        expect(stripRepoObservableArrays(repo)).toEqual([
          {
            // fk1
            id: 10,
            list: [
              // fk2
              {
                id: 20,
                list: [
                  // fk3
                  {
                    id: 30,
                    list: [
                      {
                        ID: 1,
                        Version: 1,
                      },
                    ],
                  },
                ],
              },
              {
                id: 21,
                list: [
                  // fk3
                  {
                    id: 30,
                    list: [
                      {
                        ID: 2,
                        Version: 1,
                      },
                    ],
                  },
                ],
              },
            ]
          }
        ]);
      });
      it('should correctly change fk1 from 10 to 11', function() {
        repo.update(createItem(2, 11, 20, 30, 1));

        expect(Object.keys(repo.map)).toEqual(['1', '2']);
        expectKeys(Object.keys(repo.structureMap), ['10', '10_20', '10_20_30', '11', '11_20', '11_20_30']);

        expect(stripRepoObservableArrays(repo)).toEqual([
          {
            // fk1
            id: 10,
            list: [
              // fk2
              {
                id: 20,
                list: [
                  // fk3
                  {
                    id: 30,
                    list: [
                      {
                        ID: 1,
                        Version: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            // fk1
            id: 11,
            list: [
              {
                id: 20,
                list: [
                  // fk3
                  {
                    id: 30,
                    list: [
                      {
                        ID: 2,
                        Version: 1,
                      },
                    ],
                  },
                ],
              },
            ]
          }
        ]);
      });
    });
  });


  function createItem(id, fk1, fk2, fk3, version) {
    return {
      ID: id,
      Fk1: fk1,
      Fk2: fk2,
      Fk3: fk3,
      Version: version,
    };
  }

  function trimItem(item) {
    return {
      ID: item.ID,
      Version: item.Version,
    };
  }

  function stripRepoObservableArrays(obj) {
    var newList = [];
    obj.list().forEach(function(item) {
      if (item.list) {
        newList.push({
          id: item.id,
          list: stripRepoObservableArrays(item)
        });
      } else {
        var trimmedItem = trimItem(item);
        if (item.Tasks) {
          trimmedItem.Tasks = stripRepoObservableArrays(item.Tasks);
        }
        newList.push(trimmedItem);
      }
    });
    return newList;
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
