define('src/funding/packetitemsearch.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  RowEvent,
  SlickGridViewModel,
  utils
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
        {
          id: 'PacketItemID',
          name: 'PacketItem ID',
          field: 'PacketItemID',
          width: 50,
          formater: function(row, cell, value) {
            return 'PIT ' + value;
          },
        }, {
          id: 'PacketId',
          name: 'Packet Id',
          field: 'PacketId',
          width: 50,
        }, {
          id: 'CustomerNumber',
          name: 'Customer Number',
          field: 'CustomerNumber',
          width: 50,
        }, {
          id: 'CustomerId',
          name: 'Customer ID',
          field: 'CustomerId',
          width: 50,
        }, {
          id: 'AccountId',
          name: 'Account Id',
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
        }
      ]
    });
  }

  utils.inherits(PacketItemSearchGridViewModel, SlickGridViewModel);

  // ** Return class
  return PacketItemSearchGridViewModel;
});
