define('src/slick/buttonscolumn', [
  'slick',
  'jquery',
], function(
  Slick,
  jquery
) {
  'use strict';

  var count = 0,
    btnDefaults = {
      cssClass: 'btn small',
      fn: function() {
        console.warn('fn function not set');
      }
    };

  function ButtonsColumn(options) {
    if (!options.buttons) {
      throw new Error('define `buttons` in options');
    }
    // buttons: [{
    //   'text': 'Text to display',
    //   'fn': function(rowItem, evt) {...,
    // }]

    var _self = this,
      _grid,
      _handler = new Slick.EventHandler(),
      _options = jquery.extend(true, {}, {
        id: '_buttons_' + (++count),
        name: '',
        cssClass: '',
        toolTip: '',
        width: options.buttons.length * 60,
      }, options);

    _options.buttons.forEach(function(btn, index) {
      _options.buttons[index] = jquery.extend({}, btnDefaults, btn);
    });

    jquery.extend(_self, {
      'destroy': function() {
        _handler.unsubscribeAll();
      },
      'init': function(grid) {
        _grid = grid;
        _handler.subscribe(_grid.onClick, handleClick);
      },
      'getColumnDefinition': function() {
        return {
          id: _options.id,
          name: _options.name,
          // field: 'btn',
          toolTip: _options.toolTip,
          width: _options.width,
          // resizable: false,
          sortable: false,
          cssClass: _options.cssClass,
          formatter: buttonsFormatter
        };
      },
    });

    function handleClick(e, args) {
      // clicking on a row anchor
      if (_grid.getColumns()[args.cell].id === _options.id && jquery(e.target).is('a')) {
        // if editing, try to commit
        if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        // find index of anchor tag
        var index = jquery(e.target).index();
        // get button using index and call button function
        //added try catch to trap undefined "fn". This happens when a cell of a row is in editing mode and button is clicked. 
        try{
          _options.buttons[index].fn(args.grid.getDataItem(args.row), e);

          e.stopPropagation();
          e.stopImmediatePropagation();
        }catch(ex){

        }
      }
    }

    function buttonsFormatter(row, cell, value, columnDef, dataContext) {
      if (dataContext) {
        var result = '';
        _options.buttons.forEach(function(btn) {
          result += '<a class="' + btn.cssClass + '">' + btn.text + '</a>';
        });
        return result;
      }
      return null;
    }
  }

  return ButtonsColumn;
});
