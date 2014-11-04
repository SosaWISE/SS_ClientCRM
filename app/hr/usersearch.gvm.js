define('src/hr/usersearch.gvm', [
  'src/hr/hr-cache',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  hrcache,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function UserSearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    UserSearchGridViewModel.super_.call(_this, {
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
          name: 'User ID',
          field: 'UserID',
          width: 50,
          formatter: function(row, cell, value) {
            return 'U' + value;
          },
        }, {
          id: 'GPEmployeeId',
          name: 'Company ID',
          field: 'GPEmployeeId',
          width: 50,
        }, {
          id: 'FullName',
          name: 'Full Name',
          field: 'FullName',
        }, {
          id: 'Email',
          name: 'Email',
          field: 'Email',
        }, {
          id: 'PhoneCell',
          name: 'Cell Phone',
          field: 'PhoneCell',
          formatter: SlickGridViewModel.formatters.phone,
        }, {
          id: 'PhoneHome',
          name: 'Home Phone',
          field: 'PhoneHome',
          formatter: SlickGridViewModel.formatters.phone,
        }, {
          id: 'UserEmployeeTypeId',
          name: 'User Type',
          field: 'UserEmployeeTypeId',
          formatter: function(row, cell, value) {
            var userEmployeeType = hrcache.getMap('userEmployeeTypes')[value];
            return (userEmployeeType) ? userEmployeeType.UserEmployeeTypeName : 'Unknown Type';
          },
        },
      ],
    });
  }
  utils.inherits(UserSearchGridViewModel, SlickGridViewModel);

  return UserSearchGridViewModel;
});
