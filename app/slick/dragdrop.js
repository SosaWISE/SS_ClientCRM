define('src/slick/dragdrop', [
  'src/slick/draghub',
], function(
  DragHub
) {
  'use strict';

  //@NOTE: currently only supports one selected row at a time

  function DragDrop(options) {
    var _this = this,
      _dragHub = options.dragHub || new DragHub({
        cancelEditOnDrag: true,
      });

    // grid plugin funcs
    _this.init = function(grid) {
      _dragHub.register(_this, grid);
    };
    _this.destroy = function() {
      _dragHub.unregister(_this);
    };

    // handle drag/drop
    _this.onDragInit = function(e, reg) {
      var fromData = reg.fromGrid.getData(),
        item = fromData.getItem(reg.gridCell.row);
      if (true || item.canMove) {
        // prevent the grid from cancelling drag'n'drop by default
        e.stopImmediatePropagation();
      }
    };

    _this.canDrop = function(reg, args) {
      args = args;

      //@TODO: actually calculate dropData
      return {
        type: 'before',
        row: reg.beforeRow,
        parentRow: Math.max(0, reg.beforeRow - 3),
        cell: 1,
        indent: 10,
      };
    };
    _this.onDrop = function(reg, args) {
      var dropData = _this.canDrop(reg, args);
      if (!dropData) {
        throw new Error('cannot drop');
      }

      var fromData = reg.fromGrid.getData(),
        toData = reg.toGrid.getData();
      switch (dropData.type) {
        case 'before':
          toData.insertSibling(fromData.getItem(args.rows[0]), toData.getItem(dropData.row));
          break;
          // case 'child':
          //   toData.insertChild(fromData.getItem(args.rows[0]), toData.getItem(dropData.row));
          //   break;
      }
    };

    // _this.onMoveRowsTest = function(reg, args) {
    //   var fromData = reg.fromGrid.getData(),
    //     toData = reg.toGrid.getData();
    //   return toData.insertSiblingTest(fromData.getItem(args.rows[0]), toData.getItem(args.insertBefore));
    // };
    // _this.onMoveRows = function(reg, args) {
    //   var fromData = reg.fromGrid.getData(),
    //     toData = reg.toGrid.getData();
    //   toData.insertSibling(fromData.getItem(args.rows[0]), toData.getItem(args.insertBefore));
    // };
    // _this.onMoveChildRowsTest = function(reg, args) {
    //   var fromData = reg.fromGrid.getData(),
    //     toData = reg.toGrid.getData();
    //   return toData.insertChildTest(fromData.getItem(args.rows[0]), toData.getItem(args.insertUnder));
    // };
    // _this.onMoveChildRows = function(reg, args) {
    //   var fromData = reg.fromGrid.getData(),
    //     toData = reg.toGrid.getData();
    //   toData.insertChild(fromData.getItem(args.rows[0]), toData.getItem(args.insertUnder));
    // };
  }

  return DragDrop;
});
