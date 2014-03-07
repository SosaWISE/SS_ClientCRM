define('src/slick/movesubrows', [
  'src/slick/rowmovemanager',
  'slick',
  'jquery',
], function(
  RowMoveManager,
  Slick,
  jquery
) {
  'use strict';

  function MoveSubRows(options) {
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

    if (!options.dataView) {
      throw new Error('dataView not defined');
    }

    jquery.extend(_this, {
      'destroy': function() {
        _moveRowsPlugin.destroy();
        _handler.unsubscribeAll();
      },
      'init': function(grid) {
        _grid = grid;
        _grid.registerPlugin(_moveRowsPlugin);
        _handler.subscribe(_grid.onDragInit, handleDragInit);
        _handler.subscribe(_moveRowsPlugin.onBeforeMoveRows, handleBeforeMoveRows);
        _handler.subscribe(_moveRowsPlugin.onMoveRows, handleMoveRows);
        _handler.subscribe(_moveRowsPlugin.onBeforeMoveChildRows, handleBeforeMoveChildRows);
        _handler.subscribe(_moveRowsPlugin.onMoveChildRows, handleMoveChildRows);
      },
    });

    function handleDragInit(e /*, dd*/ ) {
      var cell = _grid.getCellFromEvent(e),
        item = options.dataView.getItem(cell.row);
      if (item.canMove) {
        // prevent the grid from cancelling drag'n'drop by default
        e.stopImmediatePropagation();
      }
    }

    function handleBeforeMoveRows(e, args) {
      var sibling = options.dataView.getItem(args.rows[0]),
        item = options.dataView.getItem(args.insertBefore),
        parent = item.getParent();
      return sibling !== item && parent.acceptsChild(sibling);
    }

    function handleMoveRows(e, args) {
      var sibling = options.dataView.getItem(args.rows[0]),
        item = options.dataView.getItem(args.insertBefore);

      item.onDropSibling(sibling);

      //@TODO: do correctly in backlogdata.js ?????
      // refresh grid
      _grid.invalidate();
      _grid.render();
      // reselect selected rows
      _grid.setSelectedRows([sibling.getIndex()]);
      // unselect selected cell
      _grid.resetActiveCell();
    }

    function handleBeforeMoveChildRows(e, args) {
      var child = options.dataView.getItem(args.rows[0]),
        item = options.dataView.getItem(args.insertUnder);
      return item.acceptsChild(child);
    }

    function handleMoveChildRows(e, args) {
      var child = options.dataView.getItem(args.rows[0]),
        item = options.dataView.getItem(args.insertUnder);

      item.onDropChild(child);

      //@TODO: do correctly in backlogdata.js ?????
      // refresh grid
      _grid.invalidate();
      _grid.render();
      // reselect selected rows
      _grid.setSelectedRows([child.getIndex()]);
      // unselect selected cell
      _grid.resetActiveCell();
    }
  }

  return MoveSubRows;
});
