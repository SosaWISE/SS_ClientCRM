define("src/inventory/audit-inventory.gvm", [
  "slick",
  "src/slick/slickgrid.vm",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
], function(
  Slick,
  SlickGridViewModel,
  strings,
  notify,
  utils
) {
  "use strict";

  var PBTTypeId = "ProductBarcodeTrackingTypeId";
  var AUD = "AUD";
  var AUDMISS = "AUD-MISS";

  function AuditInventoryGridViewModel(options) {
    var _this = this;
    initDataView(_this);
    AuditInventoryGridViewModel.super_.call(_this, {
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
        editable: true,
      },
      dataView: _this.dv,
      columns: getColumns(_this, options),
    });
  }
  utils.inherits(AuditInventoryGridViewModel, SlickGridViewModel);

  AuditInventoryGridViewModel.prototype.setItems = function(items, auditId) {
    var _this = this;
    _this._auditId = auditId || -1;
    var dv = _this.dv;
    dv.beginUpdate();
    dv.setItems(items);
    dv.reSort();
    dv.endUpdate();
    _this.setSelectedRows([]);
    _this.resetActiveCell();
    _this.updateGrid(true);
  };
  AuditInventoryGridViewModel.prototype.getItems = function() {
    var _this = this;
    return _this.dv.getItems();
  };
  AuditInventoryGridViewModel.prototype.setItem = function(newItem) {
    var _this = this;
    var dv = _this.dv;
    var barcode = newItem.ProductBarcodeID;
    var item = dv.getItemById(barcode);
    if (!item) {
      dv.addItem(newItem);
    } else {
      dv.updateItem(barcode, newItem);
    }
    dv.reSort();
    _this.setSelectedRows(_this.getSelectedRows());
  };
  AuditInventoryGridViewModel.prototype.scanItem = function(barcode) {
    var _this = this;
    var dv = _this.dv;
    var item = dv.getItemById(barcode);
    if (!item) {
      return false;
    }
    if (item.AuditId !== _this._auditId ||
      item[PBTTypeId] !== AUD) {
      item.AuditId = _this._auditId;
      item[PBTTypeId] = AUD;
      dv.updateItem(barcode, item);
    } else {
      notify.warn(strings.format("Duplicate barcode `{0}`.", barcode), null, 1);
    }
    return true;
  };
  AuditInventoryGridViewModel.prototype.getBarcodeIDs = function() {
    var _this = this;
    // return _this.getItems().map(function(item) {
    //   return item.ProductBarcodeID;
    // });
    var results = [];
    _this.dv.getItems().forEach(function(item) {
      if (item.AuditId === _this._auditId &&
        item[PBTTypeId] === AUD) {
        results.push(item.ProductBarcodeID);
      }
    });
    return results;
  };

  function getColumns(_this, options) {
    var columns = [ //
      {
        id: "ProductBarcodeID",
        name: "Barcode",
        field: "ProductBarcodeID",
        width: 50,
      }, {
        id: "ItemDesc",
        name: "Item Description",
        field: "ItemDesc",
        width: 200,
      },
    ];
    if (options && options.showScanned) {
      columns.unshift({
        id: "Scanned",
        name: "Scanned",
        field: PBTTypeId,
        width: 30,
        cssClass: "scanned",
        formatter: function(row, cell, value, columnDef, dataItem) {
          //@TODO: calculate using CreatedOn and current time???
          if (_this._auditId === dataItem.AuditId) {
            var cls;
            if (value === AUD) {
              cls = "fa-check";
            } else if (value === AUDMISS) {
              cls = "fa-times";
            } else {
              // no icon, just show type id
              return value;
            }
            return strings.format("<span class=\"fa fa-lg {0}\"></span>", cls);
          }
        },
      });
    }
    return columns;
  }

  function initDataView(_this) {
    var dv = new Slick.Data.DataView();
    dv.vm = _this.vm; // store pointer to this vm
    _this.dv = dv;

    dv.beginUpdate();
    // set id name
    dv.setItems([], "ProductBarcodeID");

    function myComparer(a, b) {
      var result = 0;
      var auditId = _this.AuditId;
      if (a.AuditId === auditId || b.AuditId === auditId) {
        //@NOTE: auditted items are ordered descending
        if (a.AuditId === b.AuditId) {
          // same audit id, sort by tracking type
          var aT = a[PBTTypeId];
          var bT = b[PBTTypeId];
          if (aT !== bT) {
            if (aT === AUD) {
              result = 1;
            } else if (bT === AUD) {
              result = -1;
            }
          }
        } else if (a.AuditId === auditId) {
          result = 1;
        } else if (b.AuditId === auditId) {
          result = -1;
        }
      }
      if (result === 0) {
        a = a.ProductBarcodeID;
        b = b.ProductBarcodeID;
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

  return AuditInventoryGridViewModel;
});
