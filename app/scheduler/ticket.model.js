define("src/scheduler/ticket.model", [
  "src/core/utils",
  "src/core/combo.vm",
  "ko",
  "src/ukov",
], function(
  utils,
  ComboViewModel,
  ko,
  ukov
) {
  "use strict";

  var nullStrConverter = ukov.converters.nullString();
  var timeConverter = ukov.converters.time(
    function getStartDate(model) {
      return model._startDate;
    },
    function removeSeconds(dt) {
      dt.setSeconds(0, 0);
      return dt;
    }
  );
  var timeGroup = {
    keys: ["StartOn", "EndOn"],
    validators: [
      //
      function(val) {
        if (val.EndOn.valueOf() <= val.StartOn.valueOf()) {
          return "End Time must be greater than Start Time";
        }
      }
    ],
  };
  var schema = {
    _model: true,
    ID: {},
    // CreatedOn: {},
    // CreatedBy: {},
    // ModifiedOn: {},
    // ModifiedBy: {},
    IsDeleted: {},
    Version: {},
    ServiceTypeId: {
      validators: [
        ukov.validators.isRequired("Please select a Service Type"),
      ],
    },
    AccountId: {
      converter: ukov.converters.number(0),
    },
    CurrentAppointmentId: {},
    MSTicketNum: {},
    Notes: {},
    AppendNotes: {
      converter: nullStrConverter,
    },
    CompletedNote: {},
    CompletedOn: {},
    MSConfirmation: {},
    DealerConfirmation: {},

    // // AccountId: {
    // //   converter: ukov.converters.number(0),
    // // },
    // MonitoringStationNo: {},
    // MoniConfirmation: {},
    // TechConfirmation: {},
    // TechnicianId: {},
    // TripCharges: {},
    // Appointment: {},
    // AgentConfirmation: {},
    // ExpirationDate: {},
    // // Notes: {},

    AppointmentId: {},
    TechId: {
      converter: ukov.converters.number(0),
      validators: [
        ukov.validators.isRequired("TechId is required"),
      ],
    },
    StartOn: {
      converter: timeConverter,
      validators: [
        ukov.validators.isRequired("Start Time is required"),
      ],
      validationGroup: timeGroup,
    },
    EndOn: {
      converter: timeConverter,
      validators: [
        ukov.validators.isRequired("End Time is required"),
      ],
      validationGroup: timeGroup,
    },
    TravelTime: {},
    TechEnRouteOn: {},

    StatusCodeId: {},
    CustomerMasterFileId: {},
  };

  return function(item, options) {
    utils.ensureProps(options, [
      "serviceTypes",
    ]);

    var model = ukov.wrap(item, schema);
    model.ColumnID = model.TechId; // ColumnID is needed for CalItem

    model.serviceTypeCvm = new ComboViewModel({
      selectedValue: model.ServiceTypeId,
      list: options.serviceTypes,
      fields: {
        value: "ID",
        text: "Name",
      },
    });
    var tempTechs = [];
    (function() {
      var techId = model.TechId.peek();
      if (techId) {
        tempTechs.push({
          ID: techId,
          FullName: item.TechFullName,
        });
      }
    })();
    model.techCvm = new ComboViewModel({
      selectedValue: model.TechId,
      list: tempTechs,
      fields: {
        value: "ID",
        text: "FullName",
      },
    });

    return model;
  };
});
