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
    var epics, storys, bd;
    beforeEach(function() {
      epics = [
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
          EpicId: 3,
          ID: 1,
          Name: "Name 1",
          Version: 1,
          Points: 0.5,
        },
        {
          EpicId: 1,
          ID: 2,
          Name: "Name 2",
          Version: 1,
          Points: 13,
        },
        {
          EpicId: 2,
          ID: 3,
          Name: "Name 3",
          Version: 1,
          Points: 2,
        },
        {
          EpicId: 1,
          ID: 4,
          Name: "Name 4",
          Version: 1,
          Points: 2,
        },
        {
          EpicId: 3,
          ID: 5,
          Name: "Name 5",
          Version: 1,
          Points: 1,
        },
      ];

      bd = new BacklogData();
      bd.init(epics, storys);
    });

    describe('getItem', function() {
      it('`init` should build tree', function() {
        console.log(JSON.stringify(ko.toJS(bd.childs), null, '   '));
        expect(toJson(bd.childs)).toEqual([
          {
            parentId: null,
            id: 'E1',
            name: "Web client",
            points: 16.5,
            length: 6,
            childs: [
              {
                parentId: 'E1',
                id: 'E3',
                name: "Panel",
                points: 1.5,
                length: 3,
                childs: [
                  {
                    parentId: 'E3',
                    id: 'US1',
                    name: "Name 1",
                    version: 1,
                    points: 0.5,
                    childs: [],
                  },
                  {
                    parentId: 'E3',
                    id: 'US5',
                    name: "Name 5",
                    version: 1,
                    points: 1,
                    childs: [],
                  },
                ],
              },
              {
                parentId: 'E1',
                id: 'US2',
                name: "Name 2",
                version: 1,
                points: 13,
                childs: [],
              },
              {
                parentId: 'E1',
                id: 'US4',
                name: "Name 4",
                version: 1,
                points: 2,
                childs: [],
              },
            ],
          },
          {
            parentId: null,
            id: 'E2',
            name: "Web server",
            points: 2,
            length: 2,
            childs: [
              {
                parentId: 'E2',
                id: 'US3',
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
        expect(bd.getItem(0).id).toBe('E1');
        expect(bd.getItem(1).id).toBe('E3');
        expect(bd.getItem(2).id).toBe('US1');
        expect(bd.getItem(3).id).toBe('US5');
        expect(bd.getItem(4).id).toBe('US2');
        expect(bd.getItem(5).id).toBe('US4');
        expect(bd.getItem(6).id).toBe('E2');
        expect(bd.getItem(7).id).toBe('US3');
        expect(function() {
          bd.getItem(8);
        }).toThrow();
      });
    });
  });

  function toJson(item) {
    item = ko.toJS(item);
    return JSON.parse(JSON.stringify(item, [
      'parentId',
      'id',
      'name',
      'version',
      'points',
      'length',
      'childs',
    ]));
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
