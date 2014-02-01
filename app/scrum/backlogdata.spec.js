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

    describe('init', function() {
      it('should throw it has already been called', function() {
        expect(function() {
          bd.init([], []);
        }).toThrow();
      });
      it('should build tree', function() {
        var id, item, parent;

        id = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(8, id + ' length');
        expect(Object.keys(item.idToVmMap).length).toBe(8, id + ' map length');

        parent = bd;
        id = 'E1';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(16.5, id + ' points');
        expect(item.childs().length).toBe(3, id + ' childs');
        expect(item.length()).toBe(6, id + ' length');

        parent = bd.childs()[0];
        id = 'E3';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1.5, id + ' points');
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(3, id + ' length');
        id = 'US2';
        item = parent.childs()[1];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(13, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
        expect(item.length()).toBe(1, id + ' length');
        id = 'US4';
        item = parent.childs()[2];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
        expect(item.length()).toBe(1, id + ' length');

        parent = bd.childs()[0].childs()[0];
        id = 'US1';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E3');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0.5, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
        expect(item.length()).toBe(1, id + ' length');
        id = 'US5';
        item = bd.childs()[0].childs()[0].childs()[1];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E3');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
        expect(item.length()).toBe(1, id + ' length');



        parent = bd;
        id = 'E2';
        item = parent.childs()[1];
        expect(item.id).toBe(id);
        expect(item.parentId).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, id + ' points');
        expect(item.childs().length).toBe(1, id + ' childs');
        expect(item.length()).toBe(2, id + ' length');

        parent = bd.childs()[1];
        id = 'US3';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
        expect(item.length()).toBe(1, id + ' length');
      });
    });

    describe('updateItem', function() {
      it('should update backlog item and all parents', function() {
        var parent, id, item;

        // update story
        bd.updateItem({
          EpicId: 3,
          ID: 1,
          Name: "Name 1",
          Version: 2,
          Points: 1, // changed points
          SortOrder: -1, // keep it as the first item
        });

        id = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(8, id + ' length');
        expect(Object.keys(item.idToVmMap).length).toBe(8, id + ' map length');

        parent = bd;
        id = 'E1';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(17, id + ' points');
        expect(item.childs().length).toBe(3, id + ' childs');
        expect(item.length()).toBe(6, id + ' length');

        parent = bd.childs()[0];
        id = 'E3';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, id + ' points');
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(3, id + ' length');

        parent = bd.childs()[0].childs()[0];
        id = 'US1';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E3');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
        expect(item.length()).toBe(1, id + ' length');
      });
      it('should add backlog items to top level', function() {
        bd.updateItem({
          ParentId: null,
          ID: 4,
          Name: "Epic 4",
        });

        var parent, id, item;

        id = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(3, id + ' childs');
        expect(item.length()).toBe(9, id + ' length');
        expect(Object.keys(item.idToVmMap).length).toBe(9, id + ' map length');

        parent = bd;
        id = 'E4';
        item = parent.childs()[2];
        expect(item.id).toBe(id);
        expect(item.parentId).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0, id + ' points');
        expect(item.childs().length).toBe(0, id + ' childs');
      });
      it('should add sub backlog items', function() {
        var parent, id, item;

        // update epic
        bd.updateItem({
          ParentId: 2,
          ID: 4,
          Name: "Epic 4",
        });

        id = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(9, id + ' length');
        expect(Object.keys(item.idToVmMap).length).toBe(9, id + ' map length');

        id = 'E2';
        parent = bd.childs()[1];
        expect(parent.id).toBe(id);
        expect(parent.points()).toBe(2, id + ' points');
        expect(parent.childs().length).toBe(2, id + ' childs');

        id = 'E4';
        item = parent.childs()[1];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0, id + ' points');
        expect(item.childs().length).toBe(0, id + ' childs');

        // update story
        bd.updateItem({
          EpicId: 4,
          ID: 6,
          Name: "Story 6",
          Version: 1,
          Points: 3,
        });

        id = 'E4';
        item = parent.childs()[1];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(3, id + ' points');
        expect(item.childs().length).toBe(1, id + ' childs');

        parent = item;
        id = 'US6';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E4');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(3, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
      });
      it('shouldn\'t add items when the parent doesn\'t exist', function() {
        var id, item;

        // update epic
        bd.updateItem({
          ParentId: 200,
          ID: 4,
          Name: "Epic 4",
        });

        id = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(8, id + ' length');
        expect(Object.keys(item.idToVmMap).length).toBe(8, id + ' map length');
      });
      it('should move backlog items to another parent', function() {
        var parent, id, item;

        // update story
        bd.updateItem({
          EpicId: 2,
          ID: 1,
          Name: "Name 1",
          Version: 2,
          Points: 0.5,
          SortOrder: -1, // make it the first item
        });

        id = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(8, id + ' length');
        expect(Object.keys(item.idToVmMap).length).toBe(8, id + ' map length');

        // old parents
        parent = bd;
        id = 'E1';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(16, id + ' points');
        expect(item.childs().length).toBe(3, id + ' childs');

        parent = bd.childs()[0];
        id = 'E3';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1, id + ' points');
        expect(item.childs().length).toBe(1, id + ' childs');

        // new parent
        parent = bd;
        id = 'E2';
        item = parent.childs()[1];
        expect(item.id).toBe(id);
        expect(item.parentId).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2.5, id + ' points');
        expect(item.childs().length).toBe(2, id + ' childs');

        parent = bd.childs()[1];
        id = 'US1';
        item = parent.childs()[0];
        expect(item.id).toBe(id);
        expect(item.parentId).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0.5, id + ' points');
        expect(item.childs).toBe(true, id + ' childs');
      });
    });
    describe('removeItem', function() {
      it('should remove leaf backlog items (eg: storys)', function() {
        var parent, id, item, removed;

        // update story
        removed = bd.removeItem({
          ID: 1,
          Version: 2,
          Points: 1,
        });

        expect(removed).toBe(true);

        id = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, id + ' childs');
        expect(item.length()).toBe(7, id + ' length');
        expect(Object.keys(item.idToVmMap).length).toBe(7, id + ' map length');

        parent = bd;
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

  // function toJson(item) {
  //   item = ko.toJS(item);
  //   return JSON.parse(JSON.stringify(item, [
  //     'parentId',
  //     'id',
  //     'name',
  //     'version',
  //     'points',
  //     'length',
  //     'childs',
  //   ]));
  // }
});
