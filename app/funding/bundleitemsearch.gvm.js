define('src/funding/bundleitemsearch.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
  'src/slick/buttonscolumn',
], function(
  RowEvent,
  SlickGridViewModel,
  utils,
  ButtonsColumn
) {
  "use strict";

  function BundleItemSearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    BundleItemSearchGridViewModel.super_.call(_this, {
      scrollToTop: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: options.open,
        }),
      ],
      columns: [ //
        new ButtonsColumn({
          id: 'actions',
          name: '',
          width: 20,
          buttons: [{
            text: 'X',
            fn: function(item) {
              console.log(item);
            },
          }],
        }), {
          id: 'BundleItemID',
          name: 'BI ID',
          field: 'BundleItemID',
          width: 50,
          formater: function(row, cell, value) {
            return 'BIT ' + value;
          },
        }, {
          id: 'BundleId',
          name: 'B ID',
          field: 'BundleId',
          width: 50,
          formater: function(row, cell, value) {
            return 'BI ' + value;
          },
        }, {
          id: 'PacketId',
          name: 'P ID',
          field: 'PacketId',
          width: 50,
          formater: function(row, cell, value) {
            return 'P ' + value;
          },
        }, {
          id: 'CreatedBy',
          name: 'Created By',
          field: 'CreatedBy',
          width: 50,
        }, {
          id: 'CreatedOn',
          name: 'Created On',
          field: 'CreatedOn',
          width: 50,
          formatter: SlickGridViewModel.formatters.datetime,
        }
      ]
    });
  }

  utils.inherits(BundleItemSearchGridViewModel, SlickGridViewModel);

  // ** Return class
  return BundleItemSearchGridViewModel;
});
