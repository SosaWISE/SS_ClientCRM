define("src/scheduler/service.tickets.gvm", [
  "src/scheduler/tickets.gvm",
  "src/core/utils",
], function(
  TicketsGridViewModel,
  utils
) {
  "use strict";

  function ServiceTicketsGridViewModel(options) {
    var _this = this;
    options = options || {};
    options.filterFields = [
      "ID",
      "_StatusCode",
      "MSTicketNum",
      "_ServiceType",
      "TechGPEmployeeID",
    ];
    options.columns = [ //
      {
        id: "_StatusCode",
        name: "Status",
        field: "_StatusCode",
        sortable: true,
      }, {
        id: "ID",
        name: "ID",
        field: "ID",
        sortable: true,
      }, {
        id: "MSTicketNum",
        name: "MS Ticket#",
        field: "MSTicketNum",
        sortable: true,
      }, {
        id: "_ServiceType",
        name: "Service Type",
        field: "_ServiceType",
        sortable: true,
      }, {
        id: "TechGPEmployeeID",
        name: "Tech",
        field: "TechGPEmployeeID",
        sortable: true,
      },
      // {
      //   id: "MSConfirmation",
      //   name: "MS Confirmation",
      //   field: "MSConfirmation",
      // },
      // {
      //   id: "AgentConfirmation",
      //   name: "Agent Confirmation",
      //   field: "AgentConfirmation",
      // },
      // {
      //   id: "ExpirationDate",
      //   name: "Expiration Date",
      //   field: "ExpirationDate",
      //   formatter: SlickGridViewModel.formatters.datetime,
      // },
    ];
    ServiceTicketsGridViewModel.super_.call(_this, options);
  }
  utils.inherits(ServiceTicketsGridViewModel, TicketsGridViewModel);

  return ServiceTicketsGridViewModel;
});
