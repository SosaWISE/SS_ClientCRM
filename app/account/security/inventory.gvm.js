define('src/account/security/inventory.gvm', [
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

  function InventoryGridViewModel() {
    var _this = this;
    InventoryGridViewModel.super_.call(_this, {
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
      columns: [
        {
          id: 'Zone',
          name: 'Zone',
          field: 'Zone',
        },
        {
          id: 'Points',
          name: 'Points',
          field: 'Points',
        },
        {
          id: 'Equipment',
          name: 'Equipment',
          field: 'Equipment',
        },
        {
          id: 'PartNumber',
          name: 'PartNumber',
          field: 'PartNumber',
        },
        {
          id: 'Location',
          name: 'Location',
          field: 'Location',
        },
        {
          id: 'Barcode',
          name: 'Barcode',
          field: 'Barcode',
        },
        {
          id: 'AssignedTo',
          name: 'AssignedTo',
          field: 'AssignedTo',
        },
        {
          id: 'ExistingWiring',
          name: 'ExistingWiring',
          field: 'ExistingWiring',
        },
        {
          id: 'ExistingEquipment',
          name: 'ExistingEquipment',
          field: 'ExistingEquipment',
        },
        {
          id: 'TechUpgrade',
          name: 'TechUpgrade',
          field: 'TechUpgrade',
        },
        {
          id: 'UpgradePrice',
          name: 'UpgradePrice',
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
  utils.inherits(InventoryGridViewModel, SlickGridViewModel);

  return InventoryGridViewModel;
});
