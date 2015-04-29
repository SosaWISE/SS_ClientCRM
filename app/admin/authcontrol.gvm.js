define("src/admin/authcontrol.gvm", [
  "slick",
  "src/slick/cellbutton",
  "src/slick/slickgrid.vm",
  "src/core/strings",
  "src/core/utils",
], function(
  Slick,
  CellButton,
  SlickGridViewModel,
  strings,
  utils
) {
  "use strict";

  function AuthControlGridViewModel(options) {
    var _this = this;
    // var filterFields = options.filterFields;
    var filterFields = [
      "GroupName",
    ];
    var dataViewOptions = {
      groupItemMetadataProvider: new Slick.Data.GroupItemMetadataProvider({
        toggleCollapsedCssClass: "fa fa-caret-right",
        toggleExpandedCssClass: "fa fa-caret-down",
        // // collapsing has some issues
        // enableExpandCollapse: false,
      }),
    };
    initDataView(_this, filterFields, dataViewOptions);
    var cellButtonOptions = {
      id: "grpname-btn",
      fn: function(g) {
        var groupName = g.value;
        options.edit(groupName);
      },
    };
    AuthControlGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 25,
        //
        enableCellNavigation: false,
      },
      noSelection: true,
      dataView: _this.dv,
      plugins: [
        new CellButton(cellButtonOptions),
      ],

      // columns: options.columns,
      columns: [ //
        // {
        //   id: "GroupName",
        //   name: "Group Name",
        //   field: "GroupName",
        //   formatter: utils.noop,
        // },
        // {
        //   id: "RefType",
        //   name: "RefType",
        //   field: "RefType",
        //   formatter: utils.noop,
        // },
        {
          id: "RefId",
          name: "",
          field: "RefId",
          formatter: function(row, cell, value) {
            return "<span style='margin-left:45px;'>" + value + "</span>";
          },
        },
      ],
    });

    _this.dv.setGrouping([{
      getter: "GroupName",
      formatter: function(g) {
        return CellButton.formatButton(cellButtonOptions.id, "btn small", "Edit") + " " + g.value;
      },
      collapsed: false,
    }, {
      getter: "RefType",
      collapsed: false,
    }]);
  }
  utils.inherits(AuthControlGridViewModel, SlickGridViewModel);

  AuthControlGridViewModel.prototype.setItems = function(items) {
    var dv = this.dv;
    dv.beginUpdate();
    dv.setItems(items);
    dv.reSort();
    dv.endUpdate();
  };

  AuthControlGridViewModel.prototype.getGroupItems = function(groupName) {
    var dv = this.dv;
    return dv.getItems().filter(function(item) {
      return item.GroupName === groupName;
    });
  };
  AuthControlGridViewModel.prototype.setGroupItems = function(groupName, items) {
    var _this = this;
    var dv = _this.dv;
    dv.beginUpdate();
    // remove items with groupName
    _this.getGroupItems(groupName).forEach(function(item) {
      dv.deleteItem(item.sid);
    });
    // add new items
    items.forEach(function(item) {
      if (item.GroupName === groupName) {
        dv.addItem(item);
      } else {
        console.warn("unexpected item.GroupName: " + item.GroupName);
      }
    });
    //
    dv.reSort();
    //
    dv.endUpdate();
  };

  function initDataView(_this, regxFields, dataViewOptions) {
    var dv = new Slick.Data.DataView(dataViewOptions);
    dv.vm = _this; // store pointer to this vm
    dv.options = dataViewOptions;
    _this.dv = dv;

    function filter(item /*, args*/ ) {
      return !item.IsDeleted && (!groupNames.length || groupNames.some(function(groupName) {
        return item.GroupName === groupName;
      }));
    }
    var groupNames = [];
    _this.setGroupNames = function(newGroupNames) {
      groupNames = newGroupNames;
      dv.refresh();
    };

    dv.beginUpdate();
    //
    dv.setItems([], "sid");
    dv.setFilter(filter);

    // sorting order
    var sortFields = [
      "GroupName",
      "RefType",
      "RefId",
    ];
    //
    function myComparer(a, b) {
      var result = 0;
      for (var i = 0, l = sortFields.length; i < l; i++) {
        var field = sortFields[i];
        var value1 = a[field],
          value2 = b[field];

        result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * 1;
        if (result !== 0) {
          return result;
        }
      }
      return result;
    }
    var preventReverse = true; // ??ascending??
    dv.sort(myComparer, preventReverse);
    //
    dv.endUpdate();
  }

  return AuthControlGridViewModel;
});
