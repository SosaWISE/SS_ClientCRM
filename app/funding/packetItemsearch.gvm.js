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
          width: 30,
          buttons: [{
            text: 'X',
            fn: function(item) {
              console.log(item);
            },
          }],
        }), {
          id: 'PacketItemID',
          name: 'ID',
          field: 'PacketItemID',
          width: 10,
          formater: function(row, cell, value) {
            return 'PIT ' + value;
          },
          // }, {
          //   id: 'PacketId',
          //   name: 'P ID',
          //   field: 'PacketId',
          //   width: 50,
        }, {
          id: 'CustomerNumber',
          name: 'Cust #',
          field: 'CustomerNumber',
          width: 40,
          // }, {
          //   id: 'CustomerId',
          //   name: 'C ID',
          //   field: 'CustomerId',
          //   width: 50,
        }, {
          id: 'AccountId',
          name: 'Acct ID',
          field: 'AccountId',
          width: 40,
        }, {
          id: 'Csid',
          name: 'Csid',
          field: 'Csid',
          width: 40,
        }, {
          id: 'FirstName',
          name: 'First Name',
          field: 'FirstName',
          width: 50,
        }, {
          id: 'LastName',
          name: 'Last Name',
          field: 'LastName',
          width: 50,
        }, {
          id: 'Bureau',
          name: 'Bureau',
          field: 'Bureau',
          width: 50,
        }, {
          id: 'Gateway',
          name: 'Gateway',
          field: 'Gateway',
          width: 50,
        }, {
          id: 'TransactionID',
          name: 'Tran ID',
          field: 'TransactionID',
          width: 50,
        }, {
          id: 'ReportGuid',
          name: 'Token',
          field: 'ReportGuid',
          width: 50,
        }, {
          id: 'AccountFundingShortDesc',
          name: 'Funding Desc',
          field: 'AccountFundingShortDesc',
          width: 75,
        }, {
          id: 'AccountStatusNote',
          name: 'Account Status Note',
          field: 'AccountStatusNote',
          width: 75,
        }, {
          id: 'CreatedOn',
          name: 'Created',
          field: 'CreatedOn',
          width: 85,
          formatter: SlickGridViewModel.formatters.datetime,
        }
      ]
    });
  }

  utils.inherits(PacketItemSearchGridViewModel, SlickGridViewModel);

  // ** Return class
  return PacketItemSearchGridViewModel;
});
