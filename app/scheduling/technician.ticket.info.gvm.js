define('src/scheduling/technician.ticket.info.gvm', [
  'ko',
  'src/slick/slickgrid.vm',
  'src/core/utils',
  //'src/slick/rowevent'
], function(
  ko,
  SlickGridViewModel,
  utils
  //RowEvent
) {
  "use strict";

  function TechnicianTicketInfoGridViewModel( /*options*/ ) {

    var _this = this;
    TechnicianTicketInfoGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },

      columns: [{
        id: 'ItemDesc',
        name: 'Item Name',
        field: 'ItemDesc',
      }],

    });

  }

  utils.inherits(TechnicianTicketInfoGridViewModel, SlickGridViewModel);

  return TechnicianTicketInfoGridViewModel;
});
