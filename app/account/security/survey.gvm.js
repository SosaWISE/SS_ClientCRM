define('src/account/security/survey.gvm', [
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

  function SurveyGridViewModel(options) {
    var _this = this;
    SurveyGridViewModel.super_.call(_this, {
      options: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onClick',
          fn: function(item) {
            options.onClick(item);
            notify.notify('info', 'clicked ' + item.id, 5);
            return true; // do default
          },
        }),
      ],
      columns: [
        {
          id: 'CreatedBy',
          name: 'CreatedBy',
          field: 'CreatedBy',
        },
        {
          id: 'CreatedOn',
          name: 'CreatedOn',
          field: 'CreatedOn',
        },
        {
          id: 'Caller',
          name: 'Caller',
          field: 'Caller',
        },
        {
          id: 'SurveyName',
          name: 'SurveyName',
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
  utils.inherits(SurveyGridViewModel, SlickGridViewModel);

  return SurveyGridViewModel;
});
