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
            //console.log("Ticked double clicked: ", ticket);
            options.edit(ticket, function(model, deleted) {
              if (!model) { // nothing changed
                //   console.log("not model"+model);
                //    console.log("nothing changed");
                return;
              }
              if (deleted) { // remove deleted item
                //   console.log("deleted ticket");
                _this.list.remove(ticket);

              } else { // update in place
                //  console.log("replaced");
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
        id: 'MoniNumber',
        name: 'Moni Ticket#',
        field: 'MoniNumber',
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
