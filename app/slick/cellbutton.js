define("src/slick/cellbutton", [
  "slick",
  "jquery",
], function(
  Slick,
  jquery
) {
  "use strict";

  var count = 0;

  function CellButton(options) {
    var _this = this,
      _grid,
      _handler = new Slick.EventHandler();

    options.id = options.id || "_cellbtn_" + (++count);
    if (!options.fn) {
      throw new Error("missing fn");
    }

    _this.destroy = function() {
      _handler.unsubscribeAll();
    };
    _this.init = function(grid) {
      _grid = grid;
      _handler.subscribe(_grid.onClick, handleClick);
    };

    function handleClick(e, args) {
      // clicking on a row anchor
      var el = jquery(e.target);
      if (el.is("a") && el.hasClass(options.id)) {
        // if editing, try to commit
        if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        // call fn
        options.fn(args.grid.getDataItem(args.row), e);
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }
  CellButton.formatButton = function(id, cssClass, text) {
    return "<a class=\"" + id + " " + cssClass + "\">" + text + "</a>";
  };

  return CellButton;
});
