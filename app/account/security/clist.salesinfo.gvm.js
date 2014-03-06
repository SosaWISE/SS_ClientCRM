define('src/account/security/clist.salesinfo.gvm', [
  'ko',
  'src/slick/buttonscolumn',
  // 'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  ko,
  ButtonsColumn,
  // RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function CListSalesInfoGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, ['deletePart']);
    CListSalesInfoGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      // plugins: [
      //   new RowEvent({
      //     eventName: 'onDblClick',
      //     fn: function() {
      //       alert('double clicked');
      //     },
      //   }),
      // ],
      columns: [
        {
          id: 'description',
          name: 'Description',
          field: 'ItemDesc',
          width: 200,
        },
        {
          id: 'price',
          name: 'Price',
          field: 'Cost',
          formatter: SlickGridViewModel.formatters.currency,
        },
        {
          id: 'points',
          name: 'Points',
          field: 'SystemPoints',
          formatter: SlickGridViewModel.formatters.likecurrency,
        },
        {
          id: 'total',
          name: 'Total',
          field: 'RetailPrice',
          formatter: SlickGridViewModel.formatters.currency,
        },
        new ButtonsColumn({
          id: 'actions',
          name: 'Actions',
          buttons: [
            {
              text: 'Del',
              fn: options.deletePart,
            },
          ]
        }),
      ],
    });

    _this.pointsGiven = ko.observable(0);
    _this.estimateTotal = ko.observable(0);
    _this.list.subscribe(function(list) {
      /** Calculate points and estimate total price. */
      var totalPrice = 0,
        pointsGiven = 0;
      list.map(function(item) {
        // console.log("Invoice Item Refreshed:", item);
        totalPrice += item.RetailPrice;
        pointsGiven += item.SystemPoints;
      });
      _this.pointsGiven(pointsGiven);
      _this.estimateTotal(totalPrice);
    });
  }
  utils.inherits(CListSalesInfoGridViewModel, SlickGridViewModel);

  return CListSalesInfoGridViewModel;
});
