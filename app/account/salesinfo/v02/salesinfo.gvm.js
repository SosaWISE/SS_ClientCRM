define("src/account/salesinfo/v02/salesinfo.gvm", [
  "src/account/mscache",
  "ko",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/core/money",
  "src/core/strings",
  "src/core/utils",
], function(
  mscache,
  ko,
  RowEvent,
  SlickGridViewModel,
  money,
  strings,
  utils
) {
  "use strict";

  function SalesInfoGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, [
      "edit",
    ]);
    SalesInfoGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: "onDblClick",
          fn: options.edit,
        }),
      ],
      columns: [ //
        {
          id: "Description",
          name: "Description",
          width: 200,
          formatter: function(row, cell, value, columnDef, dataItem) {
            var item = mscache.getMap("invoices/items")[dataItem.ItemId];
            return (item) ? item.ItemDesc : "Unknown Invoice Item";
          },
        }, {
          id: "SalesmanId",
          name: "Sales Rep",
          field: "SalesmanId",
          width: 50,
        }, {
          id: "Qty",
          name: "Qty",
          width: 30,
          formatter: function(row, cell, value, columnDef, dataItem) {
            return dataItem.groupItems.length;
          },
        }, {
          id: "SystemPoints",
          name: "Points",
          field: "SystemPoints",
          width: 40,
          formatter: SlickGridViewModel.formatters.likecurrency,
        }, {
          id: "TotalPoints",
          name: "Total Points",
          width: 40,
          formatter: function(row, cell, value, columnDef, dataItem) {
            return strings.formatters.likecurrency(dataItem.SystemPoints * dataItem.groupItems.length);
          },
        }, {
          id: "RetailPrice",
          name: "Price",
          field: "RetailPrice",
          width: 50,
          formatter: SlickGridViewModel.formatters.currency,
        }, {
          id: "TotalPrice",
          name: "Total Price",
          width: 50,
          formatter: function(row, cell, value, columnDef, dataItem) {
            return strings.formatters.currency(dataItem.RetailPrice * dataItem.groupItems.length);
          },
        },
      ],
    });

    _this.basePoints = ko.observable(0);
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
      list.forEach(function(dataItem) {
        //@TODO: use new field for determing whether to use points or use price
        if (dataItem.SystemPoints) {
          // use points
          pointsGiven += (dataItem.SystemPoints * dataItem.groupItems.length);
        } else {
          // use price
          retailTotal = money.add(retailTotal, money.mult(dataItem.RetailPrice, dataItem.groupItems.length));
        }
      });
      _this.pointsGiven(pointsGiven);
      pointsAvailable = _this.basePoints.peek() - pointsGiven;
      _this.pointsAvailable(pointsAvailable);
      if (pointsAvailable < 0) {
        pointsTotal = 30 * (-1 * pointsAvailable);
      }
      _this.pointsTotal(pointsTotal);
      _this.retailTotal(retailTotal);
      _this.estimateTotal(pointsTotal + retailTotal);
    });
  }
  utils.inherits(SalesInfoGridViewModel, SlickGridViewModel);

  return SalesInfoGridViewModel;
});
