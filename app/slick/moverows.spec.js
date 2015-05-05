/* global beforeEach, describe, it, expect */
define('src/slick/moverows.spec', [
  'ko',
  'src/slick/moverows',
], function(
  ko,
  MoveRows
) {
  "use strict";

  describe('MoveRows', function() {
    it('should have a `moveRows` function', function() {
      expect(typeof MoveRows.moveRows).toBe('function');
    });
    it('should have an `updateSortOrder` function', function() {
      expect(typeof MoveRows.updateSortOrder).toBe('function');
    });
    it('should have a `getSelectedRowIndices` function', function() {
      expect(typeof MoveRows.getSelectedRowIndices).toBe('function');
    });

    describe('moveRows', function() {
      var list;
      beforeEach(function() {
        list = [ //
          {
            ID: 1,
            SortOrder: 1,
          }, {
            ID: 2,
            SortOrder: 2,
          }, {
            ID: 3,
            SortOrder: 3,
          }, {
            ID: 4,
            SortOrder: 4,
          }, {
            ID: 5,
            SortOrder: 5,
          },
        ];
      });
      it('should return top, middle, bottom arrays', function() {
        var moveResults = MoveRows.moveRows([1, 3], 5, list);

        expect(moveResults.top.length).toBe(3);
        expect(moveResults.top[0].ID).toBe(1);
        expect(moveResults.top[1].ID).toBe(3);
        expect(moveResults.top[2].ID).toBe(5);

        expect(moveResults.middle.length).toBe(2);
        expect(moveResults.middle[0].ID).toBe(2);
        expect(moveResults.middle[1].ID).toBe(4);

        expect(moveResults.bottom.length).toBe(0);
      });
      it('should move to bottom', function() {
        var moveResults = MoveRows.moveRows([0, 1, 2, 3], 5, list);

        expect(moveResults.top.length).toBe(1);
        expect(moveResults.top[0].ID).toBe(5);

        expect(moveResults.middle.length).toBe(4);
        expect(moveResults.middle[0].ID).toBe(1);
        expect(moveResults.middle[1].ID).toBe(2);
        expect(moveResults.middle[2].ID).toBe(3);
        expect(moveResults.middle[3].ID).toBe(4);

        expect(moveResults.bottom.length).toBe(0);
      });
      it('should move to top', function() {
        var moveResults = MoveRows.moveRows([1, 2, 3, 4], 0, list);

        expect(moveResults.top.length).toBe(0);

        expect(moveResults.middle.length).toBe(4);
        expect(moveResults.middle[0].ID).toBe(2);
        expect(moveResults.middle[1].ID).toBe(3);
        expect(moveResults.middle[2].ID).toBe(4);
        expect(moveResults.middle[3].ID).toBe(5);

        expect(moveResults.bottom.length).toBe(1);
        expect(moveResults.bottom[0].ID).toBe(1);
      });
      it('moved rows should not be in top or bottom arrays', function() {
        var moveResults = MoveRows.moveRows([0, 4], 3, list);

        expect(moveResults.top.length).toBe(2);
        expect(moveResults.top[0].ID).toBe(2);
        expect(moveResults.top[1].ID).toBe(3);

        expect(moveResults.middle.length).toBe(2);
        expect(moveResults.middle[0].ID).toBe(1);
        expect(moveResults.middle[1].ID).toBe(5);

        expect(moveResults.bottom.length).toBe(1);
        expect(moveResults.bottom[0].ID).toBe(4);
      });
    });

    describe('updateSortOrder', function() {
      it('should start after sort order of prev item', function() {
        var newList, changedRows;
        newList = [ //
          {
            ID: 1,
            SortOrder: 5,
          }, {
            ID: 3,
            SortOrder: 0,
          }, {
            ID: 5,
            SortOrder: 0,
          }, {
            ID: 2,
            SortOrder: 0,
          }, {
            ID: 4,
            SortOrder: 0,
          },
        ];
        changedRows = MoveRows.updateSortOrder([1, 3], 5, 'SortOrder', newList);

        expect(newList[0].SortOrder).toBe(5);
        expect(newList[1].SortOrder).toBe(6);
        expect(newList[2].SortOrder).toBe(7);
        expect(newList[3].SortOrder).toBe(8);
        expect(newList[4].SortOrder).toBe(9);

        expect(changedRows[0].SortOrder).toBe(6);
        expect(changedRows[1].SortOrder).toBe(7);
        expect(changedRows[2].SortOrder).toBe(8);
        expect(changedRows[3].SortOrder).toBe(9);
      });
      it('should modify rows with a position that has changed', function() {
        var newList, changedRows;
        newList = [ //
          {
            ID: 1,
            SortOrder: 1,
          }, {
            ID: 3,
            SortOrder: 0,
          }, {
            ID: 5,
            SortOrder: 0,
          }, {
            ID: 2,
            SortOrder: 0,
          }, {
            ID: 4,
            SortOrder: 0,
          },
        ];
        changedRows = MoveRows.updateSortOrder([1, 3], 5, 'SortOrder', newList);

        expect(newList[0].SortOrder).toBe(1);
        expect(newList[1].SortOrder).toBe(2);
        expect(newList[2].SortOrder).toBe(3);
        expect(newList[3].SortOrder).toBe(4);
        expect(newList[4].SortOrder).toBe(5);

        expect(changedRows[0].SortOrder).toBe(2);
        expect(changedRows[1].SortOrder).toBe(3);
        expect(changedRows[2].SortOrder).toBe(4);
        expect(changedRows[3].SortOrder).toBe(5);
      });
      it('should modify all relevant rows', function() {
        var newList, changedRows;
        newList = [ //
          {
            ID: 2,
            SortOrder: 0,
          }, {
            ID: 3,
            SortOrder: 0,
          }, {
            ID: 1,
            SortOrder: 0,
          }, {
            ID: 5,
            SortOrder: 0,
          }, {
            ID: 4,
            SortOrder: 0,
          },
        ];
        changedRows = MoveRows.updateSortOrder([0, 4], 3, 'SortOrder', newList);

        expect(newList[0].SortOrder).toBe(1);
        expect(newList[1].SortOrder).toBe(2);
        expect(newList[2].SortOrder).toBe(3);
        expect(newList[3].SortOrder).toBe(4);
        expect(newList[4].SortOrder).toBe(5);

        expect(changedRows[0].SortOrder).toBe(1);
        expect(changedRows[1].SortOrder).toBe(2);
        expect(changedRows[2].SortOrder).toBe(3);
        expect(changedRows[3].SortOrder).toBe(4);
        expect(changedRows[4].SortOrder).toBe(5);
      });
    });

    describe('getSelectedRowIndices', function() {
      it('should return which rows are selected', function() {
        var selectedRowIndices = MoveRows.getSelectedRowIndices(3, 2);
        expect(selectedRowIndices.length).toBe(2);
        expect(selectedRowIndices[0]).toBe(3);
        expect(selectedRowIndices[1]).toBe(4);
      });
    });
  });
});
