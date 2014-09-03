define('src/scheduling/technician.ticket.gvm', [
  'ko',
  'src/slick/slickgrid.vm',
  'src/core/utils',
  'src/slick/rowevent'
], function(
  ko,
  SlickGridViewModel,
  utils,
  RowEvent
) {
  "use strict";

  function TechnicianTicketGridViewModel(options) {

    var _this = this;
    TechnicianTicketGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },

      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(ticket) {
            options.ticketInfo(ticket);
          },
        }),
      ],

      columns: [{
        id: 'CustomerFullName',
        name: 'Name',
        field: 'CustomerFullName',
      }, {
        id: 'CompleteAddress',
        name: 'Address',
        field: 'CompleteAddress',
      }, {
        id: 'StartTime', //temporary - not sure where to pull the Appointment Time yet
        name: 'Appointment Time',
        field: 'StartTime',
      }, ],

    });

  }

  utils.inherits(TechnicianTicketGridViewModel, SlickGridViewModel);

  return TechnicianTicketGridViewModel;
});
