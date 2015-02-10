define("src/scheduler/tech.tickets.gvm", [
  "src/slick/slickgrid.vm",
  "src/scheduler/tickets.gvm",
  "src/core/utils",
], function(
  SlickGridViewModel,
  TicketsGridViewModel,
  utils
) {
  "use strict";

  function TechTicketsGridViewModel(options) {
    var _this = this;
    options = options || {};
    options.filterFields = [
      "_StatusCode",
      "_FullName",
      "_FullAddress",
      "StartOn",
    ];
    options.columns = [ //
      {
        id: "_StatusCode",
        name: "Status",
        field: "_StatusCode",
        sortable: true,
      }, {
        id: "_FullName",
        name: "Name",
        field: "_FullName",
        sortable: true,
      }, {
        id: "_FullAddress",
        name: "Address",
        field: "_FullAddress",
        sortable: true,
      }, {
        id: "StartOn",
        name: "Appointment Time",
        field: "StartOn",
        formatter: SlickGridViewModel.formatters.datetime,
        sortable: true,
      },
    ];
    TechTicketsGridViewModel.super_.call(_this, options);
  }
  utils.inherits(TechTicketsGridViewModel, TicketsGridViewModel);

  return TechTicketsGridViewModel;
});
