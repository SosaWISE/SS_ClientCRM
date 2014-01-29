define('src/slick/rowevent', [
  'slick',
  'jquery',
], function(
  Slick,
  jquery
) {
  'use strict';

  function RowEvent(options) {
    var _self = this,
      _grid,
      _handler = new Slick.EventHandler(),
      _options = jquery.extend(true, {}, {
        eventName: 'onClick',
        fn: function() {
          console.warn('fn function not set');
        },
      }, options);

    jquery.extend(_self, {
      'destroy': function() {
        _handler.unsubscribeAll();
      },
      'init': function(grid) {
        _grid = grid;
        _handler.subscribe(_grid[_options.eventName], handleEvent);
      },
    });

    function handleEvent(e) {
      var cell = _grid.getCellFromEvent(e);
      if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
        return false;
      }

      // call function
      if (!_options.fn(_grid.getDataItem(cell.row), e)) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }

  return RowEvent;
});
