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
      "_FullName",
      "CustomerMasterFileId",
      "ID",
      "_StatusCode",
      "MSTicketNum",
      "_ServiceType",
      "_TechName",
    ];

    //  - Show Tech phone #(on click or hover)
    // Filterable by Geographic location.  In other words by office.


    options.columns = [ //
      {
        id: "ID",
        name: "Ticket #",
        field: "ID",
        sortable: true,
        width: 30,
      }, {
        id: "_FullName",
        name: "Customer",
        field: "_FullName",
        sortable: true,
      }, {
        id: "CustomerMasterFileId",
        name: "Customer #",
        field: "CustomerMasterFileId",
        sortable: true,
      }, {
        id: "_StatusCode",
        name: "Status",
        field: "_StatusCode",
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
        id: "_TechName",
        name: "Tech",
        field: "_TechName",
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
