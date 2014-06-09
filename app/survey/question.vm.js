define('src/survey/question.vm', [
  'src/survey/qpossibleanswermap.vm',
  'src/dataservice',
  'ko',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/survey/questions.parent.vm', //'src/core/controller.vm',
], function(
  QPossibleAnswerMapViewModel,
  dataservice,
  ko,
  strings,
  notify,
  utils,
  QuestionsParentViewModel
) {
  'use strict';

  function QuestionViewModel(options) {
    var _this = this;
    QuestionViewModel.super_.call(_this, options);
    _this.surveyVM = _this.topVm;
    QuestionsParentViewModel.ensureProps(_this, ['topVm', 'possibleAnswersVM', 'questionMeaningVM']);
    QuestionsParentViewModel.ensureProps(_this.model, ['childs']);

    _this.id = _this.model.QuestionID;
    _this.possibleAnswerMaps = _this.childs;

    // computed observables
    _this.translations = ko.computed(_this.computeTranslations, _this);
    _this.noAddSubQuestion = ko.computed(function() {
      return !_this.possibleAnswerMaps().length;
    });

    // observables
    _this.conditionText = ko.observable(calcConditionText(_this));
    _this.mapToTokenName = ko.observable(getMapToTokenName(_this));
  }
  utils.inherits(QuestionViewModel, QuestionsParentViewModel);
  QuestionViewModel.prototype.viewTmpl = 'tmpl-question';
  QuestionViewModel.prototype.show = true;

  QuestionViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.questions.read({
      id: _this.id,
      link: 'questionPossibleAnswerMaps',
    }, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      if (resp.Value) {
        var list = resp.Value.map(function(item) {
          return createPossibleAnswerMap(_this.possibleAnswersVM, item);
        });
        _this.possibleAnswerMaps(list);
      } else {
        _this.possibleAnswerMaps([]);
      }
      cb();
    });
  };

  QuestionViewModel.prototype.computeTranslations = function() {
    var _this = this,
      results = [];
    _this.topVm.translations().forEach(function(surveyTranslationVM) {
      // update whenever list changes
      surveyTranslationVM.list();
      // get vm
      var vm = surveyTranslationVM.getQuestionTranslationVM(_this);
      if (vm) {
        results.push(vm);
      }
    });
    return results;
  };

  QuestionViewModel.prototype.addPossibleAnswerMap = function(model) {
    var _this = this;
    _this.possibleAnswerMaps.push(createPossibleAnswerMap(_this.possibleAnswersVM, model));
  };

  QuestionViewModel.prototype.addQuestion = function(topVm, model, parent, cb) {
    var _this = this,
      vm;
    model.childs = model.childs || [];
    vm = new QuestionViewModel({
      topVm: topVm,
      possibleAnswersVM: topVm.possibleAnswersVM,
      questionMeaningVM: topVm.surveyTypeVM.getQuestionMeaning(model.QuestionMeaningId),
      model: model,
      parent: parent,
    });

    // make sure it is loaded
    vm.load({}, null, function(errResp) {
      if (utils.isFunc(cb)) {
        cb(errResp);
      }
      if (errResp) {
        return notify.notify('error', 'Error', errResp.Message);
      }
    });
    // add to list
    _this.questions.push(vm);
    _this.updateChildNames();
    return vm;
  };

  // function getName(parent, index) {
  //   var pName = parent ? parent.name() : '';
  //   return pName + index + '.';
  // }

  function createPossibleAnswerMap(possibleAnswersVM, model) {
    return new QPossibleAnswerMapViewModel({
      possibleAnswersVM: possibleAnswersVM,
      model: model,
    });
  }

  function calcConditionText(_this) {
    var json = _this.model.ConditionJson;
    if (!json || !json.TokenId || !json.Comparison) {
      return 'none';
    } else {
      return strings.format('({0} {1} \'{2}\')', _this.topVm.tokensVM.getToken(json.TokenId).Token, json.Comparison, json.Value);
    }
  }

  function getMapToTokenName(_this) {
    var tokenId = _this.model.MapToTokenId;
    if (!tokenId) {
      return 'none';
    } else {
      return _this.topVm.tokensVM.getToken(tokenId).Token;
    }
  }

  return QuestionViewModel;
});
