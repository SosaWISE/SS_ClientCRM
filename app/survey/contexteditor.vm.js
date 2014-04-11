define('src/survey/contexteditor.vm', [
  'src/ukov',
  'ko',
  'src/core/jsonhelpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ukov,
  ko,
  jsonhelpers,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  var contextSchema = {
    converter: ukov.converters.jsonString(),
    validators: [
      ukov.validators.isRequired('Context is required'),
    ],
  };

  function ContextEditorViewModel(options) {
    var _this = this;
    ContextEditorViewModel.super_.call(_this, options);
    // BaseViewModel.ensureProps(_this, []);

    _this.contextStr = ukov.wrap(jsonhelpers.stringify(_this.dataContext, 2), contextSchema);

    //
    // events
    //
    _this.cmdReset = ko.command(function(cb) {
      _this.contextStr(jsonhelpers.stringify(_this.dataContext, 2));
      cb();
    });
    _this.cmdReload = ko.command(function(cb) {
      _this.reloadSurvey(true);
      cb();
    });
  }
  utils.inherits(ContextEditorViewModel, BaseViewModel);

  ContextEditorViewModel.prototype.setTakeSurveyVm = function(takeSurveyVm) {
    var _this = this;
    _this.takeSurveyVm = takeSurveyVm;
    _this.takeSurveyVm.contextEditorVm = _this;
    _this.reloadSurvey();
  };


  ContextEditorViewModel.prototype.reloadSurvey = function(markClean) {
    var _this = this,
      val;
    if (!_this.takeSurveyVm) {
      throw new Error('takeSurveyVm not set');
    }

    if (markClean) {
      if (!_this.contextStr.isValid()) {
        notify.notify('warn', _this.contextStr.errMsg(), 7);
        return;
      }
      _this.contextStr.markClean();
      val = _this.contextStr.getValue();
    } else {
      val = _this.contextStr.cleanVal();
    }

    _this.takeSurveyVm.dataContext = jsonhelpers.parse(val);
    _this.takeSurveyVm.reloadSurvey();
  };

  return ContextEditorViewModel;
});
