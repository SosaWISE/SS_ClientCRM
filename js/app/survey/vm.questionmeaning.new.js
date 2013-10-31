define('src/survey/vm.questionmeaning.new', [
  'src/core/notify',
  'src/util/utils',
  'ko',
  'src/core/vm.base'
], function(
  notify,
  utils,
  ko,
  BaseViewModel
) {
  'use strict';

  function NewQuestionMeaningViewModel(options) {
    var _this = this;
    NewQuestionMeaningViewModel.super_.call(_this, options);

    _this.name = ko.observable(_this.name);
  }
  utils.inherits(NewQuestionMeaningViewModel, BaseViewModel);
  NewQuestionMeaningViewModel.prototype.viewTmpl = 'tmpl-questionmeaning_new';

  return NewQuestionMeaningViewModel;
});
