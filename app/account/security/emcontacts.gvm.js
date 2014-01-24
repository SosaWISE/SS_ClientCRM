define('src/account/security/emcontacts.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function EmContactsGridViewModel() {
    var _this = this;
    EmContactsGridViewModel.super_.call(_this, {
      options: {
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
          id: 'Order',
          name: 'Order',
          field: 'Order',
        },
        {
          id: 'Name',
          name: 'Name',
          field: 'Name',
        },
        {
          id: 'Relationship',
          name: 'Relationship',
          field: 'Relationship',
        },
        {
          id: 'PrimaryPhone',
          name: 'PrimaryPhone',
          field: 'PrimaryPhone',
        },
        {
          id: 'SecondayPhone',
          name: 'SecondayPhone',
          field: 'SecondayPhone',
        },
        {
          id: 'AlternatePhone',
          name: 'AlternatePhone',
          field: 'AlternatePhone',
        },
        {
          id: 'HouseKeys',
          name: 'HouseKeys',
          field: 'HouseKeys',
        },
      ],
    });
    while (_this.list().length < 2) {
      _this.list().push({
        Order: _this.list().length + 1,
        Name: 'Name ' + (_this.list().length + 1),
        Relationship: 'Relationship ' + (_this.list().length + 1),
        PrimaryPhone: 'PrimaryPhone ' + (_this.list().length + 1),
        SecondayPhone: 'SecondayPhone ' + (_this.list().length + 1),
        AlternatePhone: 'AlternatePhone ' + (_this.list().length + 1),
        HouseKeys: (_this.list().length % 2) === 0,
      });
    }
  }
  utils.inherits(EmContactsGridViewModel, SlickGridViewModel);

  return EmContactsGridViewModel;
});
