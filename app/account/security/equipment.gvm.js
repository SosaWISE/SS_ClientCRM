define("src/account/security/equipment.gvm", [
  "ko",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/numbers",
  "src/core/strings",
  "src/core/utils",
], function(
  ko,
  RowEvent,
  SlickGridViewModel,
  numbers,
  strings,
  utils
) {
  "use strict";

  function EquipmentGridViewModel(options) {
    var _this = this;
    EquipmentGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: "onDblClick",
          fn: function(item) {
            console.log("Item double clicked: ", item);
            options.edit(item, function(model, deleted) {
              if (!model) { // nothing changed
                return;
              }
              if (deleted) { // remove deleted item
                _this.list.remove(item);
              } else { // update in place
                _this.list.replace(item, model);
              }
            });
            // alert("double clicked");
          },
        }),
      ],
      columns: [ //
        {
          id: "Zone",
          name: "Zone",
          field: "Zone",
        }, {
          id: "ActualPoints",
          name: "Points",
          field: "ActualPoints",
        }, {
          id: "ItemDesc",
          name: "Equipment",
          field: "ItemDesc",
        }, {
          id: "ItemSKU",
          name: "Part #",
          field: "ItemSKU",
        }, {
          id: "EquipmentLocationDesc",
          name: "Location",
          field: "EquipmentLocationDesc",
        }, {
          id: "BarcodeId",
          name: "Barcode",
          field: "BarcodeId",
        }, {
          id: "GPEmployeeId",
          name: "Assigned To",
          field: "GPEmployeeId",
        }, {
          id: "IsExistingWiring",
          name: "Existing Wiring",
          field: "IsExistingWiring",
          minWidth: 15,
          width: 30,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: "IsExisting",
          name: "Existing Equipment",
          field: "IsExisting",
          minWidth: 15,
          width: 30,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: "IsServiceUpgrade",
          name: "Tech Upgrade",
          field: "IsServiceUpgrade",
          minWidth: 15,
          width: 30,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: "Price",
          name: "Upgrade Price",
          field: "Price",
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return (value > 0 && dataCtx.IsServiceUpgrade) ? strings.formatters.currency(value) : "";
          },
        },
      ],
    });

    _this.totalPoints = ko.computed(function() {
      var result = _this.list().reduce(function(total, item) {
        return (item.ActualPoints) ? total + item.ActualPoints : total;
      }, 0);
      return numbers.roundTo(result, 2);
    });

    _this.loading = ko.observable(false);

    if (options.byPart) {
      _this.byPartGvm = new EquipmentByPartGridViewModel();
      _this.list.subscribe(function(list) {
        var byPartMap = {};
        var byPartList = [];
        list.forEach(function(item) {
          var id = item.ItemSKU;
          var group = byPartMap[id];
          if (!group) {
            byPartMap[id] = group = {
              ItemSKU: id,
              ActualPoints: item.ActualPoints,
              Count: 0,
            };
            byPartList.push(group);
          }
          group.Count++;
        });
        _this.byPartGvm.list(byPartList);
      });
    }
  }
  utils.inherits(EquipmentGridViewModel, SlickGridViewModel);

  function EquipmentByPartGridViewModel() {
    var _this = this;
    EquipmentByPartGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [ //
        {
          id: "ItemSKU",
          name: "Part #",
          field: "ItemSKU",
        }, {
          id: "ActualPoints",
          name: "Points",
          field: "ActualPoints",
        }, {
          id: "Count",
          name: "Count",
          field: "Count",
        }, {
          id: "PartPoints",
          name: "Part Points",
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return dataCtx.Count * dataCtx.ActualPoints;
          },
        },
      ],
    });
  }
  utils.inherits(EquipmentByPartGridViewModel, SlickGridViewModel);

  return EquipmentGridViewModel;
});
