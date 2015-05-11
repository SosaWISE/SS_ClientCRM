define("src/inventory/tekaudit.gvm", [
  "slick",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  Slick,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function TekAuditGridViewModel(options) {
    var _this = this;
    initDataView(_this);
    TekAuditGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },
      columns: getColumns(options),
    });
  }
  utils.inherits(TekAuditGridViewModel, SlickGridViewModel);

  TekAuditGridViewModel.prototype.setItems = function(items) {
    var dv = this.dv;
    dv.beginUpdate();
    dv.setItems(items);
    dv.reSort();
    dv.endUpdate();
  };

  function getColumns(options) {
    var columns = [ //
      // Audit ID
      // Auditor
      // Audit Date
      // IsClosed (bit)
      {
        id: "ID",
        name: "ID",
        field: "ID",
        width: 50,
      }, {
        id: "Auditor",
        name: "Auditor",
        field: "Auditor",
      }, {
        id: "CreatedOn",
        name: "Audit Date",
        field: "CreatedOn",
      }, {
        id: "IsClosed",
        name: "Closed",
        // field: "IsClosed",
        formatter: function(row, cell, value, columnDef, dataItem) {
          //@TODO: calculate using CreatedOn and current time???
          return dataItem.IsClosed;
        }
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

  return TekAuditGridViewModel;
});
