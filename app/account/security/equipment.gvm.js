define('src/account/security/equipment.gvm', [
  'ko',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/numbers',
  'src/core/strings',
  'src/core/utils',
], function(
  ko,
  RowEvent,
  SlickGridViewModel,
  numbers,
  strings,
  utils
) {
  "use strict";

  function EquipmentGridViewModel() {
    var _this = this;
    EquipmentGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function() {
            alert('double clicked');
          },
        }),
      ],
      columns: [ //
        {
          id: 'Zone',
          name: 'Zone',
          field: 'Zone',
        }, {
          id: 'Points',
          name: 'Points',
          field: 'ActualPoints',
        }, {
          id: 'Equipment',
          name: 'Equipment',
          field: 'ItemDesc',
        }, {
          id: 'PartNumber',
          name: 'Part #',
          field: 'ItemSKU',
        }, {
          id: 'Location',
          name: 'Location',
          field: 'EquipmentLocationDesc',
        }, {
          id: 'Barcode',
          name: 'Barcode',
          field: 'BarcodeId',
        }, {
          id: 'AssignedTo',
          name: 'Assigned To',
          field: 'GPEmployeeId',
        }, {
          id: 'ExistingWiring',
          name: 'Existing Wiring',
          field: 'IsExistingWiring',
          minWidth: 15,
          width: 30,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: 'ExistingEquipment',
          name: 'Existing Equipment',
          field: 'IsExisting',
          minWidth: 15,
          width: 30,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: 'TechUpgrade',
          name: 'Tech Upgrade',
          field: 'IsServiceUpgrade',
          minWidth: 15,
          width: 30,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: 'UpgradePrice',
          name: 'Upgrade Price',
          field: 'Price',
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return (value > 0 && dataCtx.IsServiceUpgrade) ? strings.formatters.currency(value) : '';
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
  }
  utils.inherits(EquipmentGridViewModel, SlickGridViewModel);

  return EquipmentGridViewModel;
});
