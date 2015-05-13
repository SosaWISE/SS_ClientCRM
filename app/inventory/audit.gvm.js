define("src/inventory/audit.gvm", [
  "slick",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  Slick,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function AuditGridViewModel(options) {
    var _this = this;
    initDataView(_this);
    AuditGridViewModel.super_.call(_this, {
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },
      dataView: _this.dv,
      columns: getColumns(options),
      onSelectedRowsChanged: options.onSelectedRowsChanged,
    });
  }
  utils.inherits(AuditGridViewModel, SlickGridViewModel);

  AuditGridViewModel.prototype.setItems = function(items) {
    var _this = this;
    var dv = _this.dv;
    dv.beginUpdate();
    dv.setItems(items);
    dv.reSort();
    dv.endUpdate();
    _this.setSelectedRows([]);
    _this.resetActiveCell();
    _this.updateGrid(true);
  };
  AuditGridViewModel.prototype.setItem = function(newItem) {
    var _this = this;
    var dv = _this.dv;
    var id = newItem.ID;
    var item = dv.getItemById(id);
    if (!item) {
      dv.addItem(newItem);
    } else {
      dv.updateItem(id, newItem);
    }
  };

  function getColumns(options) {
    var columns = [ //
      {
        id: "ID",
        name: "ID",
        field: "ID",
        width: 50,
      }, {
        id: "CreatedBy",
        name: "Auditor",
        field: "CreatedBy",
      }, {
        id: "CreatedOn",
        name: "Audit Date",
        field: "CreatedOn",
        formatter: SlickGridViewModel.formatters.datetime,
      }, {
        id: "IsClosed",
        name: "Status",
        field: "IsClosed",
        formatter: function(row, cell, value) {
          return value ? "Closed" : "Pending";
        },
      },
    ];
    if (options) {
      // columns.unshift({
      //   id: "Scanned",
      //   name: "Scanned",
      //   field: "Scanned",
      //   width: 30,
      // });
    }
    return columns;
  }

  function initDataView(_this) {
    var dv = new Slick.Data.DataView();
    dv.vm = _this.vm; // store pointer to this vm
    _this.dv = dv;

    dv.beginUpdate();
    //
    dv.setItems([], "ID");

    // function myComparer(a, b) {
    //   var result = a.Scanned - b.Scanned;
    //   if (result === 0) {
    //     a = a.Barcode;
    //     b = b.Barcode;
    //     if (a < b) {
    //       result = -1;
    //     } else if (b < a) {
    //       result = 1;
    //     }
    //   }
    //   return result;
    // }
    // var preventReverse = true; // ??ascending??
    // dv.sort(myComparer, preventReverse);
    //
    dv.endUpdate();
  }

  return AuditGridViewModel;
});
