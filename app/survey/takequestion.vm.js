define('src/survey/takequestion.vm', [
  'src/survey/questionanswers',
  'src/survey/questionschemas',
  'src/ukov',
  'ko',
  'src/core/treehelper',
  'src/core/combo.vm',
  'src/core/strings',
  'src/core/notify',
  'src/survey/questions.parent.vm', //'src/core/base.vm',
  'src/core/utils',
], function(
  questionanswers,
  questionschemas,
  ukov,
  ko,
  treehelper,
  ComboViewModel,
  strings,
  notify,
  QuestionsParentViewModel,
  utils
) {
  'use strict';

  function TakeQuestionViewModel(options) {
    var _this = this;
    TakeQuestionViewModel.super_.call(_this, options);
    QuestionsParentViewModel.ensureProps(_this, ['ukovModel', 'QuestionID', 'show']);

    _this.showSubs = ko.observable(false);
    _this.fails = ko.observable(false);
    initAnswer(_this);

    // computed observables
    _this.isComplete = ko.computed({
      deferEvaluation: true,
      read: function() {
        // complete if valid and children are complete
        var showSubs = _this.showSubs(),
          questions = _this.questions(),
          complete = _this.answer.isValid();
        if (showSubs && questions.length) {
          complete = questions.every(function(q) {
            return !_this.show || q.isComplete();
          });
        }
        return complete;
      },
    });

    //
    // events
    //
    _this.clickAnswer = function(paMap) {
      _this.answer(paMap.text);
    };
  }
  // utils.inherits(TakeQuestionViewModel, BaseViewModel);
  utils.inherits(TakeQuestionViewModel, QuestionsParentViewModel);
  TakeQuestionViewModel.prototype.viewTmpl = 'tmpl-takequestion';

  // recursively add answers and return first error message
  TakeQuestionViewModel.prototype.addAnswers = function(list) {
    var _this = this,
      errMsg, answer;
    if (_this.answer.isValid()) {
      //
      if (!errMsg && _this.fails.peek()) {
        errMsg = 'Auto Fail';
      }
      //
      answer = getAnswer(_this, false);
      list.push({
        QuestionId: _this.QuestionID,
        AnswerText: (answer != null) ? String(answer) : null, // ensure it is a string
        // use to create map to token answers
        MapToToken: _this.MapToToken,
        Answer: answer,
        //
        Fails: _this.fails.peek(),
      });
      if (_this.showSubs()) {
        // begin recursion
        _this.questions.peek().forEach(function(vm) {
          var result = vm.addAnswers(list);
          // only store first error message
          if (!errMsg) {
            errMsg = result;
          }
        });
      }
    } else {
      errMsg = _this.answer.errMsg();
    }
    return errMsg;
  };

  TakeQuestionViewModel.prototype.findPam = function(answerText) {
    var _this = this,
      result;
    if (_this.questionPossibleAnswerMaps.length) {
      _this.questionPossibleAnswerMaps.some(function(paMap) {
        if (paMap.text === answerText) {
          result = paMap;
          return true;
        }
      });
    }
    return result;
  };

  TakeQuestionViewModel.prototype.addQuestion = function(vm) {
    var _this = this;
    // add to list
    _this.questions.push(vm);
    //
    _this.updateChildNames();
    return vm;
  };

  function initAnswer(_this) {
    if (_this.answer) {
      throw new Error('`answer` already defined');
    }

    if (_this.readonly) {
      // ca not edit
      _this.answerMode = "answered";
      _this.answer = createChildProp(_this);
    } else {
      // editable
      _this.answerMode = calcAnswerMode(_this.questionPossibleAnswerMaps.length);
      if (_this.answerMode === 'input') {
        _this.answer = createChildProp(_this, _this.MapToToken);
      } else {
        _this.answer = createChildProp(_this);

        if (_this.answerMode === 'combo') {
          _this.cvm = new ComboViewModel({
            selectedValue: _this.answer,
            fields: {
              text: 'text',
              value: 'text',
            },
            list: _this.questionPossibleAnswerMaps
          });
        }
      }
    }

    // update childs when answer gets modified
    _this.answer.subscribe(function() {
      var answerText = getAnswer(_this, true),
        paMap = _this.findPam(answerText),
        expands = !!paMap && paMap.Expands;

      _this.showSubs(expands);
      _this.fails(paMap && paMap.Fails);

      // recursively update child questions to make ukovModel match showSubs and isComplete
      // ukovModel questions are flat so ignoring just this question's questions wo not work
      treehelper.walkTree(_this, 'questions', function(vm) {
        vm.answer.ignore(!expands);
      });
      _this.ukovModel.update();
    });

    if (_this.readonly) {
      // set correct answerText (pipes removed)
      _this.answer.questionanswer.fromAnswer(_this.answer, fixAnswer(_this.answerText));
    } else {
      // set correct answerText (not null)
      _this.answer.questionanswer.fromAnswer(_this.answer, _this.answerText || '');
    }
    _this.answer.markClean();
  }

  function getAnswer(_this, removePipes) {
    var answerText = _this.answer.questionanswer.toAnswer(_this.answer);
    if (removePipes) {
      answerText = fixAnswer(answerText);
    }
    return answerText;
  }

  function fixAnswer(answerText) {
    if (utils.isStr(answerText)) {
      // replace pipes with spaces
      return answerText.replace(/\|/g, ' ');
    }
    return answerText;
  }

  function createChildProp(_this, tokenName) {
    var key = _this.QuestionID,
      doc = _this.ukovModel.doc,
      child;
    if (doc[key]) {
      console.warn('duplicate question ' + key);
    }

    tokenName = tokenName || 'default';

    // add this prop's schema to the parent doc
    if (!questionschemas[tokenName]) {
      console.warn('questionschemas does not have token: ' + tokenName);
      doc[key] = {}; // empty schema???
    } else {
      doc[key] = questionschemas[tokenName];
    }

    child = _this.ukovModel.createChild(key); // value will default to null

    //@REVIEW: why is it named questionanswer? could not think of anything better...
    //- by tokenName, then by answerMode since one should always exist for the answerMode
    child.questionanswer = questionanswers[tokenName] || questionanswers[_this.answerMode];

    return (_this.ukovModel[key] = child);
  }

  function calcAnswerMode(num) {
    var result;
    if (num < 1) {
      result = 'input';
    } else if (num < 3) {
      result = 'radiolist';
    } else {
      result = 'combo';
    }
    return result;
  }

  return TakeQuestionViewModel;
});
