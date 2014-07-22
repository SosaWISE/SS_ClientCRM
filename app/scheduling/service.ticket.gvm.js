define('src/scheduling/service.ticket.gvm', [
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
        id: 'MoniNumber',
        name: 'Moni Ticket#',
        field: 'MoniNumber',
      }, {
        id: 'TicketTypeName',
        name: 'Service Ticket Type',
        field: 'TicketTypeName',
      }, {
        id: 'StatusCodeID',
        name: 'Status',
        field: 'StatusCodeID',
      }, {
        id: 'MoniConfirmation',
        name: 'Moni Confirmation',
        field: 'MoniConfirmation',
      }, {
        id: 'TechConfirmation',
        name: 'Tech Confirmation',
        field: 'TechConfirmation',
        formatter: SlickGridViewModel.formatters.datetime,
      }, {
        id: 'TechnicianID',
        name: 'Tech',
        field: 'TechnicianID',
      }, {
        id: 'AgentConfirmation',
        name: 'Agent Confirmation',
        field: 'AgentConfirmation',
      }, {
        id: 'ExpirationDate',
        name: 'Expiration Date',
        field: 'ExpirationDate',
        formatter: SlickGridViewModel.formatters.datetime,
      }, ],

    });

  }

  utils.inherits(ServiceTicketGridViewModel, SlickGridViewModel);

  return ServiceTicketGridViewModel;
});
