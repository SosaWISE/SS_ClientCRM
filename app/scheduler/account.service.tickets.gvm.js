define("src/scheduler/account.service.tickets.gvm", [
  "slick",
  "src/slick/slickgrid.vm",
  "src/slick/headerfilter",
  "src/slick/columnsort",
  "src/slick/rowevent",
  "src/core/strings",
  "src/core/utils",
], function(
  Slick,
  SlickGridViewModel,
  HeaderFilter,
  ColumnSort,
  RowEvent,
  strings,
  utils
) {
  "use strict";

  function AccountServiceTicketsGridViewModel(options) {
    var _this = this;
    var filterFields = [
      "ID",
      "StatusCode",
      "MSTicketNum",
      "ServiceType",
      "TechGPEmployeeID",
    ];
    initDataView(_this, filterFields);
    AccountServiceTicketsGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        // these are needed for HeaderFilter
        showHeaderRow: true,
        headerRowHeight: 30,
        explicitInitialization: true,
        //
        multiColumnSort: true,
      },
      dataView: _this.dv,
      plugins: [
        new HeaderFilter({
          fields: filterFields,
          updateFieldFilter: _this.updateFieldFilter,
        }),
        new ColumnSort({
          dataView: _this.dv,
          updateSortCols: _this.updateSortCols,
        }),
        new RowEvent({
          eventName: "onDblClick",
          fn: function(ticket) {
            options.edit(ticket, function(model, deleted) {
              if (!model) { // nothing changed
                return;
              }
              if (deleted) { // remove deleted item
                _this.dv.deleteItem(model.ID);
              } else { // update in place
                _this.dv.updateItem(model.ID, model);
              }
            });
          },
        }),
      ],
      columns: [ //
        {
          id: "StatusCode",
          name: "Status",
          field: "StatusCode",
          sortable: true,
        }, {
          id: "ID",
          name: "ID",
          field: "ID",
          sortable: true,
        }, {
          id: "MSTicketNum",
          name: "MS Ticket#",
          field: "MSTicketNum",
          sortable: true,
        }, {
          id: "ServiceType",
          name: "Service Type",
          field: "ServiceType",
          sortable: true,
        }, {
          id: "TechGPEmployeeID",
          name: "Tech",
          field: "TechGPEmployeeID",
          sortable: true,
        },
        // {
        //   id: "MSConfirmation",
        //   name: "MS Confirmation",
        //   field: "MSConfirmation",
        // },
        // {
        //   id: "AgentConfirmation",
        //   name: "Agent Confirmation",
        //   field: "AgentConfirmation",
        // },
        // {
        //   id: "ExpirationDate",
        //   name: "Expiration Date",
        //   field: "ExpirationDate",
        //   formatter: SlickGridViewModel.formatters.datetime,
        // },
      ],
    });
  }
  utils.inherits(AccountServiceTicketsGridViewModel, SlickGridViewModel);

  AccountServiceTicketsGridViewModel.prototype.setItems = function(items) {
    var dv = this.dv;
    dv.beginUpdate();
    dv.setItems(items);
    dv.reSort();
    dv.endUpdate();
  };
  AccountServiceTicketsGridViewModel.prototype.insertItem = function(item) {
    var dv = this.dv;
    dv.insertItem(item.ID, item);
  };

  function initDataView(_this, regxFields) {
    var dv = new Slick.Data.DataView();
    dv.vm = _this.vm; // store pointer to this vm
    _this.dv = dv;

    var filterTimeout = 0;

    function toRegx(val) {
      if (!val) {
        return new RegExp(".*", "i");
      }
      val = strings.escapeRegExp(val);
      return new RegExp(".*" + val + ".*", "i");
    }
    var regxMap = {};
    regxFields.forEach(function(field) {
      regxMap[field] = toRegx();
    });

    function myFilter(item /*, args*/ ) {
      var anyFailed = regxFields.some(function(field) {
        return !regxMap[field].test(item[field]);
      });
      return !anyFailed;
    }

    function runFilters() {
      Slick.GlobalEditorLock.cancelCurrentEdit();
      // refresh ui
      window.clearTimeout(filterTimeout);
      filterTimeout = window.setTimeout(dv.refresh, 10);
    }

    function filterChanged(prop, val, run) {
      var regx = regxMap[prop];
      if (!regx) {
        return false;
      }

      val = toRegx(val);
      if (regx.toString() === val.toString()) {
        return false;
      }
      regxMap[prop] = val;

      if (run) {
        runFilters();
      }
      return true;
    }
    _this.updateFieldFilter = function(field, filter) {
      filterChanged(field, filter, true);
    };
    _this.setColumnFilters = function(columnFilters) {
      var run = false;
      Object.keys(columnFilters).forEach(function(prop) {
        run |= filterChanged(prop, columnFilters[prop], false);
      });
      if (run) {
        runFilters();
      }
    };

    dv.beginUpdate();
    //
    dv.setItems([], "ID");
    dv.setFilter(myFilter);

    // sorting order
    var sortCols = [];
    //
    function myComparer(a, b) {
      var result = 0;
      for (var i = 0, l = sortCols.length; i < l; i++) {
        var field = sortCols[i].sortCol.field;
        var sign = sortCols[i].sortAsc ? 1 : -1;
        var value1 = a[field],
          value2 = b[field];

        result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
        if (result !== 0) {
          return result;
        }
      }
      // default, sort by ID
      if (result === 0) {
        result = a.ID - a.ID;
      }
      return result;
    }
    var preventReverse = true; // ??ascending??
    dv.sort(myComparer, preventReverse);
    _this.updateSortCols = function(val) {
      sortCols = val;
    };
    //
    dv.endUpdate();
  }

  return AccountServiceTicketsGridViewModel;
});
