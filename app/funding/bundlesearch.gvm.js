define("src/funding/bundlesearch.gvm", [
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function BundleSearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    BundleSearchGridViewModel.super_.call(_this, {
      scrollToTop: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
      },
      plugins: [
        new RowEvent({
          eventName: "onDblClick",
          fn: options.open,
        }),
      ],
      columns: [ //
        {
          id: "BundleID",
          name: "B ID",
          field: "BundleID",
          width: 50,
        }, {
          id: "PurchaserName",
          name: "Purchaser Name",
          field: "PurchaserName",
          width: 50,
        }, {
          id: "SubmittedBy",
          name: "Submitted By",
          field: "SubmittedBy",
          width: 50,
        }, {
          id: "SubmittedOn",
          name: "Submitted On",
          field: "SubmittedOn",
          width: 50,
          formatter: SlickGridViewModel.formatters.datetime,
        }, {
          id: "CreatedBy",
          name: "Created By",
          field: "CreatedBy",
          width: 50,
        }, {
          id: "CreatedOn",
          name: "Created On",
          field: "CreatedOn",
          width: 50,
          formatter: SlickGridViewModel.formatters.datetime,
        }
      ]
    });

  }
  utils.inherits(BundleSearchGridViewModel, SlickGridViewModel);

  return BundleSearchGridViewModel;
});
