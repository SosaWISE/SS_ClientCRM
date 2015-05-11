define("src/inventory/tekinventory.gvm", [
  "slick",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  Slick,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function TekInventoryGridViewModel(options) {
    var _this = this;
    initDataView(_this);
    TekInventoryGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },
      columns: getColumns(options),
    });
  }
  utils.inherits(TekInventoryGridViewModel, SlickGridViewModel);

  TekInventoryGridViewModel.prototype.setItems = function(items) {
    var dv = this.dv;
    dv.beginUpdate();
    dv.setItems(items);
    dv.reSort();
    dv.endUpdate();
  };

  function getColumns(options) {
    var columns = [ //
      {
        id: "Barcode",
        name: "Barcode",
        field: "Barcode",
        width: 50,
      }, {
        id: "ItemDesc",
        name: "Item Description",
        field: "ItemDesc",
      },
    ];
    if (options && options.showScanned) {
      columns.unshift({
        id: "Scanned",
        name: "Scanned",
        field: "Scanned",
        width: 30,
      });
    }
    return columns;
  }

  function initDataView(_this) {
    var dv = new Slick.Data.DataView();
    dv.vm = _this.vm; // store pointer to this vm
    _this.dv = dv;

    dv.beginUpdate();
    //
    dv.setItems([], "Barcode");

    function myComparer(a, b) {
      var result = a.Scanned - b.Scanned;
      if (result === 0) {
        a = a.Barcode;
        b = b.Barcode;
        if (a < b) {
          result = -1;
        } else if (b < a) {
          result = 1;
        }
      }
      return result;
    }
    var preventReverse = true; // ??ascending??
    dv.sort(myComparer, preventReverse);
    //
    dv.endUpdate();
  }

  return TekInventoryGridViewModel;
});
