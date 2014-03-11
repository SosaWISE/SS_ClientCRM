define('src/account/security/clist.survey.gvm', [
  'src/core/notify',
  'ko',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  notify,
  ko,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function CListSurveyGridViewModel(options) {
    var _this = this;
    CListSurveyGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onClick',
          fn: function(item) {
            options.onClick(item);
            return true; // do default
          },
        }),
      ],
      columns: [
        {
          id: 'CreatedBy',
          name: 'Given By',
          field: 'CreatedBy',
        },
        {
          id: 'CreatedOn',
          name: 'Survey Date',
          field: 'CreatedOn',
        },
        {
          id: 'Caller',
          name: 'Caller',
          field: 'Caller',
        },
        {
          id: 'SurveyName',
          name: 'Survey Name',
          field: 'SurveyName',
        },
        {
          id: 'Version',
          name: 'Version',
          field: 'Version',
        },
        {
          id: 'Localization',
          name: 'Localization',
          field: 'Localization',
        },
        {
          id: 'Status',
          name: 'Status',
          field: 'Status',
        },
        {
          id: 'Result',
          name: 'Result',
          field: 'Result',
        },
      ],
    });
    while (_this.list().length < 2) {
      _this.list().push({
        id: (_this.list().length + 1),
        surveyid: (_this.list().length + 1),
        locale: 'en',
        resultid: (_this.list().length + 1),


        CreatedBy: 'CreatedBy ' + (_this.list().length + 1),
        CreatedOn: 'CreatedOn ' + (_this.list().length + 1),
        Caller: 'Caller ' + (_this.list().length + 1),
        SurveyName: 'SurveyName ' + (_this.list().length + 1),
        Version: 'Version ' + (_this.list().length + 1),
        Localization: 'Localization ' + (_this.list().length + 1),
        Status: 'Status ' + (_this.list().length + 1),
        Result: 'Result ' + (_this.list().length + 1),
      });
    }
  }
  utils.inherits(CListSurveyGridViewModel, SlickGridViewModel);

  return CListSurveyGridViewModel;
});
