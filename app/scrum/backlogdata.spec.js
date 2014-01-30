/* global describe, it, expect, beforeEach */
define('src/scrum/backlogdata.spec', [
  'ko',
  'src/dataservice',
  'src/core/treehelper',
  'src/scrum/backlogdata',
], function(
  ko,
  dataservice,
  treehelper,
  BacklogData
) {
  "use strict";

  describe('BacklogData', function() {
    var scopes, storys, bd;
    beforeEach(function() {
      scopes = [
        {
          ParentId: null,
          ID: 1,
          Name: "Web client",
        },
        {
          ParentId: null,
          ID: 2,
          Name: "Web server",
        },
        {
          ParentId: 1,
          ID: 3,
          Name: "Panel",
        },
      ];
      storys = [
        {
          ScopeId: 3,
          ID: 1,
          Name: "Name 1",
          Version: 1,
          Points: 0.5,
        },
        {
          ScopeId: 1,
          ID: 2,
          Name: "Name 2",
          Version: 1,
          Points: 13,
        },
        {
          ScopeId: 2,
          ID: 3,
          Name: "Name 3",
          Version: 1,
          Points: 2,
        },
        {
          ScopeId: 1,
          ID: 4,
          Name: "Name 4",
          Version: 1,
          Points: 2,
        },
        {
          ScopeId: 3,
          ID: 5,
          Name: "Name 5",
          Version: 1,
          Points: 1,
        },
      ];

      bd = new BacklogData();
      bd.init(scopes, storys);
    });

    describe('getItem', function() {
      it('`init` should build tree', function() {
        console.log(JSON.stringify(ko.toJS(bd.childs), null, '   '));
        expect(toJson(bd.childs)).toEqual([
          {
            parentId: null,
            id: 'Sc1',
            name: "Web client",
            points: 16.5,
            length: 6,
            childs: [
              {
                parentId: 'Sc1',
                id: 'Sc3',
                name: "Panel",
                points: 1.5,
                length: 3,
                childs: [
                  {
                    parentId: 'Sc3',
                    id: 'St1',
                    name: "Name 1",
                    version: 1,
                    points: 0.5,
                    childs: [],
                  },
                  {
                    parentId: 'Sc3',
                    id: 'St5',
                    name: "Name 5",
                    version: 1,
                    points: 1,
                    childs: [],
                  },
                ],
              },
              {
                parentId: 'Sc1',
                id: 'St2',
                name: "Name 2",
                version: 1,
                points: 13,
                childs: [],
              },
              {
                parentId: 'Sc1',
                id: 'St4',
                name: "Name 4",
                version: 1,
                points: 2,
                childs: [],
              },
            ],
          },
          {
            parentId: null,
            id: 'Sc2',
            name: "Web server",
            points: 2,
            length: 2,
            childs: [
              {
                parentId: 'Sc2',
                id: 'St3',
                name: "Name 3",
                version: 1,
                points: 2,
                childs: [],
              },
            ],
          },
        ]);
      });
    });

    describe('getItem', function() {
      it('should correctly get item by index', function() {
        expect(function() {
          bd.getItem(-1);
        }).toThrow();
        expect(bd.getItem(0).id).toBe('Sc1');
        expect(bd.getItem(1).id).toBe('Sc3');
        expect(bd.getItem(2).id).toBe('St1');
        expect(bd.getItem(3).id).toBe('St5');
        expect(bd.getItem(4).id).toBe('St2');
        expect(bd.getItem(5).id).toBe('St4');
        expect(bd.getItem(6).id).toBe('Sc2');
        expect(bd.getItem(7).id).toBe('St3');
        expect(function() {
          bd.getItem(8);
        }).toThrow();
      });
    });
  });

  function toJson(item) {
    item = ko.toJS(item);
    return JSON.parse(JSON.stringify(item));
  }

  // function trimItem(item) {
  //   return {
  //     ID: item.ID,
  //     Version: item.Version,
  //   };
  // }
  //
  // function stripRepoObservableArrays(obj) {
  //   var newList = [];
  //   obj.list().forEach(function(item) {
  //     if (item.list) {
  //       newList.push({
  //         id: item.id,
  //         list: stripRepoObservableArrays(item)
  //       });
  //     } else {
  //       var trimmedItem = trimItem(item);
  //       if (item.Tasks) {
  //         trimmedItem.Tasks = stripRepoObservableArrays(item.Tasks);
  //       }
  //       newList.push(trimmedItem);
  //     }
  //   });
  //   return newList;
  // }
});
