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
      bd.init([
        {
          type: 'epic',
          list: epics,
        },
        {
          type: 'story',
          list: storys,
        }
      ]);
    });

    describe('init', function() {
      it('should throw it has already been called', function() {
        expect(function() {
          bd.init([]);
        }).toThrow();
      });
      it('should build tree', function() {
        var sid, item, parent;

        sid = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(8, sid + ' length');
        expect(Object.keys(item.sidToVmMap).length).toBe(8, sid + ' map length');

        parent = bd;
        sid = 'E1';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(16.5, sid + ' points');
        expect(item.childs().length).toBe(3, sid + ' childs');
        expect(item.length()).toBe(6, sid + ' length');

        parent = bd.childs()[0];
        sid = 'E3';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1.5, sid + ' points');
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(3, sid + ' length');
        sid = 'US2';
        item = parent.childs()[1];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(13, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
        expect(item.length()).toBe(1, sid + ' length');
        sid = 'US4';
        item = parent.childs()[2];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
        expect(item.length()).toBe(1, sid + ' length');

        parent = bd.childs()[0].childs()[0];
        sid = 'US1';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E3');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0.5, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
        expect(item.length()).toBe(1, sid + ' length');
        sid = 'US5';
        item = bd.childs()[0].childs()[0].childs()[1];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E3');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
        expect(item.length()).toBe(1, sid + ' length');



        parent = bd;
        sid = 'E2';
        item = parent.childs()[1];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, sid + ' points');
        expect(item.childs().length).toBe(1, sid + ' childs');
        expect(item.length()).toBe(2, sid + ' length');

        parent = bd.childs()[1];
        sid = 'US3';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
        expect(item.length()).toBe(1, sid + ' length');
      });
    });

    describe('updateItem', function() {
      it('should update backlog item and all parents', function() {
        var parent, sid, item;

        // update story
        bd.updateItem({
          EpicId: 3,
          ID: 1,
          Name: "Name 1",
          Version: 2,
          Points: 1, // changed points
          SortOrder: -1, // keep it as the first item
        }, 'story');

        sid = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(8, sid + ' length');
        expect(Object.keys(item.sidToVmMap).length).toBe(8, sid + ' map length');

        parent = bd;
        sid = 'E1';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(17, sid + ' points');
        expect(item.childs().length).toBe(3, sid + ' childs');
        expect(item.length()).toBe(6, sid + ' length');

        parent = bd.childs()[0];
        sid = 'E3';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2, sid + ' points');
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(3, sid + ' length');

        parent = bd.childs()[0].childs()[0];
        sid = 'US1';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E3');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
        expect(item.length()).toBe(1, sid + ' length');
      });
      it('should add backlog items to top level', function() {
        bd.updateItem({
          ParentId: null,
          ID: 4,
          Name: "Epic 4",
        }, 'epic');

        var parent, sid, item;

        sid = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(3, sid + ' childs');
        expect(item.length()).toBe(9, sid + ' length');
        expect(Object.keys(item.sidToVmMap).length).toBe(9, sid + ' map length');

        parent = bd;
        sid = 'E4';
        item = parent.childs()[2];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0, sid + ' points');
        expect(item.childs().length).toBe(0, sid + ' childs');
      });
      it('should add sub backlog items', function() {
        var parent, sid, item;

        // update epic
        bd.updateItem({
          ParentId: 2,
          ID: 4,
          Name: "Epic 4",
        }, 'epic');

        sid = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(9, sid + ' length');
        expect(Object.keys(item.sidToVmMap).length).toBe(9, sid + ' map length');

        sid = 'E2';
        parent = bd.childs()[1];
        expect(parent.sid).toBe(sid);
        expect(parent.points()).toBe(2, sid + ' points');
        expect(parent.childs().length).toBe(2, sid + ' childs');

        sid = 'E4';
        item = parent.childs()[1];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0, sid + ' points');
        expect(item.childs().length).toBe(0, sid + ' childs');

        // update story
        bd.updateItem({
          EpicId: 4,
          ID: 6,
          Name: "Story 6",
          Version: 1,
          Points: 3,
        }, 'story');

        sid = 'E4';
        item = parent.childs()[1];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(3, sid + ' points');
        expect(item.childs().length).toBe(1, sid + ' childs');

        parent = item;
        sid = 'US6';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E4');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(3, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
      });
      it('shouldn\'t add items when the parent doesn\'t exist', function() {
        var sid, item;

        // update epic
        bd.updateItem({
          ParentId: 200,
          ID: 4,
          Name: "Epic 4",
        }, 'epic');

        sid = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(8, sid + ' length');
        expect(Object.keys(item.sidToVmMap).length).toBe(8, sid + ' map length');
      });
      it('should move backlog items to another parent', function() {
        var parent, sid, item;

        // update story
        bd.updateItem({
          EpicId: 2,
          ID: 1,
          Name: "Name 1",
          Version: 2,
          Points: 0.5,
          SortOrder: -1, // make it the first item
        }, 'story');

        sid = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(8, sid + ' length');
        expect(Object.keys(item.sidToVmMap).length).toBe(8, sid + ' map length');

        // old parents
        parent = bd;
        sid = 'E1';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(16, sid + ' points');
        expect(item.childs().length).toBe(3, sid + ' childs');

        parent = bd.childs()[0];
        sid = 'E3';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E1');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(1, sid + ' points');
        expect(item.childs().length).toBe(1, sid + ' childs');

        // new parent
        parent = bd;
        sid = 'E2';
        item = parent.childs()[1];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBeNull();
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(2.5, sid + ' points');
        expect(item.childs().length).toBe(2, sid + ' childs');

        parent = bd.childs()[1];
        sid = 'US1';
        item = parent.childs()[0];
        expect(item.sid).toBe(sid);
        expect(item.parentSid).toBe('E2');
        expect(item.getParent()).toBe(parent);
        expect(item.points()).toBe(0.5, sid + ' points');
        expect(item.childs).toBe(true, sid + ' childs');
      });
    });
    describe('removeItem', function() {
      it('should remove leaf backlog items (eg: storys)', function() {
        var parent, sid, item, removed;

        // update story
        removed = bd.removeItem({
          ID: 1,
          Version: 2,
          Points: 1,
        }, 'story');

        expect(removed).toBe(true);

        sid = 'Backlog';
        item = bd;
        expect(item.childs().length).toBe(2, sid + ' childs');
        expect(item.length()).toBe(7, sid + ' length');
        expect(Object.keys(item.sidToVmMap).length).toBe(7, sid + ' map length');

        parent = bd;
      });
    });

    describe('getItem', function() {
      it('should correctly get item by index', function() {
        expect(function() {
          bd.getItem(-1);
        }).toThrow();
        expect(bd.getItem(0).sid).toBe('E1');
        expect(bd.getItem(1).sid).toBe('E3');
        expect(bd.getItem(2).sid).toBe('US1');
        expect(bd.getItem(3).sid).toBe('US5');
        expect(bd.getItem(4).sid).toBe('US2');
        expect(bd.getItem(5).sid).toBe('US4');
        expect(bd.getItem(6).sid).toBe('E2');
        expect(bd.getItem(7).sid).toBe('US3');
        expect(function() {
          bd.getItem(8);
        }).toThrow();
      });
    });
  });
});
