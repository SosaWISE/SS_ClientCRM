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
        hasClass: null,
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

    function handleEvent(e, args) {
      var cell = _grid.getCellFromEvent(e);
      if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
        return false;
      }
      if (_options.hasClass &&
        !jquery(e.target).hasClass(_options.hasClass)) {
        return false;
      }

      // call function
      if (!_options.fn(_grid.getDataItem(cell.row), e, args)) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }

  return RowEvent;
});
