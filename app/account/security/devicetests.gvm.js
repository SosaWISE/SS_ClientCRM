define("src/account/security/devicetests.gvm", [
  "src/slick/buttonscolumn",
  "ko",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  ButtonsColumn,
  ko,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function DeviceTestsGridViewModel(options) {
    var _this = this,
      list = ko.observableArray();
    DeviceTestsGridViewModel.super_.call(_this, {
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      list: list,
      columns: [ //
        new ButtonsColumn({
          id: "actions",
          name: "Actions",
          buttons: [ //
            {
              text: "Clear",
              fn: options.clearTest,
            },
          ]
        }), {
          id: "TestNum",
          name: "TestNum",
          field: "TestNum",
        }, {
          id: "TestCategoryDescription",
          name: "Category",
          field: "TestCategoryDescription",
        }, {
          id: "TestType",
          name: "Test Type",
          field: "TestType",
        }, {
          id: "EffectiveOn",
          name: "Effective On",
          field: "EffectiveOn",
          formatter: SlickGridViewModel.formatters.datetime,
        }, {
          id: "ExpiresOn",
          name: "Expires On",
          field: "ExpiresOn",
          formatter: SlickGridViewModel.formatters.datetime,
        },
      ],
    });

    _this.hasTwoWayTest = ko.computed(function() {
      return _this.list().some(function(item) {
        return item.TestCategory === "2wMed";
      });
    });
  }
  utils.inherits(DeviceTestsGridViewModel, SlickGridViewModel);

  return DeviceTestsGridViewModel;
});
