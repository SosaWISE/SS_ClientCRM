define('src/scheduling/scheduleblock.viewticket.gvm', [
  'ko',
  'src/slick/slickgrid.vm',
  'src/slick/buttonscolumn',
  'src/core/utils',
  //'src/slick/rowevent'
], function(
  ko,
  SlickGridViewModel,
  ButtonsColumn,
  utils
  //RowEvent
) {
  "use strict";

  function ScheduleBlockViewTicketGridViewModel(options) {

    var _this = this;
    ScheduleBlockViewTicketGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },

      // plugins: [
      //   new RowEvent({
      //     eventName: 'onDblClick',
      //     fn: function(ticket) {
      //       options.ticketInfo(ticket);
      //     },
      //   }),
      // ],

      columns: [{
          id: 'CustomerFullName',
          name: 'Name',
          field: 'CustomerFullName',
        }, {
          id: 'TicketID',
          name: 'Ticket Number',
          field: 'TicketID',
        }, {
          id: 'TicketTypeId',
          name: 'Ticket Type',
          field: 'TicketTypeName',
        }, {
          id: 'ZipCode',
          name: 'Zip Code',
          field: 'ZipCode',
        },
        new ButtonsColumn({
          id: 'BlockID',
          name: '',
          buttons: [ //
            {
              text: 'Unschedule',
              fn: options.unscheduleblockTicket,
              cssClass: 'btn small btn-black',
            },
          ]
        }),
      ],

    });

  }

  utils.inherits(ScheduleBlockViewTicketGridViewModel, SlickGridViewModel);

  return ScheduleBlockViewTicketGridViewModel;
});
