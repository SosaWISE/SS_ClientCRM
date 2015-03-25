define('src/funding/criteriasearch.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function CriteriaSearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    CriteriaSearchGridViewModel.super_.call(_this, {
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
        {
          id: 'CriteriaID',
          name: 'Criteria ID',
          field: 'CriteriaID',
          width: 50,
          formatter: function(row, cell, value) {
            return 'CID ' + value;
          },
        }, {
          id: 'PurchaserName',
          name: 'Purchaser Name',
          field: 'PurchaserName',
          width: 100,
        }, {
          id: 'CriteriaName',
          name: 'Name',
          field: 'CriteriaName',
          width: 100,
        }, {
          id: 'Description',
          name: 'Description',
          field: 'Description',
          width: 150,
        }, {
          id: 'FilterString',
          name: 'Filter',
          field: 'FilterString',
          width: 150,
        }, {
          id: 'CreatedBy',
          name: 'Created By',
          field: 'CreatedBy',
          width: 100,
        }, {
          id: 'CreatedOn',
          name: 'Created On',
          field: 'CreatedOn',
          width: 100,
        }
      ]
    });
  }
  utils.inherits(CriteriaSearchGridViewModel, SlickGridViewModel);

  return CriteriaSearchGridViewModel;
});
