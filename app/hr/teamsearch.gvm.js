define("src/hr/teamsearch.gvm", [
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function TeamSearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    TeamSearchGridViewModel.super_.call(_this, {
      scrollToTop: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        // rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: "onDblClick",
          fn: options.open,
        }),
      ],
      columns: [ //
        {
          id: "TeamID",
          name: "Team ID",
          field: "TeamID",
          width: 50,
          formatter: function(row, cell, value) {
            return "T" + value;
          },
        }, {
          id: "TeamName",
          name: "Team",
          field: "TeamName",
        }, {
          id: "OfficeName",
          name: "Office",
          field: "OfficeName",
        }, {
          id: "City",
          name: "City",
          field: "City",
        }, {
          id: "StateAbbreviation",
          name: "State",
          field: "StateAbbreviation",
        }, {
          id: "SeasonName",
          name: "Season",
          field: "SeasonName",
        }, {
          id: "TeamType",
          name: "Team Role",
          field: "TeamType",
        },
      ],
    });
  }
  utils.inherits(TeamSearchGridViewModel, SlickGridViewModel);

  return TeamSearchGridViewModel;
});
