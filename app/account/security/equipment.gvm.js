define('src/account/security/equipment.gvm', [
  'ko',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  ko,
  RowEvent,
  SlickGridViewModel,
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
          field: 'Points',
        }, {
          id: 'Equipment',
          name: 'Equipment',
          field: 'Equipment',
        }, {
          id: 'PartNumber',
          name: 'Part #',
          field: 'PartNumber',
        }, {
          id: 'Location',
          name: 'Location',
          field: 'Location',
        }, {
          id: 'Barcode',
          name: 'Barcode',
          field: 'Barcode',
        }, {
          id: 'AssignedTo',
          name: 'Assigned To',
          field: 'AssignedTo',
        }, {
          id: 'ExistingWiring',
          name: 'Existing Wiring',
          field: 'ExistingWiring',
          minWidth: 15,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: 'ExistingEquipment',
          name: 'Existing Equipment',
          field: 'ExistingEquipment',
          minWidth: 15,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: 'TechUpgrade',
          name: 'Tech Upgrade',
          field: 'TechUpgrade',
          minWidth: 15,
          formatter: SlickGridViewModel.formatters.xFormatter,
        }, {
          id: 'UpgradePrice',
          name: 'Upgrade Price',
          field: 'UpgradePrice',
        },
      ],
    });
    while (_this.list().length < 13) {
      _this.list().push({
        Zone: '00' + (_this.list().length + 1),
        Points: (_this.list().length + 1),
        Equipment: 'Equipment ' + (_this.list().length + 1),
        PartNumber: 'PartNumber ' + (_this.list().length + 1),
        Location: 'Location ' + (_this.list().length + 1),
        Barcode: 'Barcode ' + (_this.list().length + 1),
        AssignedTo: 'AssignedTo ' + (_this.list().length + 1),
        ExistingWiring: (_this.list().length % 3) === 0,
        ExistingEquipment: (_this.list().length % 2) === 0,
        TechUpgrade: (_this.list().length % 7) === 2,
        UpgradePrice: (_this.list().length % 7) === 2 ? 29.99 : 0,
      });
    }

    _this.totalPoints = ko.computed(function() {
      return _this.list().reduce(function(total, item) {
        return (item.Points) ? total + item.Points : total;
      }, 0);
    });
  }
  utils.inherits(EquipmentGridViewModel, SlickGridViewModel);

  return EquipmentGridViewModel;
});
