define("src/slick/columnsort", [
  "slick",
  "jquery",
], function(
  Slick,
  jquery
) {
  "use strict";

  function ColumnSort(options) {
    var _this = this,
      _handler = new Slick.EventHandler(),
      _options = jquery.extend(true, {}, {
        dataView: {
          reSort: function() {
            console.warn("dataView not set");
          }
        },
        updateSortCols: function() {
          console.warn("updateSortCols function not set");
        },
      }, options);


    // grid plugin funcs
    _this.init = function(grid) {
      _handler.subscribe(grid.onSort, function(e, args) {
        _options.updateSortCols(args.sortCols);
        _options.dataView.reSort();
      });
    };
    _this.destroy = function() {
      _handler.unsubscribeAll();
    };
  }

  return ColumnSort;
});
