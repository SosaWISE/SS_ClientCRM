define('src/slick/rowmovehelper', [
  'slick',
  'jquery',
], function(
  Slick,
  $
) {
  'use strict';

  function RowMoveHelper(options) {
    var _dragging = false,
      _this = this,
      _registrants = [];
    // _handler = new Slick.EventHandler();
    options = $.extend(true, {}, {
      cancelEditOnDrag: false,
    }, options);

    _this.register = function(owner, grid) {
      var handler = new Slick.EventHandler();
      handler
        .subscribe(grid.onDragInit, handleDragInit)
        .subscribe(grid.onDragStart, handleDragStart)
        .subscribe(grid.onDrag, handleDrag)
        .subscribe(grid.onDragEnd, handleDragEnd);

      _registrants.push({
        handler: handler,
        owner: owner,
        toGrid: grid,
        // variables that can change on every event
        canvas: null,
        fromGrid: null,
        cell: null,
      });
    };
    _this.unregister = function(owner) {
      for (var i = _registrants.length - 1; i >= 0; i--) {
        if (_registrants[i].owner === owner) {
          _registrants[i].handler.unsubscribeAll();
          _registrants.splice(i, 1);
          break;
        }
      }
    };

    function findRegistrant(e, dd) {
      var canvas, result;
      // get element under the selectionProxy and guide
      if (dd.selectionProxy) {
        dd.selectionProxy.hide();
        dd.guide.hide();
      }
      e.target = document.elementFromPoint(e.pageX, e.pageY);
      if (dd.selectionProxy) {
        dd.selectionProxy.show();
        dd.guide.show();
      }
      // find first parent with .grid-canvas class
      canvas = $(e.target).closest('.grid-canvas')[0];

      // get registrant by canvas
      _registrants.some(function(reg) {
        if (reg.toGrid.getCanvasNode() === canvas) {
          // set variables
          reg.fromGrid = dd.grid;
          reg.canvas = canvas;
          reg.cell = reg.toGrid.getCellFromEvent(e);

          // set result
          result = reg;
          return true;
        }
      });
      return result;
    }

    function handleDragInit(e, dd) {
      var reg = findRegistrant(e, dd);
      if (!reg) {
        console.warn('handleDragInit, no registrant');
        return;
      }
      if (reg.owner.onDragInit) {
        reg.owner.onDragInit(e, reg);
      } else {
        // prevent the grid from cancelling drag'n'drop
        e.stopImmediatePropagation();
      }
    }

    function handleDragStart(e, dd) {
      var toGrid, canvas, cell, reg = findRegistrant(e, dd),
        rowHeight, selectedRows;
      if (!reg) {
        console.warn('handleDragStart, no registrant');
        return;
      }
      toGrid = reg.toGrid;
      canvas = reg.canvas;
      cell = reg.cell;

      if (options.cancelEditOnDrag) {
        // cancel edits on all grids
        _registrants.forEach(function(reg) {
          if (reg.toGrid.getEditorLock().isActive()) {
            reg.toGrid.getEditorLock().cancelCurrentEdit();
          }
        });
      }
      // cancel drag if one grid has an editor lock
      if (_registrants.some(function(reg) {
        return reg.toGrid.getEditorLock().isActive();
      })) {
        return false;
      }
      // cancel drag if the selected column isn't draggable
      if (!/^move$/.test(toGrid.getColumns()[cell.cell].behavior)) {
        return false;
      }

      // let the dragging begin!
      _dragging = true;
      e.stopImmediatePropagation();

      //
      rowHeight = toGrid.getOptions().rowHeight;
      // get selected rows
      selectedRows = toGrid.getSelectedRows();
      // ensure the dragging row is a selected row
      if (selectedRows.length === 0 || $.inArray(cell.row, selectedRows) === -1) {
        selectedRows = [cell.row];
        toGrid.setSelectedRows(selectedRows);
      } else {
        sortRowIndices(selectedRows);
      }
      dd.selectedRows = selectedRows;

      dd.selectionProxy = $("<div class='slick-reorder-proxy'/>")
        .css("position", "absolute")
        .css("zIndex", "99999")
        .css("width", $(canvas).innerWidth())
        .css("height", rowHeight * selectedRows.length)
        .css("top", -1000)
        .appendTo($('body'));

      dd.guide = $("<div class='slick-reorder-guide'/>")
        .css("position", "absolute")
        .css("zIndex", "99998")
        .css("width", $(canvas).innerWidth())
        .css("top", -1000)
        .appendTo($('body'));

      dd.insertBefore = -1;
    }

    function handleDrag(e, dd) {
      if (!_dragging) {
        return;
      }
      //
      e.stopImmediatePropagation();
      dd.selectionProxy.css("top", e.pageY - (dd.grid.getOptions().rowHeight / 2));
      dd.selectionProxy.css("left", e.pageX - 15);

      var owner, toGrid, canvas, cell, reg = findRegistrant(e, dd),
        offset, firstColWidth, top, rowHeight, hrowHeight,
        insertBefore, insertUnder, eventArgs;
      if (!reg) {
        console.warn('handleDrag, no registrant');
        // set positions since no registrant is found
        dd.selectionProxy.css("top", e.pageY - (dd.grid.getOptions().rowHeight / 2));
        dd.selectionProxy.css("left", e.pageX - 15);
        dd.guide.css("top", -1000); // off screen
        return;
      }

      owner = reg.owner;
      toGrid = reg.toGrid;
      canvas = reg.canvas;
      cell = reg.cell;
      offset = $(canvas).offset();
      top = e.pageY - offset.top;
      rowHeight = toGrid.getOptions().rowHeight;
      hrowHeight = rowHeight / 2;

      dd.selectionProxy.css("top", e.pageY - (hrowHeight));
      dd.selectionProxy.css("left", e.pageX - 15);

      if (!cell || !/^dropChild$/.test(toGrid.getColumns()[cell.cell].behavior)) {
        // reset values
        dd.insertUnder = -1;
        dd.canMoveUnder = false;
        //
        dd.guide
          .css("width", $(canvas).innerWidth())
          .css("left", offset.left);

        insertBefore = Math.max(0, Math.min(Math.round(top / rowHeight), toGrid.getDataLength()));
        if (insertBefore !== dd.insertBefore) {
          eventArgs = {
            "rows": dd.selectedRows,
            "insertBefore": insertBefore
          };

          if (owner.onMoveRowsTest(reg, eventArgs) === false) {
            dd.guide.css("top", -1000); // off screen

            dd.canMove = false;
          } else {
            dd.guide.css("top", (insertBefore * rowHeight) + offset.top);
            dd.canMove = true;
          }

          dd.insertBefore = insertBefore;
        }
      } else {
        // reset values
        dd.insertBefore = -1;
        dd.canMove = false;
        //
        //@HACK: that assumes dropChild is the second column and that the grid is scrolled all the way to the left,
        //       but it's better than the previous hack which also assumed the first column's width never changed
        firstColWidth = toGrid.getColumns()[0].width;
        dd.guide
          .css("width", $(canvas).innerWidth() - firstColWidth)
          .css("left", firstColWidth + offset.left);

        insertUnder = Math.max(0, Math.min(Math.round((top - hrowHeight) / rowHeight), toGrid.getDataLength()));
        if (insertUnder !== dd.insertUnder) {
          eventArgs = {
            "rows": dd.selectedRows,
            "insertUnder": insertUnder
          };

          if (owner.onMoveChildRowsTest(reg, eventArgs) === false) {
            dd.guide.css("top", -1000); // off screen
            dd.canMoveUnder = false;
          } else {
            dd.guide.css("top", (insertUnder * rowHeight) + rowHeight + offset.top);
            dd.canMoveUnder = true;
          }

          dd.insertUnder = insertUnder;
        }
      }
    }

    function handleDragEnd(e, dd) {
      if (!_dragging) {
        return;
      }
      _dragging = false;
      e.stopImmediatePropagation();

      dd.guide.remove();
      dd.selectionProxy.remove();

      var owner, reg = findRegistrant(e, dd),
        eventArgs;
      if (!reg) {
        console.warn('handleDragEnd, no registrant');
        return;
      }
      owner = reg.owner;

      if (dd.canMove) {
        eventArgs = {
          "rows": dd.selectedRows,
          "insertBefore": dd.insertBefore
        };
        // TODO:  _grid.remapCellCssClasses ?
        owner.onMoveRows(reg, eventArgs);
      } else if (dd.canMoveUnder) {
        eventArgs = {
          "rows": dd.selectedRows,
          "insertUnder": dd.insertUnder
        };
        // TODO:  _grid.remapCellCssClasses ?
        owner.onMoveChildRows(reg, eventArgs);
      }
    }

    function sortRowIndices(rowIndices) {
      // preserve row order - make sure they are in
      // ascending order, not the order they were selected
      rowIndices.sort(function(a, b) {
        return a - b;
      });
    }
  }

  return RowMoveHelper;
});
