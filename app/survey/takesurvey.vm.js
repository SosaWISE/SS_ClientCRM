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
        notify.error(err);
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
    var _this = this,
      flatContext;
    if (_this.surveyData) {
      flatContext = _this.tokensVM.deflateContext(_this.dataContext);
      _this.survey(createSurvey(_this.surveyData, _this.possibleAnswersVM.paMap, _this.tokensVM, flatContext, _this.retake));
    }
  };

  TakeSurveyViewModel.prototype.saveSurvey = function(cb) {
    var _this = this,
      errMsg, fails, isComplete = true,
      answers = [],
      tokensVM = _this.tokensVM,
      mapToTokenAnswers = [];

    function confirmCb(result) {
      if (result === 'yes') {
        doSave(_this, answers, mapToTokenAnswers, !errMsg, !!isComplete, cb);
      } else {
        cb();
      }
    }

    if (_this.surveyData) {
      if (!_this.showSave()) { // if (_this.resultid && !_this.retake) {
        notify.warn(strings.format('Survey {0} has already been saved.', _this.resultid), null, 7);
        cb();
        return;
      }

      // gather answers
      _this.survey().questions().forEach(function(vm) {
        //
        isComplete &= vm.isComplete.peek();
        //
        var errResult = vm.addAnswers(answers);
        // only store first error message
        if (!errMsg && errResult) {
          errMsg = errResult;
        }
      });
      answers.forEach(function(item) {
        if (item.MapToToken) {
          mapToTokenAnswers.push({
            TokenId: tokensVM.getTokenByName(item.MapToToken).TokenID,
            Answer: item.Answer,
          });
        }
        fails |= item.Fails;
        // not needed in answers array
        delete item.MapToToken;
        delete item.Answer;
        delete item.Fails;
      });

      // check for errors
      if (errMsg) {
        notify.warn(errMsg, null, 7);
        if (fails) {
          notify.confirm('Save failed survey?',
            'This survey has failed. It can be retaken later. Do you still want to save the survey and all edited fields?',
            confirmCb);
        } else {
          notify.confirm('Save incomplete survey?',
            'This survey is incomplete. Saving now will result in an automatic failure, ' +
            'but you will be able to retake it later. Do you still want to save the survey and all edited fields?',
            confirmCb);
        }
      } else {
        confirmCb('yes');
      }
    }
  };

  function doSave(_this, answers, mapToTokenAnswers, passed, isComplete, cb) {
    dataservice.survey.results.save({
      data: {
        // ResultID: 0,
        AccountId: _this.accountid,
        SurveyTranslationId: _this.surveyData.surveyTranslation.SurveyTranslationID,
        Context: _this.tokensVM.stringifyContext(_this.dataContext), // stringified Context
        // Caller: 'boh?',
        Passed: passed,
        IsComplete: isComplete,
        //
        Answers: answers, // all visible question answers
        MapToTokenAnswers: mapToTokenAnswers,
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
      notify.error(err);
    }));
  }

  function createSurvey(surveyData, paMap, tokensVM, flatContext, retake) {
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
      flatContext,
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

  function createTakeQuestionsOptions(ukovModel, questions, paMap, meanings, translations, tokensVM, flatContext, resultAnswers, retake) {
    var meaningMap = {},
      questionTokenValuesMap = {},
      questionHtmlMap = {},
      answerTextMap = {},
      questionOptions = [];

    if (!flatContext) {
      throw new Error('missing dataContext context');
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
        return flatContext[qmTokenMap.TokenId];
      });
    });
    translations.forEach(function(translation) {
      questionHtmlMap[translation.QuestionId] = surveyhelper.formatQuestion(
        translation.TextFormat,
        questionTokenValuesMap[translation.QuestionId],
        '[missing token value for index {0}]'
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
        MapToToken: q.MapToTokenId ? tokensVM.getToken(q.MapToTokenId).Token : null,
        questionPossibleAnswerMaps: q.questionPossibleAnswerMaps,
        html: questionHtmlMap[q.QuestionID] || '<strong>[No Translation]</strong>',
        answerText: answerTextMap[q.QuestionID],
        readonly: (!!resultAnswers) && !retake, // readonly if there are answers and not retaking the survey
        show: evaluateCondition(q.ConditionJson, flatContext),
      });
    });
    return questionOptions;
  }

  function evaluateCondition(conditionJson, flatContext) {
    /* jshint eqeqeq:false */
    var tokenValue, value, show = true;
    if (conditionJson) {
      tokenValue = flatContext[conditionJson.TokenId];
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
