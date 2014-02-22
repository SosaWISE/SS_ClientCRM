define('src/slick/moverows', [
  'src/slick/rowmovemanager',
  'slick',
  'jquery',
], function(
  RowMoveManager,
  Slick,
  jquery
) {
  'use strict';

  function MoveRows(options) {
    var _this = this,
      _grid,
      _handler = new Slick.EventHandler(),
      _moveRowsPlugin = new Slick.RowMoveManager({
        cancelEditOnDrag: true
      });

    options = jquery.extend(true, {}, {
      orderName: 'SortOrder',
      onOrderChanged: function() {
        console.warn('onOrderChanged function not set');
      },
    }, options);

    if (!options.observableArray) {
      throw new Error('observableArray not defined');
    }

    jquery.extend(_this, {
      'destroy': function() {
        _moveRowsPlugin.destroy();
        _handler.unsubscribeAll();
      },
      'init': function(grid) {
        _grid = grid;
        _grid.registerPlugin(_moveRowsPlugin);
        _handler.subscribe(_grid.onDragInit, onDragInit);
        _handler.subscribe(_moveRowsPlugin.onBeforeMoveRows, onBeforeMoveRows);
        _handler.subscribe(_moveRowsPlugin.onMoveRows, onMoveRows);
        _handler.subscribe(_moveRowsPlugin.onBeforeMoveChildRows, onBeforeMoveChildRows);
        _handler.subscribe(_moveRowsPlugin.onMoveChildRows, onMoveChildRows);
      },
    });

    function onDragInit(e /*, dd*/ ) {
      // prevent the grid from cancelling drag'n'drop by default
      e.stopImmediatePropagation();
    }

    function onBeforeMoveRows(e, data) {
      var rowIndices = data.rows,
        i, length = rowIndices.length,
        index, nextIndex;

      sortRowIndices(rowIndices);

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
        if (index === data.insertBefore || index === data.insertBefore - 1) {
          e.stopPropagation();
          return false;
        }
      }
      return true;
    }

    function onMoveRows(e, args) {
      var rowIndices = args.rows,
        insertBefore = args.insertBefore,
        moveResults, newList, changedRows;

      // rowIndices should already be sorted in OnBeforeMoveRows
      // sortRowIndices(rowIndices);

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
      _grid.setSelectedRows(getSelectedRowIndices(moveResults.top.length, rowIndices.length));
      // unselect selected cell
      _grid.resetActiveCell();
    }

    function onBeforeMoveChildRows(e, data) {
      var rowIndices = data.rows,
        i, length = rowIndices.length,
        index;

      sortRowIndices(rowIndices);

      // this only works with one row or sequential rows.
      for (i = 0; i < length; i++) {
        index = rowIndices[i];
        // can't move under self
        if (index === data.insertUnder) {
          e.stopPropagation();
          return false;
        }
        //@TODO: need to ask the row value it's self if the data can be a child of it
      }
      return true;
    }

    function onMoveChildRows(e, args) {
      var rowIndices = args.rows,
        insertBefore = args.insertUnder + 1,
        moveResults, newList, changedRows;
      //@TODO: this is basically copied from onMoveRows. it needs to be changed to work with childs.

      // rowIndices should already be sorted in OnBeforeMoveChildRows
      // sortRowIndices(rowIndices);

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
      _grid.setSelectedRows(getSelectedRowIndices(moveResults.top.length, rowIndices.length));
      // unselect selected cell
      _grid.resetActiveCell();
    }
  }

  function sortRowIndices(rowIndices) {
    // preserve row order - make sure they are in
    // ascending order, not the order they were selected
    rowIndices.sort(function(a, b) {
      return a - b;
    });
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


  MoveRows.moveRows = moveRows;
  MoveRows.updateSortOrder = updateSortOrder;
  MoveRows.getSelectedRowIndices = getSelectedRowIndices;

  return MoveRows;
});
