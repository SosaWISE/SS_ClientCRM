define('src/survey/takesurvey.vm', [
  'src/survey/surveyhelper',
  'underscore',
  'src/survey/tokens.vm',
  'src/survey/possibleanswers.vm',
  'src/survey/takequestion.vm',
  'ko',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  surveyhelper,
  underscore,
  TokensViewModel,
  PossibleAnswersViewModel,
  TakeQuestionViewModel,
  ko,
  dataservice,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function TakeSurveyViewModel(options) {
    var _this = this;
    TakeSurveyViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['tokenData']);

    _this.survey = ko.observable();

    _this.tokensVM = _this.tokensVM || new TokensViewModel();
    _this.possibleAnswersVM = _this.possibleAnswersVM || new PossibleAnswersViewModel();

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.layer) {
        _this.layer.close();
      }
    };
  }
  utils.inherits(TakeSurveyViewModel, ControllerViewModel);
  TakeSurveyViewModel.prototype.viewTmpl = 'tmpl-takesurvey';
  TakeSurveyViewModel.prototype.width = '90%';
  TakeSurveyViewModel.prototype.height = '90%';

  TakeSurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      id = parseInt(routeData.surveyid, 10),
      locale = routeData.locale,
      resultid = routeData.resultid,
      tempSurveyType, tempSurvey, tempResult;

    if (!id || !locale) {
      return join.add()({ // Code: ???,
        Message: 'missing or invalid route data values',
      });
    }

    loadSurveyType(id, function(val) {
      tempSurveyType = val;
    }, join);

    loadSurvey(id, locale, function(val) {
      tempSurvey = val;
    }, join);

    if (resultid) {
      loadResult(resultid, function(val) {
        tempResult = val;
      }, join);
    }

    // ensure tokens and PAs are loaded
    _this.tokensVM.load(routeData, extraData, join.add());
    _this.possibleAnswersVM.load(routeData, extraData, join.add());

    join.when(function(err) {
      if (err) {
        notify.notify('error', err.Message);
        return;
      }

      tempSurvey.surveyType = tempSurveyType;
      tempSurvey.surveyResult = tempResult;

      // console.log('tokens', JSON.stringify(_this.tokensVM.childs(), null, '  '));
      // console.log('surveyType', tempSurvey.surveyType);
      // console.log('survey', tempSurvey);
      // console.log('surveyType', JSON.stringify(tempSurvey.surveyType, null, '  '));
      // console.log('survey', JSON.stringify(tempSurvey, null, '  '));

      //
      _this.survey(createSurvey(tempSurvey, _this.possibleAnswersVM.paMap, _this.tokensVM.tokenMap, _this.tokenData));
    });
  };

  TakeSurveyViewModel.prototype.onActivate = function( /*routeCtx*/ ) { // overrides base
    // do nothing
  };

  function createSurvey(tempSurvey, paMap, tokenMap, data) {
    var survey, questions;

    questions = createTakeQuestions(
      tempSurvey.questions,
      paMap,
      tempSurvey.surveyType.questionMeanings,
      tempSurvey.surveyTranslation.questionTranslations,
      tokenMap,
      data,
      tempSurvey.surveyResult
    );

    survey = {
      version: tempSurvey.Version,
      locale: tempSurvey.surveyTranslation.LocalizationCode,
      questions: makeTree(questions),
    };

    return survey;
  }

  function createTakeQuestions(questions, paMap, meanings, translations, tokenMap, data, surveyResult) {
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

    if (surveyResult) {
      // answerTextMap
      surveyResult.Answers.forEach(function(answer) {
        answerTextMap[answer.QuestionId] = answer.AnswerText;
      });
    }

    return questions.map(function(q) {
      q.questionPossibleAnswerMaps.forEach(function(qpa) {
        qpa.text = paMap[qpa.PossibleAnswerId].AnswerText;
      });

      var vm = new TakeQuestionViewModel({
        QuestionID: q.QuestionID,
        ParentId: q.ParentId,
        GroupOrder: q.GroupOrder,
        questionPossibleAnswerMaps: q.questionPossibleAnswerMaps,
        html: questionHtmlMap[q.QuestionID] || '<strong>[No Translation]</strong>',
        answerText: answerTextMap[q.QuestionID],
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

  function loadResult(resultid, setter, join) {
    var cb = join.add();
    dataservice.survey.results.read({
      id: resultid
    }, setter, function(err, resp) {
      cb(err, resp);
    });
  }

  return TakeSurveyViewModel;
});
