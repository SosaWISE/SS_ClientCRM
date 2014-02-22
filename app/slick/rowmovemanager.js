define('src/slick/rowmovemanager', [
  'slick',
  'jquery',
], function(
  Slick,
  $
) {
  'use strict';

  function RowMoveManager(options) {
    var _grid,
      _canvas,
      _dragging,
      _self = this,
      _handler = new Slick.EventHandler(),
      _defaults = {
        cancelEditOnDrag: false
      };

    function init(grid) {
      options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      _canvas = _grid.getCanvasNode();
      _handler
        .subscribe(_grid.onDragInit, handleDragInit)
        .subscribe(_grid.onDragStart, handleDragStart)
        .subscribe(_grid.onDrag, handleDrag)
        .subscribe(_grid.onDragEnd, handleDragEnd);
    }

    function destroy() {
      _handler.unsubscribeAll();
    }

    function handleDragInit(e /*, dd*/ ) {
      // prevent the grid from cancelling drag'n'drop
      e.stopImmediatePropagation();
    }

    function handleDragStart(e, dd) {
      var cell = _grid.getCellFromEvent(e),
        selectedRows, rowHeight;

      if (options.cancelEditOnDrag && _grid.getEditorLock().isActive()) {
        _grid.getEditorLock().cancelCurrentEdit();
      }

      if (_grid.getEditorLock().isActive() || !/move|selectAndMove/.test(_grid.getColumns()[cell.cell].behavior)) {
        return false;
      }

      _dragging = true;
      e.stopImmediatePropagation();

      selectedRows = _grid.getSelectedRows();

      if (selectedRows.length === 0 || $.inArray(cell.row, selectedRows) === -1) {
        selectedRows = [cell.row];
        _grid.setSelectedRows(selectedRows);
      }

      rowHeight = _grid.getOptions().rowHeight;

      dd.selectedRows = selectedRows;

      dd.selectionProxy = $("<div class='slick-reorder-proxy'/>")
        .css("position", "absolute")
        .css("zIndex", "99999")
        .css("width", $(_canvas).innerWidth())
        .css("height", rowHeight * selectedRows.length)
        .appendTo($('body'));

      dd.guide = $("<div class='slick-reorder-guide'/>")
        .css("position", "absolute")
        .css("zIndex", "99998")
        .css("width", $(_canvas).innerWidth())
        .css("top", -1000)
        .appendTo(_canvas);

      dd.insertBefore = -1;
    }

    function handleDrag(e, dd) {
      if (!_dragging) {
        return;
      }

      e.stopImmediatePropagation();

      var top = e.pageY - $(_canvas).offset().top,
        rowHeight = _grid.getOptions().rowHeight,
        hrowHeight = rowHeight / 2,
        cell, insertBefore, insertUnder, eventData;
      dd.selectionProxy.css("top", e.pageY - (hrowHeight));
      dd.selectionProxy.css("left", e.pageX - 15);

      // get cell under the selectionProxy
      dd.selectionProxy.hide();
      e.target = document.elementFromPoint(e.pageX, e.pageY);
      cell = _grid.getCellFromEvent(e);
      dd.selectionProxy.show();

      if (!cell || !/dropChild/.test(_grid.getColumns()[cell.cell].behavior)) {
        // reset values
        dd.insertUnder = -1;
        dd.canMoveUnder = false;
        //
        dd.guide
          .css("width", $(_canvas).innerWidth())
          .css("left", 0);

        insertBefore = Math.max(0, Math.min(Math.round(top / rowHeight), _grid.getDataLength()));
        if (insertBefore !== dd.insertBefore) {
          eventData = {
            "rows": dd.selectedRows,
            "insertBefore": insertBefore
          };

          if (_self.onBeforeMoveRows.notify(eventData) === false) {
            dd.guide.css("top", -1000);
            dd.canMove = false;
          } else {
            dd.guide.css("top", insertBefore * rowHeight);
            dd.canMove = true;
          }

          dd.insertBefore = insertBefore;
        }
      } else {
        // reset values
        dd.insertBefore = -1;
        dd.canMove = false;
        //
        dd.guide
          .css("width", $(_canvas).innerWidth() - 30)
          .css("left", 30);

        insertUnder = Math.max(0, Math.min(Math.round((top - hrowHeight) / rowHeight), _grid.getDataLength()));
        if (insertUnder !== dd.insertUnder) {
          eventData = {
            "rows": dd.selectedRows,
            "insertUnder": insertUnder
          };

          if (_self.onBeforeMoveChildRows.notify(eventData) === false) {
            dd.guide.css("top", -1000);
            dd.canMoveUnder = false;
          } else {
            dd.guide.css("top", (insertUnder * rowHeight) + rowHeight);
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

      var eventData;
      if (dd.canMove) {
        eventData = {
          "rows": dd.selectedRows,
          "insertBefore": dd.insertBefore
        };
        // TODO:  _grid.remapCellCssClasses ?
        _self.onMoveRows.notify(eventData);
      } else if (dd.canMoveUnder) {
        eventData = {
          "rows": dd.selectedRows,
          "insertUnder": dd.insertUnder
        };
        // TODO:  _grid.remapCellCssClasses ?
        _self.onMoveChildRows.notify(eventData);
      }
    }

    $.extend(this, {
      "onBeforeMoveRows": new Slick.Event(),
      "onMoveRows": new Slick.Event(),
      "onBeforeMoveChildRows": new Slick.Event(),
      "onMoveChildRows": new Slick.Event(),

      "init": init,
      "destroy": destroy
    });
  }

  // register namespace
  $.extend(true, window, {
    "Slick": {
      "RowMoveManager": RowMoveManager
    }
  });
});
