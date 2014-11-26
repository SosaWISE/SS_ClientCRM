define('src/scheduling/service.ticket.gvm', [
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

  // function ServiceTicketGridViewModel( /*options*/ ) {
  function ServiceTicketGridViewModel(options) {

    var _this = this;
    ServiceTicketGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },

      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(ticket) {
            options.edit(ticket, function(model, deleted) {
              if (!model) { // nothing changed
                return;
              }
              if (deleted) { // remove deleted item
                _this.list.remove(ticket);

              } else { // update in place
                _this.list.replace(ticket, model);
              }
            });
            // alert('double clicked');

          },
        }),
      ],

      columns: [{
        id: 'TicketID',
        name: 'TicketID',
        field: 'TicketID',
      }, {
        id: 'MonitoringStationNo',
        name: 'Moni Ticket#',
        field: 'MonitoringStationNo',
      }, {
        id: 'TicketTypeName',
        name: 'Service Ticket Type',
        field: 'TicketTypeName',
      }, {
        id: 'StatusCodeId',
        name: 'Status',
        //field: 'StatusCodeId',
        field: 'StatusCode',

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
        id: 'TechnicianId',
        name: 'Tech',
        field: 'TechnicianId',
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
