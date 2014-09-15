define('src/slick/moverows', [
  'src/slick/rowmovehelper',
], function(
  RowMoveHelper
) {
  'use strict';

  function MoveRows(options) {
    var _this = this,
      _rowMoveHelper = new RowMoveHelper({
        cancelEditOnDrag: true
      });

    if (!options.observableArray) {
      throw new Error('observableArray not defined');
    }
    options.orderName = options.orderName || 'SortOrder';
    options.onOrderChanged = options.onOrderChanged || function() {
      console.warn('onOrderChanged function not set');
    };

    // grid plugin funcs
    _this.init = function(grid) {
      _rowMoveHelper.register(_this, grid);
    };
    _this.destroy = function() {
      _rowMoveHelper.unregister(_this);
    };

    // handle drag/drop
    _this.onMoveRowsTest = function(reg, args) {
      // var dataView = options.dataView;
      var rowIndices = args.rows,
        i, length = rowIndices.length,
        index, nextIndex;

      for (i = 0, nextIndex = rowIndices[0]; i < length; i++, nextIndex++) {
        index = rowIndices[i];
        if (index !== nextIndex) {
          // rows are not sequential
          return true;
        }
      }

      // this only works with one row or sequential rows.
      for (i = 0; i < length; i++) {
        index = rowIndices[i];
        // no point in moving before or after itself
        if (index === args.insertBefore || index === args.insertBefore - 1) {
          // e.stopPropagation();
          return false;
        }
      }
      return true;
    };
    _this.onMoveRows = function(reg, args) {
      var grid = reg.grid,
        rowIndices = args.rows,
        insertBefore = args.insertBefore,
        moveResults, newList, changedRows;

      // move the rows
      moveResults = moveRows(rowIndices, insertBefore, options.observableArray());
      // make newList by joining top, moved, and bottom
      newList = moveResults.top.concat(moveResults.middle, moveResults.bottom);

      // update sortOrder and notify of any changes
      changedRows = updateSortOrder(rowIndices, insertBefore, options.orderName, newList);
      if (changedRows.length) {
        options.onOrderChanged(changedRows);
      }

      // refresh grid
      options.observableArray(newList);
      // reselect selected rows
      grid.setSelectedRows(getSelectedRowIndices(moveResults.top.length, rowIndices.length));
      // unselect selected cell
      grid.resetActiveCell();
    };
    _this.onMoveChildRowsTest = function(reg, args) {
      args = args;
      return false;
    };
    _this.onMoveChildRows = function(reg, args) {
      args = args;
    };
  }

  function moveRows(rowIndices, insertBefore, list) {
    // assumes rowIndices is sorted in ascending order
    var top = list.slice(0, insertBefore),
      middle = [],
      bottom = list.slice(insertBefore, list.length),
      i, rowIndex, length = rowIndices.length;

    // remove moved rows from top and bottom
    i = length;
    while (i--) { // loop in reverse
      rowIndex = rowIndices[i];
      if (rowIndex < insertBefore) {
        top.splice(rowIndex, 1);
      } else {
        bottom.splice(rowIndex - insertBefore, 1);
      }
    }

    // add moved rows to top rows
    for (i = 0; i < length; i++) {
      middle.push(list[rowIndices[i]]);
    }

    return {
      top: top,
      middle: middle,
      bottom: bottom,
    };
  }

  function updateSortOrder(rowIndices, insertBefore, orderName, newList) {
    var minIndex, maxIndex,
      i, sortOrder, row,
      changedRows = [];

    // assumes rowIndices is sorted in ascending order
    minIndex = Math.min(insertBefore, rowIndices[0]);
    maxIndex = Math.max(insertBefore - 1, rowIndices[rowIndices.length - 1]);
    // keep within array bounds
    minIndex = Math.max(minIndex, 0);
    maxIndex = Math.min(maxIndex, newList.length - 1);

    // try to use previous value's sort order
    sortOrder = (minIndex > 0) ? newList[minIndex - 1][orderName] : minIndex;

    // update sortOrder property
    for (i = minIndex; i <= maxIndex; i++) {
      row = newList[i];
      // check if order has changed
      // increment sortOrder in advance (one-based)
      if (row[orderName] !== ++sortOrder) {
        row[orderName] = sortOrder;
        changedRows.push(row);
      }
    }
    return changedRows;
  }

  function getSelectedRowIndices(topLength, movedRowsLength) {
    var i, results = [];
    for (i = 0; i < movedRowsLength; i++) {
      results.push(topLength + i);
    }
    return results;
  }

  // export functions for use in specs
  MoveRows.moveRows = moveRows;
  MoveRows.updateSortOrder = updateSortOrder;
  MoveRows.getSelectedRowIndices = getSelectedRowIndices;

  return MoveRows;
});
