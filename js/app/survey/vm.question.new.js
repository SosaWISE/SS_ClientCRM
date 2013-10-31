define('src/survey/vm.question.new', [
  'src/core/notify',
  'src/util/utils',
  'ko',
  'src/vm.combo',
  'src/core/vm.base',
], function(
  notify,
  utils,
  ko,
  ComboViewModel,
  BaseViewModel
) {
  'use strict';

  function NewQuestionViewModel(options) {
    var _this = this;
    NewQuestionViewModel.super_.call(_this, options);

    _this.qmComboVM = new ComboViewModel();
    _this.qmComboVM.setList(_this.questionMeanings);
    _this.qmComboVM.actions([
      {
        text: 'Add New Meaning',
        onClick: _this.onAddClick,
      }
    ]);

    //
    // events
    //
    _this.clickCancel = function() {
      _this.closeLayer();
    };
    _this.clickAdd = function() {
      _this.closeLayer();
    };
  }
  utils.inherits(NewQuestionViewModel, BaseViewModel);
  NewQuestionViewModel.prototype.viewTmpl = 'tmpl-question_new';

  return NewQuestionViewModel;
});
