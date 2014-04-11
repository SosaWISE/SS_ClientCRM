define('src/survey/takesurvey.vm', [
  'src/survey/surveyhelper',
  'underscore',
  'src/survey/tokens.vm',
  'src/survey/possibleanswers.vm',
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
  surveyhelper,
  underscore,
  TokensViewModel,
  PossibleAnswersViewModel,
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
    // ControllerViewModel.ensureProps(_this, ['dataContext']);

    if (_this.surveyResult) {
      _this.dataContext = (utils.isStr(_this.surveyResult.Context)) ? jsonhelpers.parse(_this.surveyResult.Context) : _this.surveyResult.Context;
      _this.resultid = _this.surveyResult.ResultID;
      _this.surveyid = _this.surveyResult.SurveyId;
      _this.locale = _this.surveyResult.LocalizationCode;
      if (!_this.dataContext) {
        throw new Error('missing dataContext');
      }
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
  TakeSurveyViewModel.prototype.contextEditorVm = null;

  TakeSurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      tempSurveyType, surveyData, tempResultAnswers;

    if (!_this.dataContext) {
      join.add()({ // Code: ???,
        Message: 'missing dataContext',
      });
      return;
    }

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
    _this.tokensVM.load({}, {}, join.add());
    _this.possibleAnswersVM.load({}, {}, join.add());

    join.when(function(err) {
      if (err) {
        notify.notify('error', err.Message);
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
      _this.survey(createSurvey(_this.surveyData, _this.possibleAnswersVM.paMap, _this.tokensVM.tokenMap, _this.dataContext));
    }
  };

  TakeSurveyViewModel.prototype.saveSurvey = function(cb) {
    var _this = this,
      errMsg, answers = [];
    if (_this.surveyData) {
      if (_this.resultid) {
        notify.notify('warn', strings.format('Survey {0} has already been saved.', _this.resultid), 7);
        cb();
        return;
      }

      _this.survey().questions.forEach(function(vm) {
        var result = vm.addAnswers(answers);
        // only store first error message
        if (!errMsg) {
          errMsg = result;
        }
      });
      //@TODO: allow for saving even if there are errors?????
      if (errMsg) {
        notify.notify('warn', errMsg, 7);
        cb();
        return;
      }

      dataservice.survey.results.save({
        data: {
          // ResultID: 0,
          SurveyTranslationId: _this.surveyData.surveyTranslation.SurveyTranslationID,
          Context: jsonhelpers.stringify(_this.dataContext), // stringified Context
          Answers: answers, // get all visible question answers
        },
      }, null, utils.safeCallback(function(err) {
        if (err) {
          notify.notify('error', err);
        }
        cb();
      }, function(err, resp) {
        _this.resultid = resp.Value.ResultID;
      }, function(err) {
        notify.notify('error', err.Message);
      }));
    }
  };

  function createSurvey(surveyData, paMap, tokenMap, data) {
    var survey, questions, ukovModel;

    ukovModel = ukov.wrap({}, {
      _model: true
    });

    questions = createTakeQuestions(
      ukovModel,
      surveyData.questions,
      paMap,
      surveyData.surveyType.questionMeanings,
      surveyData.surveyTranslation.questionTranslations,
      tokenMap,
      data,
      surveyData.resultAnswers
    );
    ukovModel.validate();
    ukovModel.update();

    survey = {
      version: surveyData.Version,
      locale: surveyData.surveyTranslation.LocalizationCode,
      questions: makeTree(questions),
      ukovModel: ukovModel,
    };

    return survey;
  }

  function createTakeQuestions(ukovModel, questions, paMap, meanings, translations, tokenMap, data, resultAnswers) {
    var getTokenValue,
      meaningMap = {},
      questionTokenValuesMap = {},
      questionHtmlMap = {},
      answerTextMap = {};

    getTokenValue = underscore.memoize(function(token) {
      var parts = token.split('.'),
        result;
      if (parts.length) {
        result = data;
        if (parts.some(function(part) {
          result = result[part];
          // break if part wasn't found in result
          return !result;
        })) {
          // broke loop early
          // ensure result is the default value
          result = undefined;
        }
      }
      return result;
    });

    meanings.forEach(function(qm) {
      meaningMap[qm.QuestionMeaningID] = qm;
    });
    questions.forEach(function(q) {
      var qm = meaningMap[q.QuestionMeaningId];
      questionTokenValuesMap[q.QuestionID] = qm.questionMeaningTokenMaps.map(function(qmTokenMap) {
        return getTokenValue(tokenMap[qmTokenMap.TokenId].Token);
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

    return questions.map(function(q) {
      q.questionPossibleAnswerMaps.forEach(function(qpa) {
        qpa.text = paMap[qpa.PossibleAnswerId].AnswerText;
      });

      var vm = new TakeQuestionViewModel({
        ukovModel: ukovModel,
        QuestionID: q.QuestionID,
        ParentId: q.ParentId,
        GroupOrder: q.GroupOrder,
        questionPossibleAnswerMaps: q.questionPossibleAnswerMaps,
        html: questionHtmlMap[q.QuestionID] || '<strong>[No Translation]</strong>',
        answerText: answerTextMap[q.QuestionID],
        readonly: !! resultAnswers,
      });

      return vm;
    });
  }

  function makeTree(questions, parent) {
    var childs = [];
    questions.forEach(function(vm) {
      if (parent && vm.ParentId !== parent.QuestionID) {
        return;
      }
      if (!parent && vm.ParentId != null) {
        return;
      }
      vm.parent(parent);
      childs.push(vm);
      // start recursion
      vm.questions = makeTree(questions, vm);
      vm.childs = vm.questions; // needed inorder to walk with treehelper
    });
    return childs;
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
