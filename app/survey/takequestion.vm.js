define('src/survey/takequestion.vm', [
  'src/ukov',
  'ko',
  'src/core/treehelper',
  'src/core/combo.vm',
  'src/core/strings',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  ukov,
  ko,
  treehelper,
  ComboViewModel,
  strings,
  notify,
  BaseViewModel,
  utils
) {
  'use strict';

  var schemas, required = ukov.validators.isRequired();

  schemas = {
    'default': {
      validators: [required],
    },
    'email': {
      converter: ukov.converters.string(),
      validators: [required, ukov.validators.isEmail()],
    },
  };

  function TakeQuestionViewModel(options) {
    var _this = this;
    TakeQuestionViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['ukovModel', 'QuestionID']);

    _this.showSubs = ko.observable(false);
    initAnswer(_this);
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
        // complete if valid and children are complete
        var complete = _this.answer.isValid();
        if (complete && _this.showSubs() && _this.questions.length) {
          complete = _this.questions.every(function(q) {
            return q.isComplete();
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
  utils.inherits(TakeQuestionViewModel, BaseViewModel);
  TakeQuestionViewModel.prototype.viewTmpl = 'tmpl-takequestion';

  // recursively add answers and return first error message
  TakeQuestionViewModel.prototype.addAnswers = function(list) {
    var _this = this,
      errMsg;
    if (_this.answer.isValid()) {
      list.push({
        QuestionId: _this.QuestionID,
        AnswerText: _this.answer.getValue(),
      });
      if (_this.showSubs()) {
        // begin recursion
        _this.questions.forEach(function(vm) {
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

  TakeQuestionViewModel.prototype.findPaMap = function(answerText) {
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

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + index + '.';
  }

  function initAnswer(_this) {
    if (_this.answer) {
      throw new Error('`answer` already defined');
    }

    if (_this.readonly) {
      // can't edit
      _this.answerMode = "answered";
      _this.answer = createChildProp(_this);
    } else {
      // editable
      _this.answerMode = calcAnswerMode(_this.questionPossibleAnswerMaps.length);
      if (_this.answerMode === 'text') {
        //@TODO: use MapToToken observable
        // BaseViewModel.ensureProps(_this, ['mapToTokenObservable']);
        _this.answer = createChildProp(_this, 'email');
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

    // update childs when answer is set
    _this.answer.subscribe(function(answerText) {
      var paMap = _this.findPaMap(answerText),
        expands = !! paMap && paMap.Expands;

      _this.showSubs(expands);

      // recursively update child questions to make ukovModel match showSubs and isComplete
      // ukovModel questions are flat so ignoring just this question's questions won't work
      treehelper.walkTree(_this.childs, function(vm) {
        vm.answer.ignore(!expands);
      });
      _this.ukovModel.update();
    });

    // set correct answerText(not null) and mark it as clean
    _this.answer(_this.answerText || '');
    _this.answer.markClean();
  }

  function createChildProp(_this, schemaName) {
    var key = _this.QuestionID,
      doc = _this.ukovModel.doc,
      child;
    if (doc[key]) {
      console.warn('duplicate question ' + key);
    }
    // add this prop's schema to the parent doc
    doc[key] = schemas[schemaName || 'default'] || schemas['default'];

    child = _this.ukovModel.createChild(key); // value will default to null
    return (_this.ukovModel[key] = child);
  }

  function calcAnswerMode(num) {
    var result;
    if (num < 1) {
      result = 'text';
    } else if (num < 3) {
      result = 'radiolist';
    } else {
      result = 'combo';
    }
    return result;
  }

  return TakeQuestionViewModel;
});
