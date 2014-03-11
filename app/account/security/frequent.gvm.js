define('src/account/security/frequent.gvm', [
  'ko',
  'src/slick/buttonscolumn',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  ko,
  ButtonsColumn,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function FrequentGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, ['addPart']);
    FrequentGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      columns: [
        {
          id: 'item',
          name: 'Item',
          field: 'ItemSKU',
        },
        {
          id: 'description',
          name: 'Description',
          field: 'ItemDesc',
        },
        {
          id: 'price',
          name: 'Price',
          field: 'Price',
          formatter: SlickGridViewModel.formatters.currency,
        },
        {
          id: 'points',
          name: 'Points',
          field: 'SystemPoints',
          formatter: SlickGridViewModel.formatters.likecurrency,
        },
        new ButtonsColumn({
          id: 'actions',
          name: 'Actions',
          buttons: [
            {
              text: 'Add',
              fn: options.addPart,
            },
          ]
        }),
      ],
    });
  }
  utils.inherits(FrequentGridViewModel, SlickGridViewModel);

  return FrequentGridViewModel;
});
