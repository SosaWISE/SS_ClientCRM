define('src/slick/movesubrows', [
  'src/slick/rowmovehelper',
], function(
  RowMoveHelper
) {
  'use strict';

  //@NOTE: currently only supports one selected row at a time

  function MoveSubRows(options) {
    var _this = this,
      _rowMoveHelper = options.rowMoveHelper || new RowMoveHelper({
        cancelEditOnDrag: true,
      });

    // grid plugin funcs
    _this.init = function(grid) {
      _rowMoveHelper.register(_this, grid);
    };
    _this.destroy = function() {
      _rowMoveHelper.unregister(_this);
    };

    // handle drag/drop
    _this.onDragInit = function(e, reg) {
      var fromData = reg.fromGrid.getData(),
        item = fromData.getItem(reg.cell.row);
      if (true || item.canMove) {
        // prevent the grid from cancelling drag'n'drop by default
        e.stopImmediatePropagation();
      }
    };
    _this.onMoveRowsTest = function(reg, args) {
      var fromData = reg.fromGrid.getData(),
        toData = reg.toGrid.getData();
      return toData.insertSiblingTest(fromData.getItem(args.rows[0]), toData.getItem(args.insertBefore));
    };
    _this.onMoveRows = function(reg, args) {
      var fromData = reg.fromGrid.getData(),
        toData = reg.toGrid.getData();
      toData.insertSibling(fromData.getItem(args.rows[0]), toData.getItem(args.insertBefore));
    };
    _this.onMoveChildRowsTest = function(reg, args) {
      var fromData = reg.fromGrid.getData(),
        toData = reg.toGrid.getData();
      return toData.insertChildTest(fromData.getItem(args.rows[0]), toData.getItem(args.insertUnder));
    };
    _this.onMoveChildRows = function(reg, args) {
      var fromData = reg.fromGrid.getData(),
        toData = reg.toGrid.getData();
      toData.insertChild(fromData.getItem(args.rows[0]), toData.getItem(args.insertUnder));
    };
  }

  return MoveSubRows;
});
