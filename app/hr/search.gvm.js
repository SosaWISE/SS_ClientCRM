define('src/hr/search.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function SearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    SearchGridViewModel.super_.call(_this, {
      scrollToTop: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        // rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: options.open,
        }),
      ],
      columns: [ //
        {
          id: 'UserID',
          name: 'UserID',
          field: 'UserID',
          width: 50,
        }, {
          id: 'GPEmployeeID',
          name: 'CompanyID',
          field: 'GPEmployeeID',
          width: 50,
        }, {
          id: 'FullName',
          name: 'Full Nname',
          field: 'FullName',
        }, {
          id: 'Email',
          name: 'Email',
          field: 'Email',
        }, {
          id: 'PhoneCell',
          name: 'PhoneCell',
          field: 'PhoneCell',
          formatter: SlickGridViewModel.formatters.phone,
        }, {
          id: 'PhoneHome',
          name: 'PhoneHome',
          field: 'PhoneHome',
          formatter: SlickGridViewModel.formatters.phone,
        }, {
          id: 'UserEmployeeTypeId',
          name: 'UserEmployeeTypeId',
          field: 'UserEmployeeTypeId',
        },
      ],
    });
  }
  utils.inherits(SearchGridViewModel, SlickGridViewModel);

  return SearchGridViewModel;
});
