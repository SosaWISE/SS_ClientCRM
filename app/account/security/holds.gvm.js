define("src/account/security/holds.gvm", [
  "ko",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/strings",
  "src/core/utils",
], function(
  ko,
  RowEvent,
  SlickGridViewModel,
  strings,
  utils
) {
  "use strict";

  function HoldGridViewModel(options) {
    var _this = this;
    var internalList = ko.observableArray();

    _this.includeFixed = ko.observable(false);

    HoldGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      // list: ko.observableArray(),
      list: ko.computed(function() {
        var list = internalList().sort(function(a, b) {
          // sort descending by created on
          return b.CreatedOn.valueOf() - a.CreatedOn.valueOf();
        });
        if (!_this.includeFixed()) {
          // filter out fixed holds
          list = list.filter(function(item) {
            return !item.FixedOn;
          });
        }
        return list;
      }),
      plugins: getPlugins(_this, internalList, options),
      columns: [ //
        {
          width: 30,
          id: "CreatedOn",
          name: "Date",
          field: "CreatedOn",
          formatter: SlickGridViewModel.formatters.datetime,
        }, {
          id: "Reason",
          name: "Reason",
          field: "Catg2Id",
          formatter: options.catg2Formatter,
        }, {
          width: 30,
          id: "CreatedBy",
          name: "Created By",
          field: "CreatedBy",
        }, {
          width: 30,
          id: "FixedOn",
          name: "Removed On",
          field: "FixedOn",
          formatter: SlickGridViewModel.formatters.datetime,
        }, {
          width: 30,
          id: "FixedBy",
          name: "Removed By",
          field: "FixedBy",
        },
      ],
    });

    _this.setList = function(list) {
      internalList(list);
    };
    _this.addItem = function(item) {
      internalList.splice(0, 0, item);
    };
  }
  utils.inherits(HoldGridViewModel, SlickGridViewModel);

  function getPlugins(_this, internalList, options) {
    var plugins = [];
    if (options.edit) {
      plugins.push(new RowEvent({
        eventName: "onDblClick",
        fn: function(item) {
          options.edit(item, function(model) {
            if (!model) { // nothing changed
              return;
            }
            // update in place
            internalList.replace(item, model);
          });
        },
      }));
    }
    return plugins;
  }

  return HoldGridViewModel;
});
