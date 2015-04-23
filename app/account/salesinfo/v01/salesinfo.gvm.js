define("src/account/salesinfo/v01/salesinfo.gvm", [
  "ko",
  "src/slick/buttonscolumn",
  // "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/utils",
], function(
  ko,
  ButtonsColumn,
  // RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function SalesInfoV01GridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, ["deletePart"]);
    SalesInfoV01GridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      // plugins: [
      //   new RowEvent({
      //     eventName: "onDblClick",
      //     fn: function() {
      //       window.alert("double clicked");
      //     },
      //   }),
      // ],
      columns: [ //
        {
          id: "description",
          name: "Description",
          field: "ItemDesc",
          width: 200,
        }, {
          id: "price",
          name: "Price",
          field: "RetailPrice",
          formatter: SlickGridViewModel.formatters.currency,
        }, {
          id: "points",
          name: "Points",
          field: "SystemPoints",
          formatter: SlickGridViewModel.formatters.likecurrency,
        }, {
          id: "total",
          name: "Total",
          field: "RetailPrice",
          formatter: SlickGridViewModel.formatters.currency,
        },
        new ButtonsColumn({
          id: "actions",
          name: "Actions",
          buttons: [ //
            {
              text: "Delete",
              fn: options.deletePart,
            },
          ]
        }),
      ],
    });

    _this.pointsGiven = ko.observable(0);
    _this.pointsAvailable = ko.observable(0);
    _this.pointsTotal = ko.observable(0);
    _this.retailTotal = ko.observable(0);
    _this.estimateTotal = ko.observable(0);
    _this.list.subscribe(function(list) {
      var pointsGiven = 0,
        pointsAvailable = 0,
        pointsTotal = 0,
        retailTotal = 0;
      list.forEach(function(item) {
        //@TODO: use new field for determing whether to use points or use price
        if (item.SystemPoints) {
          // use points
          pointsGiven += item.SystemPoints;
        } else {
          // use price
          retailTotal += item.RetailPrice;
        }
      });
      _this.pointsGiven(pointsGiven);
      pointsAvailable = 8 - pointsGiven;
      _this.pointsAvailable(pointsAvailable);
      if (pointsAvailable < 0) {
        pointsTotal = 30 * (-1 * pointsAvailable);
      }
      _this.pointsTotal(pointsTotal);
      _this.retailTotal(retailTotal);
      _this.estimateTotal(pointsTotal + retailTotal);
    });
  }
  utils.inherits(SalesInfoV01GridViewModel, SlickGridViewModel);

  return SalesInfoV01GridViewModel;
});
