define('src/survey/vm.takequestion', [
  'src/vm.combo',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  ComboViewModel,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  function TakeQuestionViewModel(options) {
    var _this = this;
    TakeQuestionViewModel.super_.call(_this, options);
    _this.ensureProps([]);

    _this.answer = ko.observable('');
    _this.showSubs = ko.observable(false);

    _this.parent = ko.observable();
    _this.name = ko.computed({
      deferEvaluation: true,
      read: function() {
        return getName(_this.parent(), _this.GroupOrder);
      },
    });

    //
    // events
    //
    _this.clickAnswer = function(questionPossibleAnswerMap) {
      _this.answer(questionPossibleAnswerMap.text);
      _this.showSubs(questionPossibleAnswerMap.Expands);
    };

    //
    //
    //
    _this.answerMode = calcAnswerMode(_this.questionPossibleAnswerMaps.length);
    switch (_this.answerMode) {
      case 'radiolist':
        break;
      case 'combo':
        _this.comboVM = new ComboViewModel();
        _this.comboVM.selectedItem.subscribe(function(item) {
          _this.clickAnswer(item.item);
        });
        _this.comboVM.setList(_this.questionPossibleAnswerMaps);
        break;
      case 'text':
        break;
    }
  }
  utils.inherits(TakeQuestionViewModel, BaseViewModel);
  TakeQuestionViewModel.prototype.viewTmpl = 'tmpl-question';

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + (index + 1) + '.';
  }

  function calcAnswerMode(num) {
    var result;
    if (num > 2) {
      result = 'combo';
    } else if (num > 0) {
      result = 'radiolist';
    } else {
      result = 'text';
    }
    return result;
  }

  return TakeQuestionViewModel;
});
