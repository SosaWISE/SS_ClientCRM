define('src/account/security/clist.survey.gvm', [
  'moment',
  'src/core/notify',
  'ko',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  moment,
  notify,
  ko,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function CListSurveyGridViewModel(options) {
    var _this = this;
    CListSurveyGridViewModel.super_.call(_this, {
      gridOptions: {
        multiSelect: false,
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      onSelectedRowsChanged: function(rows) {
        _this.selectedRow = rows[0];
        if (_this.selectedRow) {
          options.onClick(_this.selectedRow);
        }
      },
      columns: [
        {
          id: 'CreatedBy',
          name: 'Given By',
          field: 'CreatedBy',
          width: 50,
        },
        {
          id: 'CreatedOn',
          name: 'Survey Date',
          field: 'CreatedOn',
          formatter: function(row, cell, value) {
            return moment.utc(value).format('MM/DD/YYYY hh:mm a');
          },
        },
        {
          id: 'Caller',
          name: 'Caller',
          field: 'Caller',
          width: 50,
        },
        {
          id: 'Version',
          name: 'Version',
          field: 'Version',
          width: 30,
        },
        {
          id: 'LocalizationCode',
          name: 'Localization',
          field: 'LocalizationCode',
          width: 30,
        },
        {
          id: 'Status',
          name: 'Status',
          field: 'IsComplete',
          formatter: function(row, cell, value) {
            return value ? 'Complete' : 'Incomplete';
          },
          width: 30,
        },
        {
          id: 'Result',
          name: 'Result',
          field: 'Passed',
          formatter: function(row, cell, value) {
            return value ? 'Passed' : 'Failed';
          },
          width: 30,
        },
      ],
    });
  }
  utils.inherits(CListSurveyGridViewModel, SlickGridViewModel);

  return CListSurveyGridViewModel;
});
