define('src/survey/takesurvey.vm', [
  'src/core/treehelper',
  'src/survey/surveyhelper',
  'underscore',
  'src/survey/tokens.vm',
  'src/survey/possibleanswers.vm',
  'src/survey/questions.parent.vm',
  'src/survey/takequestion.vm',
  'src/ukov',
  'ko',
  'src/dataservice',
  'src/core/jsonhelpers',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  treehelper,
  surveyhelper,
  underscore,
  TokensViewModel,
  PossibleAnswersViewModel,
  QuestionsParentViewModel,
  TakeQuestionViewModel,
  ukov,
  ko,
  dataservice,
  jsonhelpers,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function TakeSurveyViewModel(options) {
    var _this = this;
    TakeSurveyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['accountid', 'onSaved']);

    if (_this.surveyResult) {
      _this.resultid = _this.surveyResult.ResultID;
      // parse dataContext in onLoad
      // if (!_this.retake || !_this.dataContext) {
      //   _this.dataContext = _this.tokensVM.parseContext(_this.surveyResult.Context);
      // }
      _this.surveyid = _this.surveyResult.SurveyId;
      if (!_this.retake || !_this.locale) {
        _this.locale = _this.surveyResult.LocalizationCode;
      }

      // if (!_this.dataContext) {
      //   throw new Error('missing dataContext');
      // }
      if (!_this.surveyid) {
        throw new Error('missing surveyid');
      }
      if (!_this.locale) {
        throw new Error('missing locale');
      }
    } else if (!_this.surveyid || !_this.locale) {
      throw new Error('surveyResult or surveyid and locale need be passed in');
    }

    _this.survey = ko.observable();
    _this.showSave = ko.observable();
    _this.updateShowSave = function() {
      // return _this.resultid && !_this.retake;
      _this.showSave(!_this.resultid || _this.retake);
    };
    _this.updateShowSave();

    _this.tokensVM = _this.tokensVM || new TokensViewModel();
    _this.possibleAnswersVM = _this.possibleAnswersVM || new PossibleAnswersViewModel();

    //
    // events
    //
    _this.cmdSaveSurvey = ko.command(function(cb) {
      _this.saveSurvey(cb);
    });
  }
  utils.inherits(TakeSurveyViewModel, ControllerViewModel);
  TakeSurveyViewModel.prototype.viewTmpl = 'tmpl-takesurvey';
  TakeSurveyViewModel.prototype.width = '90%';
  TakeSurveyViewModel.prototype.height = '95%';
  TakeSurveyViewModel.prototype.autoflow = true;
  TakeSurveyViewModel.prototype.contextEditorVm = null;

  TakeSurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      tempSurveyType, surveyData, tempResultAnswers,
      tokensCb = join.add();

    // if (!_this.dataContext) {
    //   join.add()({ // Code: ???,
    //     Message: 'missing dataContext',
    //   });
    //   return;
    // }

    loadSurveyType(_this.surveyid, function(val) {
      tempSurveyType = val;
    }, join);

    loadSurvey(_this.surveyid, _this.locale, function(val) {
      surveyData = val;
    }, join);

    if (_this.resultid) {
      loadResultAnswers(_this.resultid, function(val) {
        tempResultAnswers = val;
      }, join);
    }

    // ensure tokens and PAs are loaded
    _this.tokensVM.load({}, {}, function() {
      if (_this.surveyResult && (!_this.retake || !_this.dataContext)) {
        _this.dataContext = _this.tokensVM.parseContext(_this.surveyResult.Context);
      }
      //
      if (!_this.dataContext) {
        tokensCb({ // Code: ???,
          Message: 'missing dataContext',
        });
      } else {
        tokensCb();
      }
    });
    _this.possibleAnswersVM.load({}, {}, join.add());

    join.when(function(err) {
      if (err) {
        notify.notify('error', 'Error', err.Message);
        return;
      }

      surveyData.surveyType = tempSurveyType;
      surveyData.resultAnswers = tempResultAnswers;

      //
      _this.surveyData = surveyData;
      _this.reloadSurvey();
    });
  };

  TakeSurveyViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    // do nothing
  };

  TakeSurveyViewModel.prototype.reloadSurvey = function() {
    var _this = this;
    if (_this.surveyData) {
      _this.survey(createSurvey(_this.surveyData, _this.possibleAnswersVM.paMap, _this.tokensVM, _this.dataContext, _this.retake));
    }
  };

  TakeSurveyViewModel.prototype.saveSurvey = function(cb) {
    var _this = this,
      errMsg, answers = [];
    if (_this.surveyData) {
      if (!_this.showSave()) { // if (_this.resultid && !_this.retake) {
        notify.notify('warn', strings.format('Survey {0} has already been saved.', _this.resultid), null, 7);
        cb();
        return;
      }

      // gather answers
      _this.survey().questions().forEach(function(vm) {
        var errResult = vm.addAnswers(answers);
        // only store first error message
        if (!errMsg && errResult) {
          errMsg = errResult;
        }
      });

      // check for errors
      if (errMsg) {
        notify.notify('warn', errMsg, null, 7);
        // allow for saving even if there are errors
        notify.confirm('Save incomplete survey?',
          'This survey is incomplete. Saving now will result in an automatic failure, ' +
          'but you will be able to retake it later. Do you still want to save the survey?',
          function(result) {
            if (result === 'yes') {
              doSave(_this, answers, errMsg, cb);
            } else {
              cb();
            }
          });
      } else {
        doSave(_this, answers, errMsg, cb);
      }
    }
  };

  function doSave(_this, answers, errMsg, cb) {
    dataservice.survey.results.save({
      data: {
        // ResultID: 0,
        AccountId: _this.accountid,
        SurveyTranslationId: _this.surveyData.surveyTranslation.SurveyTranslationID,
        Context: _this.tokensVM.stringifyContext(_this.dataContext), // stringified Context
        Answers: answers, // all visible question answers
        CreatedBy: 'boh?',
        Caller: 'boh?',
        Passed: !errMsg, //@REVIEW: Passed
        IsComplete: !errMsg, //@REVIEW: IsComplete
      },
    }, null, utils.safeCallback(cb, function(err, resp) {
      // always set retake to false
      _this.retake = false;
      //@REVIEW: do something with resp.Value?????
      _this.resultid = resp.Value.ResultID;
      _this.surveyData.resultAnswers = resp.Value.Answers;

      // update after retake and resultid have changed
      _this.updateShowSave();

      //
      _this.reloadSurvey();
      _this.onSaved();
    }, function(err) {
      notify.notify('error', 'Error', err.Message);
    }));
  }

  function createSurvey(surveyData, paMap, tokensVM, dataContext, retake) {
    var topVm, questionOptions, ukovModel;

    ukovModel = ukov.wrap({}, {
      _model: true
    });

    questionOptions = createTakeQuestionsOptions(
      ukovModel,
      surveyData.questions,
      paMap,
      surveyData.surveyType.questionMeanings,
      surveyData.surveyTranslation.questionTranslations,
      tokensVM,
      dataContext,
      surveyData.resultAnswers,
      retake
    );
    ukovModel.validate();
    ukovModel.update();

    topVm = new QuestionsParentViewModel({
      model: {
        SurveyID: 1,
      },
      version: surveyData.Version,
      locale: surveyData.surveyTranslation.LocalizationCode,
      ukovModel: ukovModel,
    });
    topVm.addQuestion = TakeQuestionViewModel.prototype.addQuestion;
    treehelper.makeTree(questionOptions, 'QuestionID', 'ParentId', function(options, parentVM /*, parent*/ ) {
      options.topVm = topVm;
      var vm = new TakeQuestionViewModel(options);
      if (options.show) {
        // only add if showing
        (parentVM || topVm).addQuestion(vm);
      }
      return vm;
    });

    return topVm;
  }

  function createTakeQuestionsOptions(ukovModel, questions, paMap, meanings, translations, tokensVM, dataContext, resultAnswers, retake) {
    var getTokenValue,
      meaningMap = {},
      questionTokenValuesMap = {},
      questionHtmlMap = {},
      answerTextMap = {},
      questionOptions = [];

    if (!dataContext) {
      throw new Error('missing dataContext context');
    }

    //
    // functions for looking up data context values
    //
    // uses memo-ize to remove redundant lookups
    getTokenValue = underscore.memoize(tokensVM.createTokenValueFunc(dataContext));
    //
    function getTokenIdValue(tokenId) {
      return getTokenValue(tokensVM.getToken(tokenId).Token);
    }

    //
    // create lookup mappings
    //
    meanings.forEach(function(qm) {
      meaningMap[qm.QuestionMeaningID] = qm;
    });
    questions.forEach(function(q) {
      var qm = meaningMap[q.QuestionMeaningId];
      questionTokenValuesMap[q.QuestionID] = qm.questionMeaningTokenMaps.map(function(qmTokenMap) {
        return getTokenIdValue(qmTokenMap.TokenId);
      });
    });
    translations.forEach(function(translation) {
      questionHtmlMap[translation.QuestionId] = surveyhelper.formatQuestion(
        translation.TextFormat,
        questionTokenValuesMap[translation.QuestionId],
        '[missing token value]'
      );
    });
    if (resultAnswers) {
      // answerTextMap
      resultAnswers.forEach(function(answer) {
        answerTextMap[answer.QuestionId] = answer.AnswerText;
      });
    }

    // create question options for creating a view model
    questions.forEach(function(q) {
      q.questionPossibleAnswerMaps.forEach(function(qpa) {
        qpa.text = paMap[qpa.PossibleAnswerId].AnswerText;
      });

      // if (!evaluateCondition(q.ConditionJson, getTokenIdValue)) {
      //   return;
      // }

      questionOptions.push({
        model: q,
        ukovModel: ukovModel,
        QuestionID: q.QuestionID,
        ParentId: q.ParentId,
        GroupOrder: q.GroupOrder,
        questionPossibleAnswerMaps: q.questionPossibleAnswerMaps,
        html: questionHtmlMap[q.QuestionID] || '<strong>[No Translation]</strong>',
        answerText: answerTextMap[q.QuestionID],
        readonly: (!!resultAnswers) && !retake, // readonly if there are answers and not retaking the survey
        show: evaluateCondition(q.ConditionJson, getTokenIdValue),
      });
    });
    return questionOptions;
  }

  function evaluateCondition(conditionJson, getTokenIdValue) {
    /* jshint eqeqeq:false */
    var tokenValue, value, show = true;
    if (conditionJson) {
      tokenValue = getTokenIdValue(conditionJson.TokenId);
      value = conditionJson.Value;
      switch (conditionJson.Comparison) {
        case '==':
          show = tokenValue == value;
          break;
        case '!=':
          show = tokenValue != value;
          break;
        case '>':
          show = tokenValue > value;
          break;
        case '>=':
          show = tokenValue >= value;
          break;
        case '<':
          show = tokenValue < value;
          break;
        case '<=':
          show = tokenValue <= value;
          break;
      }
    }
    return show;
  }

  // function makeTree(questions, parent) {
  //   var childs = [];
  //   questions.forEach(function(vm) {
  //     if (parent && vm.ParentId !== parent.QuestionID) {
  //       return;
  //     }
  //     if (!parent && vm.ParentId != null) {
  //       return;
  //     }
  //     vm.parent(parent);
  //     childs.push(vm);
  //     // start recursion
  //     vm.questions = makeTree(questions, vm);
  //     vm.childs = vm.questions; // needed inorder to walk with treehelper
  //   });
  //   return childs;
  // }

  //
  // load survey data
  //

  function loadSurveyType(surveyId, setter, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyId,
      link: 'surveyType',
    }, setter, function(err, resp) {
      if (!err) {
        var surveyType = resp.Value;
        loadQuestionMeanings(surveyType.SurveyTypeID, function(val) {
          surveyType.questionMeanings = val;
        }, join);
      }
      cb(err, resp);
    });
  }

  function loadQuestionMeanings(surveyTypeID, setter, join) {
    var cb = join.add();
    dataservice.survey.surveyTypes.read({
      id: surveyTypeID,
      link: 'questionMeanings',
    }, setter, function(err, resp) {
      if (!err) {
        resp.Value.forEach(function(qm) {
          loadQuestionMeaningTokenMaps(qm.QuestionMeaningID, function(val) {
            qm.questionMeaningTokenMaps = val;
          }, join);
        });
      }
      cb(err, resp);
    });
  }

  function loadQuestionMeaningTokenMaps(questionMeaningID, setter, join) {
    var cb = join.add();
    dataservice.survey.questionMeanings.read({
      id: questionMeaningID,
      link: 'questionMeaningTokenMaps',
    }, setter, cb);
  }

  function loadSurvey(surveyId, locale, setter, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyId
    }, setter, function(err, resp) {
      if (!err) {
        var survey = resp.Value;

        loadQuestions(survey.SurveyID, function(val) {
          survey.questions = val;
        }, join);

        loadSurveyTranslation(survey.SurveyID, locale, function(val) {
          survey.surveyTranslation = val;
        }, join);
      }
      cb(err, resp);
    });
  }

  function loadQuestions(surveyId, setter, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyId,
      link: 'questions',
    }, setter, function(err, resp) {
      if (!err) {
        resp.Value.sort(surveyhelper.questionsSorter);
        resp.Value.forEach(function(question) {
          loadQuestionPossibleAnswerMaps(question.QuestionID, function(val) {
            question.questionPossibleAnswerMaps = val;
          }, join);
        });
      }
      cb(err, resp);
    });
  }

  function loadQuestionPossibleAnswerMaps(questionID, setter, join) {
    var cb = join.add();
    dataservice.survey.questions.read({
      id: questionID,
      link: 'questionPossibleAnswerMaps',
    }, setter, cb);
  }

  function loadSurveyTranslation(surveyID, locale, setter, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'surveyTranslations',
    }, null, function(err, resp) {
      if (!err) {
        if (!resp.Value.some(function(surveyTranslation) {
          if (surveyTranslation.LocalizationCode === locale) {
            setter(surveyTranslation);
            loadQuestionTranslations(surveyTranslation.SurveyTranslationID, function(val) {
              surveyTranslation.questionTranslations = val;
            }, join);
            return true;
          }
        })) {
          return cb({ // Code: ???,
            Message: 'locale not found',
          }, resp);
        }
      }
      cb(err, resp);
    });
  }

  function loadQuestionTranslations(surveyTranslationID, setter, join) {
    var cb = join.add();
    dataservice.survey.surveyTranslations.read({
      id: surveyTranslationID,
      link: 'questionTranslations',
    }, setter, cb);
  }

  function loadResultAnswers(resultid, setter, join) {
    var cb = join.add();
    dataservice.survey.results.read({
      id: resultid,
      link: 'answers',
    }, setter, cb);
  }

  return TakeSurveyViewModel;
});
