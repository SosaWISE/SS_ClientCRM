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
        return b.priority - a.priority;
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
        var childs, validateResults,
          a2, a1, b1;

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


        console.log('\n' + tree.toText());
        validateResults = tree.validate();
        console.log('validate:', validateResults);
        expect(validateResults.length).toBe(0);


        expect(tree.length).toBe(6);

        childs = tree.childs.peek();

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


        console.log('\n' + tree.toText());
        validateResults = tree.validate();
        console.log('validate:', validateResults);
        expect(validateResults.length).toBe(0);


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


        console.log('\n' + tree.toText());
        validateResults = tree.validate();
        console.log('validate:', validateResults);
        expect(validateResults.length).toBe(0);
      });
    });

    describe('getItem', function() {
      beforeEach(function() {
        //
        tree.update({
          psid: null,
          sid: 'A1',
          priority: 20,
        });
        tree.update({
          psid: null,
          sid: 'A2',
          priority: 20,
        });
        tree.update({
          psid: null,
          sid: 'A3',
          priority: 20,
        });
        tree.update({
          psid: null,
          sid: 'A4',
          priority: 20,
        });
        tree.update({
          psid: null,
          sid: 'A5',
          priority: 20,
        });
        tree.update({
          psid: null,
          sid: 'A6',
          priority: 20,
        });
        //
        tree.update({
          psid: 'A1',
          sid: 'B1',
          priority: 20,
        });
        tree.update({
          psid: 'A1',
          sid: 'B2',
          priority: 20,
        });
        //
        tree.update({
          psid: 'B1',
          sid: 'C1',
          priority: 20,
        });
        tree.update({
          psid: 'B1',
          sid: 'C2',
          priority: 20,
        });
        tree.update({
          psid: 'B2',
          sid: 'C3',
          priority: 20,
        });
        tree.update({
          psid: 'B2',
          sid: 'C4',
          priority: 20,
        });
        //
        tree.update({
          psid: 'C1',
          sid: 'D1',
          priority: 20,
        });
        tree.update({
          psid: 'C1',
          sid: 'D2',
          priority: 20,
        });
        tree.update({
          psid: 'C4',
          sid: 'D3',
          priority: 20,
        });
        tree.update({
          psid: 'C4',
          sid: 'D4',
          priority: 20,
        });
      });

      it('should return item at index', function() {
        var validateResults, index = -1;

        console.log('\n' + tree.toText());
        validateResults = tree.validate();
        console.log('validate:', validateResults);
        expect(validateResults.length).toBe(0);

        expect(function() {
          tree.getItem(index++);
        }).toThrow();
        expect(tree.getItem(index++).sid).toBe('A1');
        expect(tree.getItem(index++).sid).toBe('B1');
        expect(tree.getItem(index++).sid).toBe('C1');
        expect(tree.getItem(index++).sid).toBe('D1');
        expect(tree.getItem(index++).sid).toBe('D2');
        expect(tree.getItem(index++).sid).toBe('C2');
        expect(tree.getItem(index++).sid).toBe('B2');
        expect(tree.getItem(index++).sid).toBe('C3');
        expect(tree.getItem(index++).sid).toBe('C4');
        expect(tree.getItem(index++).sid).toBe('D3');
        expect(tree.getItem(index++).sid).toBe('D4');
        expect(tree.getItem(index++).sid).toBe('A2');
        expect(tree.getItem(index++).sid).toBe('A3');
        expect(tree.getItem(index++).sid).toBe('A4');
        expect(tree.getItem(index++).sid).toBe('A5');
        expect(tree.getItem(index++).sid).toBe('A6');
        expect(function() {
          tree.getItem(index++);
        }).toThrow();


        // move A1 under A2
        tree.update({
          psid: 'A2',
          sid: 'A1',
          priority: 20,
        });

        console.log('\n' + tree.toText());
        validateResults = tree.validate();
        console.log('validate:', validateResults);
        expect(validateResults.length).toBe(0);

        index = 0;
        expect(tree.getItem(index++).sid).toBe('A2');
        expect(tree.getItem(index++).sid).toBe('A1');
        expect(tree.getItem(index++).sid).toBe('B1');
        expect(tree.getItem(index++).sid).toBe('C1');
        expect(tree.getItem(index++).sid).toBe('D1');
        expect(tree.getItem(index++).sid).toBe('D2');
        expect(tree.getItem(index++).sid).toBe('C2');
        expect(tree.getItem(index++).sid).toBe('B2');
        expect(tree.getItem(index++).sid).toBe('C3');
        expect(tree.getItem(index++).sid).toBe('C4');
        expect(tree.getItem(index++).sid).toBe('D3');
        expect(tree.getItem(index++).sid).toBe('D4');
        expect(tree.getItem(index++).sid).toBe('A3');
        expect(tree.getItem(index++).sid).toBe('A4');
        expect(tree.getItem(index++).sid).toBe('A5');
        expect(tree.getItem(index++).sid).toBe('A6');
        expect(function() {
          tree.getItem(index++);
        }).toThrow();
      });
    });
  });
});
