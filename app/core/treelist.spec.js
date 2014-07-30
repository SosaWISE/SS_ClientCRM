/* global beforeEach,describe,it,expect */
define('src/core/treelist.spec', [
  'src/core/treelist'
], function(TreeList) {
  "use strict";

  describe('TreeList', function() {
    var tree;
    beforeEach(function() {
      tree = new TreeList(function(a, b) {
        // descending
        return b.data.priority - a.data.priority;
      });
    });

    it('`update` should be a function', function() {
      expect(typeof tree.update).toBe('function');
    });

    describe('update', function() {
      beforeEach(function() {
        tree.update({
          psid: null,
          sid: 'A1',
          priority: 20, // second
        });
        tree.update({
          psid: null,
          sid: 'A2',
          priority: 25, // first
        });
        tree.update({
          psid: null,
          sid: 'A3',
          priority: 15, // last
        });
        tree.update({
          psid: null,
          sid: 'A4',
          priority: 16, // third
        });
      });

      it('should insert in correct order', function() {
        expect(tree.length).toBe(4);

        var childs = tree.childs.peek();
        expect(childs[0].data.sid).toBe('A2');
        expect(childs[1].data.sid).toBe('A1');
        expect(childs[2].data.sid).toBe('A4');
        expect(childs[3].data.sid).toBe('A3');

        expect(tree.toText()).toBe([
          'A2',
          'A1',
          'A4',
          'A3',
        ].join('\n'));
      });

      it('should move to keep correct order', function() {
        tree.update({
          psid: null,
          sid: 'A2',
          priority: 19, // move from first to second
        });
        tree.update({
          psid: null,
          sid: 'A4',
          priority: 10, // move third to last
        });

        expect(tree.length).toBe(4);

        var childs = tree.childs.peek();
        expect(childs[0].data.sid).toBe('A1');
        expect(childs[1].data.sid).toBe('A2');
        expect(childs[2].data.sid).toBe('A3');
        expect(childs[3].data.sid).toBe('A4');
      });

      it('should nest childs', function() {
        tree.update({
          psid: 'A1',
          sid: 'B2',
          priority: 10, // last
        });
        tree.update({
          psid: 'A1',
          sid: 'B1',
          priority: 15, // first
        });

        console.log(tree.toText());
        console.log('validate:', tree.validate());

        expect(tree.length).toBe(6);

        var childs = tree.childs.peek(),
          a2, a1, b1;

        a2 = childs[0];
        a1 = childs[1];
        childs = a1.childs.peek();
        expect(a1.data.sid).toBe('A1');
        expect(a1.length).toBe(2);
        expect(tree.length).toBe(6);

        b1 = childs[0];
        expect(b1.data.sid).toBe('B1');
        expect(childs[1].data.sid).toBe('B2');

        tree.update({
          psid: 'B1',
          sid: 'C1',
          priority: 20, // first
        });
        tree.update({
          psid: 'B1',
          sid: 'C2',
          priority: 15, // second
        });
        tree.update({
          psid: 'B1',
          sid: 'C3',
          priority: 10, // last
        });

        b1 = childs[0];
        childs = b1.childs.peek();
        expect(b1.length).toBe(3);
        expect(a1.length).toBe(5);
        expect(a2.length).toBe(0);
        expect(tree.length).toBe(9);

        expect(childs[0].data.sid).toBe('C1');
        expect(childs[1].data.sid).toBe('C2');
        expect(childs[2].data.sid).toBe('C3');


        //
        tree.update({
          psid: 'A2',
          sid: 'B1',
          priority: 15, // first
        });

        expect(b1.length).toBe(3);
        expect(a1.length).toBe(1);
        expect(a2.length).toBe(4);
        expect(tree.length).toBe(9);

        console.log(tree.toText());
        console.log('validate:', tree.validate());
      });
    });

  });
});
