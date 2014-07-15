define('src/serviceTicket/service.ticket.gvm', [
  'ko',
  'src/slick/slickgrid.vm',
  'src/core/utils',

], function(
  ko,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function ServiceTicketGridViewModel( /*options*/ ) {
    var _this = this;
    ServiceTicketGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },

      columns: [{
        id: 'TicketID',
        name: 'TicketID',
        field: 'TicketID',
      }, {
        id: 'Moni Ticket#',
        name: 'Moni Ticket#',
        field: 'Moni Ticket#',
      }, {
        id: 'Service Ticket Type',
        name: 'Service Ticket Type',
        field: 'Service Ticket Type',
      }, {
        id: 'Status',
        name: 'Status',
        field: 'Status',
      }, {
        id: 'Moni Confirmation',
        name: 'Moni Confirmation',
        field: 'Moni Confirmation',
      }, {
        id: 'Tech Confirmation',
        name: 'Tech Confirmation',
        field: 'Tech Confirmation',
      }, {
        id: 'Tech',
        name: 'Tech',
        field: 'Tech',
      }, {
        id: 'Agent Confirmation',
        name: 'Agent Confirmation',
        field: 'Agent Confirmation',
      }, {
        id: 'Expiration Date',
        name: 'Expiration Date',
        field: 'Expiration Date',
      }, ],

    });

  }

  utils.inherits(ServiceTicketGridViewModel, SlickGridViewModel);

  return ServiceTicketGridViewModel;
});
