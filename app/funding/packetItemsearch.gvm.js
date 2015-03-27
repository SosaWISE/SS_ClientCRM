define('src/funding/packetitemsearch.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
  'src/slick/buttonscolumn',
], function(
  RowEvent,
  SlickGridViewModel,
  utils,
  ButtonsColumn
) {
  "use strict";

  function PacketItemSearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    PacketItemSearchGridViewModel.super_.call(_this, {
      scrollToTop: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: options.open,
        }),
      ],
      columns: [ //
        new ButtonsColumn({
          id: 'actions',
          name: '',
          buttons: [{
            text: 'X',
            fn: function(item) {
              console.log(item);
            },
          }],
        }), {
          id: 'PacketItemID',
          name: 'PI ID',
          field: 'PacketItemID',
          width: 50,
          formater: function(row, cell, value) {
            return 'PIT ' + value;
          },
        }, {
          id: 'PacketId',
          name: 'P ID',
          field: 'PacketId',
          width: 50,
        }, {
          id: 'CustomerNumber',
          name: 'Cust #',
          field: 'CustomerNumber',
          width: 50,
        }, {
          id: 'CustomerId',
          name: 'C ID',
          field: 'CustomerId',
          width: 50,
        }, {
          id: 'AccountId',
          name: 'A ID',
          field: 'AccountId',
          width: 50,
        }, {
          id: 'FirstName',
          name: 'First Name',
          field: 'FirstName',
          width: 100,
        }, {
          id: 'LastName',
          name: 'Last Name',
          field: 'LastName',
          width: 100,
        }, {
          id: 'AccountFundingShortDesc',
          name: 'Funding Desc',
          field: 'AccountFundingShortDesc',
          width: 150,
        }, {
          id: 'AccountStatusNote',
          name: 'Account Status Note',
          field: 'AccountStatusNote',
          width: 150,
        }, {
          id: 'CreatedOn',
          name: 'Created',
          field: 'CreatedOn',
          width: 50,
          formater: function(row, cell, value) {
            return utils.getLocalDateTime(value);
          },
        }
      ]
    });
  }

  utils.inherits(PacketItemSearchGridViewModel, SlickGridViewModel);

  // ** Return class
  return PacketItemSearchGridViewModel;
});
