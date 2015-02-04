define("src/account/security/dispatchagencys.gvm", [
  "ko",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  ko,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function DispatchAgencysGridViewModel(options) {
    var _this = this,
      list = ko.observableArray();
    DispatchAgencysGridViewModel.super_.call(_this, {
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      list: list,
      plugins: [
        new RowEvent({
          eventName: "onDblClick",
          fn: function(item) {
            options.edit(item, function(model, deleted) {
              if (!model) { // nothing changed
                return;
              }
              if (deleted) { // remove deleted item
                _this.list.remove(item);
              } else { // update in place
                _this.list.replace(item, model);
              }
            });
          },
        }),
      ],
      columns: [ //
        {
          id: "ID",
          name: "ID",
          field: "DispatchAgencyAssignmentID",
        }, {
          id: "AgencyType",
          name: "Agency Type",
          field: "DispatchAgencyTypeName",
        }, {
          id: "CSNumber",
          name: "CS #",
          field: "CsNo",
        }, {
          id: "AgencyName",
          name: "Agency Name",
          field: "DispatchAgencyName",
        }, {
          id: "DispatchPhone",
          name: "Dispatch Phone",
          field: "Phone1",
        }, {
          id: "StationVerfied",
          name: "Station Verfied",
          field: "IsVerified",
        }, {
          id: "PermitNumber",
          name: "Permit Number",
          field: "PermitNumber",
        }, {
          id: "PermitExpireDate",
          name: "Expiration Date",
          field: "PermitExpireDate",
          formatter: SlickGridViewModel.formatters.datetime,
        },
      ],
    });
  }
  utils.inherits(DispatchAgencysGridViewModel, SlickGridViewModel);

  return DispatchAgencysGridViewModel;
});
