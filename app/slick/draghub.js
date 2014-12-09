define("src/slick/draghub", [
  "slick",
  "jquery",
], function(
  Slick,
  $
) {
  "use strict";

  var _topOffScreen = -1000;

  function DragHub(options) {
    var _dragging = false,
      _this = this,
      _registrants = [];
    // _handler = new Slick.EventHandler();
    options = $.extend(true, {}, {
      cancelEditOnDrag: false,
    }, options);

    _this.unregister = function(owner) {
      for (var i = _registrants.length - 1; i >= 0; i--) {
        if (_registrants[i].owner === owner) {
          _registrants[i].handler.unsubscribeAll();
          _registrants.splice(i, 1);
          break;
        }
      }
    };
    _this.register = function(owner, grid) {
      var handler = new Slick.EventHandler()
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
        viewPort: null,
        fromGrid: null,
        gridCell: null,
        canvasOffset: null,
        beforeRow: null,
      });
    };

    function handleDragInit(e, dd) {
      var reg = findRegistrant(_registrants, e, dd);
      if (!reg) {
        console.warn("handleDragInit, no registrant");
        return;
      }
      if (reg.owner.onDragInit) {
        reg.owner.onDragInit(e, reg);
      } else {
        // default behavior
        // prevent the grid from cancelling drag'n'drop
        e.stopImmediatePropagation();
      }
    }

    function handleDragStart(e, dd) {
      var reg = findRegistrant(_registrants, e, dd),
        toGrid, gridCell, rowHeight, selectedRows;
      if (!reg) {
        console.warn("handleDragStart, no registrant");
        return;
      }
      toGrid = reg.toGrid;
      gridCell = reg.gridCell;

      if (options.cancelEditOnDrag) {
        // cancel edits on all grids
        _registrants.forEach(function(reg) {
          if (reg.toGrid.getEditorLock().isActive()) {
            reg.toGrid.getEditorLock().cancelCurrentEdit();
          }
        });
      }

      function hasActiveEditorLock(reg) {
        return reg.toGrid.getEditorLock().isActive();
      }

      // cancel drag if one grid has an editor lock
      if (_registrants.some(hasActiveEditorLock)) {
        return false;
      }
      // cancel drag if the selected column isn't draggable
      if (!/^move$/.test(toGrid.getColumns()[gridCell.cell].behavior)) {
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
      if (selectedRows.length === 0 || $.inArray(gridCell.row, selectedRows) === -1) {
        selectedRows = [gridCell.row];
        toGrid.setSelectedRows(selectedRows);
      } else {
        sortRowIndices(selectedRows);
      }
      dd.selectedRows = selectedRows;

      //
      dd.guides = new Array(3); // [pre, vrt, sub]
      $("body")
        .append(dd.guides[0] = $("<div class='slick-reorder-guide'/>"))
        .append(dd.guides[1] = $("<div class='slick-reorder-guide'/>"))
        .append(dd.guides[2] = $("<div class='slick-reorder-guide'/>"))
        .append(dd.selectionProxy = $("<div class='slick-reorder-proxy'/>")
          .css("width", $(reg.canvas).innerWidth())
          .css("height", rowHeight * selectedRows.length));
      // hide all
      dd.guides.forEach(offScreen);
      offScreen(dd.selectionProxy);
    }

    function handleDrag(e, dd) {
      if (!_dragging) {
        return;
      }
      //
      e.stopImmediatePropagation();
      // set proxy position to mouse position
      dd.selectionProxy.css("top", e.pageY - (dd.grid.getOptions().rowHeight / 2));
      dd.selectionProxy.css("left", e.pageX + 2); // move the proxy to the right of where the mouse is.

      var reg = findRegistrant(_registrants, e, dd),
        dropData, toGrid, guides;
      if (!reg) {
        console.warn("handleDrag, no registrant");
        // hide guides
        dd.guides.forEach(offScreen);
        // clear drop data
        dd._prevDropData = null;
        return;
      }

      // if drop not accepted should return null or false
      // if drop is accepted, should return {
      //    // required
      //    "type": "child", (child|after|before|on)
      //    "row": 2,
      //    // optional
      //    "parentRow": 1, // defaults to "row"
      //    "cell": 0, // defaults to 0
      //    "indent": 10, (pixels to indent from cell start) // defaults to 0
      // } (info needed to draw drop guides)
      dropData = reg.owner.canDrop(reg, {
        rows: dd.selectedRows,
      });
      if (!dropData) {
        console.info("no drop data");
        // hide guides
        dd.guides.forEach(offScreen);
        // clear drop data
        dd._prevDropData = null;
        return;
      }
      // validate drop data
      if (!dropData.type || (!dropData.row && dropData.row !== 0)) {
        throw new Error("invalid drop data");
      }
      // set defaults
      if (!dropData.parentRow && dropData.parentRow !== 0) {
        dropData.parentRow = dropData.row - 1;
      }
      dropData.cell = dropData.cell || 0;
      dropData.indent = dropData.indent || 0;

      // test for change
      if (dropDataAreEqual(dd._prevDropData, dropData)) {
        // nothing changed since last time
        return;
      }
      dd._prevDropData = dropData;

      //
      toGrid = reg.toGrid;

      // calculate guide positions and sizes
      guides = calcGuides(dropData, reg.canvasOffset, {
        rowHeight: toGrid.getOptions().rowHeight,
        dataLength: toGrid.getDataLength(),
        columns: toGrid.getColumns(),
      }, reg.viewPort);

      dd.guides.forEach(function(guide, index) {
        guide.css(guides[index]);
      });
    }

    function handleDragEnd(e, dd) {
      if (!_dragging) {
        return;
      }
      _dragging = false;
      e.stopImmediatePropagation();

      dd.selectionProxy.remove();
      dd.guides.forEach(function(guide) {
        guide.remove();
      });

      var reg = findRegistrant(_registrants, e, dd);
      if (!reg) {
        console.warn("handleDragEnd, no registrant");
        return;
      }
      reg.owner.onDrop(reg, {
        rows: dd.selectedRows,
      });
    }
  }

  function sortRowIndices(rowIndices) {
    // preserve row order - make sure they are in
    // ascending order, not the order they were selected
    rowIndices.sort(function(a, b) {
      return a - b;
    });
  }

  function offScreen(el) {
    el.css("top", _topOffScreen);
  }

  function dropDataAreEqual(pdd, dropData) {
    return pdd &&
      pdd.type === dropData.type &&
      pdd.row === dropData.row &&
      pdd.parentRow === dropData.parentRow &&
      pdd.cell === dropData.cell &&
      pdd.indent === dropData.indent;
  }

  function findRegistrant(_registrants, e, dd) {
    var canvas, result, offset, $el;
    // get element under the selectionProxy and guide
    if (dd.selectionProxy) {
      // dd.selectionProxy.hide(); // no need to hide since it is no long under the mouse, it is to the right of the mouse.
      dd.guides.forEach(function(guide) {
        guide.hide();
      });
    }
    e.target = document.elementFromPoint(e.pageX, e.pageY);
    if (dd.selectionProxy) {
      // dd.selectionProxy.show();
      dd.guides.forEach(function(guide) {
        guide.show();
      });
    }
    // find first parent with .grid-canvas class
    canvas = $(e.target).closest(".grid-canvas")[0];

    // get registrant by canvas
    _registrants.some(function(reg) {
      if (reg.toGrid.getCanvasNode() === canvas) {
        // set variables
        reg.canvas = canvas;
        reg.fromGrid = dd.grid;
        reg.gridCell = reg.toGrid.getCellFromEvent(e);

        $el = $(canvas);
        reg.canvasOffset = offset = $el.offset();
        reg.beforeRow = Math.max(0, Math.min(Math.round((e.pageY - offset.top) / reg.toGrid.getOptions().rowHeight), reg.toGrid.getDataLength()));

        $el = $el.parent();
        reg.viewPort = offset = $el.offset();
        offset.width = $el.width();
        offset.height = $el.height() + 2; // add to height in order to show guides at bottom of grid

        // set result
        result = reg;
        return true;
      }
    });
    return result;
  }

  function calcGuides(dropData, canvasOffset, gridData, boundingBox) {
    function calcTop(row, isAfter) {
      var top = (row * gridData.rowHeight) + canvasOffset.top;
      if (isAfter) {
        top += gridData.rowHeight;
      }
      return top;
    }

    var pre = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      vrt = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      sub = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      guides = [pre, vrt, sub];
    switch (dropData.type) {
      // case "child":
      //   break;
      // case "after":
      //   break;
      case "before":
        pre.top = calcTop(dropData.parentRow + 1, false);
        sub.top = calcTop(dropData.row, false);

        pre.left = canvasOffset.left;

        pre.width = dropData.indent;
        sub.width = 0 - dropData.indent;
        gridData.columns.forEach(function(c, index) {
          if (index < dropData.cell) {
            pre.width += c.width;
          } else {
            sub.width += c.width;
          }
        });

        vrt.top = pre.top;
        vrt.height = sub.top - pre.top;

        vrt.left = pre.left + pre.width;
        sub.left = vrt.left;

        pre.height = 2;
        vrt.width = 2;
        sub.height = 2;
        break;
        // case "on":
        //   break;
      default:
        throw new Error("invalid drop type: " + dropData.type);
    }

    // keep in bounds
    if (boundingBox) {
      fitAllToBounds(boundingBox, guides);
    }
    return guides;
  }

  //
  // Rectangle math
  //

  //
  function fitAllToBounds(boundingBox, boxes) {
    var boundingRect = toRect(boundingBox);
    boxes.forEach(function(box, index) {
      var rect = toRect(box);
      if (rectsIntersect(boundingRect, rect)) {
        // fit box to bounds
        rect.x1 = Math.max(rect.x1, boundingRect.x1);
        rect.y1 = Math.max(rect.y1, boundingRect.y1);
        rect.x2 = Math.min(rect.x2, boundingRect.x2);
        rect.y2 = Math.min(rect.y2, boundingRect.y2);

        boxes[index] = toBox(rect);
      } else {
        // hide box
        box.top = _topOffScreen;
        box.left = _topOffScreen;
        box.width = 0;
        box.height = 0;
      }
    });
  }

  function toRect(box) {
    return {
      x1: box.left,
      y1: box.top,
      x2: box.left + box.width,
      y2: box.top + box.height,
    };
  }

  function toBox(rect) {
    return {
      left: rect.x1,
      top: rect.y1,
      width: rect.x2 - rect.x1,
      height: rect.y2 - rect.y1,
    };
  }

  function rectsIntersect(rectA, rectB) {
    return (
      // A's left edge is to the left of B's right edge
      rectA.x1 < rectB.x2 &&
      // A's right edge is to the right of B's left edge
      rectA.x2 > rectB.x1 &&
      // A's top edge is above B's bottom edge
      rectA.y1 < rectB.y2 &&
      // A's bottom edge is below B's top edge
      rectA.y2 > rectB.y1
    );
  }

  // expose for testing
  DragHub.calcGuides = calcGuides;
  DragHub.fitAllToBounds = fitAllToBounds;

  return DragHub;
});
