define('spec/app/vm.combo.spec', [
  'src/vm.combo'
], function(
  ComboViewModel
) {
  "use strict";

  describe('vm.combo', function() {
    var c, list;
    beforeEach(function() {
      c = new ComboViewModel();
      c.setList([
        {
          text: 'abcdef',
        },
        {
          text: 'bcdefa',
        },
        {
          text: 'cdefab',
        },
        {
          text: 'defabc',
        },
        {
          text: 'efabcd',
        },
        {
          text: 'fabcde',
        },
        {
          text: 'aBcdefabcdef',
        },
      ]);
      list = c.list();
    });

    it('first item should be selected', function() {
      expect(c.selectedItem()).toBe(list[0]);
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
