define("src/slick/headerfilter", [
  "slick",
  "jquery",
], function(
  Slick,
  jquery
) {
  "use strict";

  function HeaderFilter(options) {
    var _this = this,
      _handler = new Slick.EventHandler(),
      _fieldsMap = {},
      _options = jquery.extend(true, {}, {
        fields: [],
        columnFilters: {},
        updateFieldFilter: function() {
          console.warn('updateFieldFilter function not set');
        },
      }, options);

    _options.fields.forEach(function(field) {
      _fieldsMap[field] = true;
    });

    // grid plugin funcs
    _this.init = function(grid) {
      _handler.subscribe(grid.onHeaderRowCellRendered, function(e, args) {
        var field = args.column.field;
        if (!field || !_fieldsMap[field]) {
          return;
        }
        jquery(args.node).empty();
        jquery("<input type='text' style='font-size:11px;width:calc(100% - 5px);'>")
          .data("field", field)
          .val(_options.columnFilters[field])
          .appendTo(args.node);
      });

      jquery(grid.getHeaderRow()).delegate(":input", "change keyup", function( /*e*/ ) {
        var field = jquery(this).data("field");
        if (field) {
          _options.updateFieldFilter(field, jquery.trim(jquery(this).val()));
        }
      });
    };
    _this.destroy = function() {
      _handler.unsubscribeAll();
    };
  }

  return HeaderFilter;
});
