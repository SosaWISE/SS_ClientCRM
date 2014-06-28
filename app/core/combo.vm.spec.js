/* global describe, it, expect, beforeEach */
define('src/core/combo.vm.spec', [
  'src/core/combo.vm'
], function(
  ComboViewModel
) {
  "use strict";

  describe('combo.vm', function() {
    var c, list;
    beforeEach(function() {
      c = new ComboViewModel();
      c.setList([ //
        {
          value: 1,
          text: 'abcdef',
        }, {
          value: 2,
          text: 'bcdefa',
        }, {
          value: 3,
          text: 'cdefab',
        }, {
          value: 4,
          text: 'defabc',
        }, {
          value: 5,
          text: 'efabcd',
        }, {
          value: 6,
          text: 'fabcde',
        }, {
          value: 7,
          text: 'aBcdefabcdef',
        },
      ]);
      list = c.list();
    });

    it('should start no item selected', function() {
      expect(c.selected().item.value).toBe(null);
      expect(c.selectedItem()).toBe(null);
      expect(c.selectedValue()).toBe(null);
    });

    describe('filterText', function() {
      beforeEach(function() {
        c.filterText('bce');
      });

      it('should set `matches` property', function() {
        expect(list[0].matches()).toBe(true);
        expect(list[1].matches()).toBe(true);
        expect(list[2].matches()).toBe(false);
        expect(list[3].matches()).toBe(false);
        expect(list[4].matches()).toBe(false);
        expect(list[5].matches()).toBe(true);
        expect(list[6].matches()).toBe(true);
      });
      it('should set `html` property', function() {
        expect(list[0].html()).toBe('a<b>b</b><b>c</b>d<b>e</b>f');
        expect(list[1].html()).toBe('<b>b</b><b>c</b>d<b>e</b>fa');
        expect(list[2].html()).toBe('cdefab');
        expect(list[3].html()).toBe('defabc');
        expect(list[4].html()).toBe('efabcd');
        expect(list[5].html()).toBe('fa<b>b</b><b>c</b>d<b>e</b>');
        expect(list[6].html()).toBe('a<b>B</b><b>c</b>d<b>e</b>fabcdef');
      });
    });

    describe('activateNext', function() {
      function expectActiveIndex(index) {
        expect(list[index].active()).toBe(true);
        list.forEach(function(item, i) {
          if (i !== index) {
            expect(item.active()).toBe(false);
          }
        });
      }

      it('should correctly select the next items down', function() {
        c.activateNext(true);
        expectActiveIndex(0);
        c.activateNext(true);
        expectActiveIndex(1);
        c.activateNext(true);
        expectActiveIndex(2);
        c.activateNext(true);
        expectActiveIndex(3);
        c.activateNext(true);
        expectActiveIndex(4);
        c.activateNext(true);
        expectActiveIndex(5);
        c.activateNext(true);
        expectActiveIndex(6);
        c.activateNext(true);
        expectActiveIndex(0);
        c.activateNext(true);
        expectActiveIndex(1);
      });
      it('when items are filtered it should correctly select the next items down', function() {
        c.filterText('bce');
      });
      it('should correctly select the next items up', function() {
        c.activateNext(false);
        expectActiveIndex(6);
        c.activateNext(false);
        expectActiveIndex(5);
        c.activateNext(false);
        expectActiveIndex(4);
        c.activateNext(false);
        expectActiveIndex(3);
        c.activateNext(false);
        expectActiveIndex(2);
        c.activateNext(false);
        expectActiveIndex(1);
        c.activateNext(false);
        expectActiveIndex(0);
        c.activateNext(false);
        expectActiveIndex(6);
      });
    });
  });
});
