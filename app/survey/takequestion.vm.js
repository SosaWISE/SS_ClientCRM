define('src/survey/takequestion.vm', [
  'src/core/strings',
  'src/core/combo.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  strings,
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
    BaseViewModel.ensureProps(_this, []);

    _this.showSubs = ko.observable(false);
    _this.parent = ko.observable();

    // computed observables
    _this.name = ko.computed({
      deferEvaluation: true,
      read: function() {
        return getName(_this.parent(), _this.GroupOrder);
      },
    });
    _this.isComplete = ko.computed({
      deferEvaluation: true,
      read: function() {
        // complete if children are complete
        var subsComplete = true;
        if (_this.showSubs() && _this.questions.length) {
          subsComplete = _this.questions.every(function(q) {
            return q.isComplete();
          });
        }
        //@TODO: add answer validation
        if (_this.answer.isValid) {
          return strings.trim(_this.answer.isValid()) && subsComplete;
        } else {
          return strings.trim(_this.answer()) && subsComplete;
        }
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
    if (_this.answerText) {
      _this.answer = ko.observable('');
      _this.answerMode = "answered";
      if (_this.questionPossibleAnswerMaps.length) {
        if (!_this.questionPossibleAnswerMaps.some(function(paMap) {
          if (paMap.text === _this.answerText) {
            _this.clickAnswer(paMap);
            return true;
          }
        })) {
          throw new Error('`' + _this.answerText + '` not found in list of possible answers');
        }
      } else {
        _this.answer(_this.answerText);
      }
    } else {
      _this.answerMode = calcAnswerMode(_this.questionPossibleAnswerMaps.length);
      if (_this.answerMode === 'text') {
        //@TODO: use MapToToken observable
        // BaseViewModel.ensureProps(_this, ['mapToTokenObservable']);
        // _this.answer = ???;
        _this.answer = ko.observable('');
      } else {
        _this.answer = ko.observable('');
      }
      switch (_this.answerMode) {
        case 'radiolist':
          break;
        case 'combo':
          _this.cvm = new ComboViewModel({
            fields: {
              text: 'text',
              value: 'text',
            },
            list: _this.questionPossibleAnswerMaps
          });
          _this.cvm.selected.subscribe(function(selected) {
            _this.clickAnswer(selected.item);
          });
          break;
        case 'text':
          break;
      }
    }
  }
  utils.inherits(TakeQuestionViewModel, BaseViewModel);
  TakeQuestionViewModel.prototype.viewTmpl = 'tmpl-takequestion';

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + index + '.';
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
