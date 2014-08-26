define('src/scheduling/technician.ticket.gvm', [
  'ko',
  'src/slick/slickgrid.vm',
  'src/core/utils',
  'src/slick/rowevent'
], function(
  ko,
  SlickGridViewModel,
  utils
  //RowEvent
) {
  "use strict";

  function TechnicianTicketGridViewModel( /*options*/ ) {

    var _this = this;
    TechnicianTicketGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },

      // plugins: [
      //   new RowEvent({
      //     eventName: 'onDblClick',
      //     fn: function(ticket) {

      //       options.edit(ticket, function(model, deleted) {
      //         if (!model) { // nothing changed                
      //           return;
      //         }
      //         if (deleted) { // remove deleted item            
      //           _this.list.remove(ticket);
      //         } else { // update in place            
      //           _this.list.replace(ticket, model);
      //         }
      //       });            

      //     },
      //   }),
      // ],

      columns: [{
        id: 'Name',
        name: 'Name',
        field: 'Name',
      }, {
        id: 'Address',
        name: 'Address',
        field: 'Address',
      }, {
        id: 'AppointmentTime',
        name: 'Appointment Time',
        field: 'AppointmentTime',
      }, ],

    });

  }

  utils.inherits(TechnicianTicketGridViewModel, SlickGridViewModel);

  return TechnicianTicketGridViewModel;
});
