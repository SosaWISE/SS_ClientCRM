define('src/survey/vm.question', [
  'src/survey/vm.qpossibleanswermap',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
], function(
  QPossibleAnswerMapViewModel,
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function QuestionViewModel(options) {
    var _this = this;
    QuestionViewModel.super_.call(_this, options);
    _this.ensureProps(['surveyVM', 'possibleAnswersVM', 'questionMeaningVM']);
    _this.ensureProps.call(_this.model, ['childs']);

    _this.id = _this.model.QuestionID;
    _this.possibleAnswerMaps = _this.childs;

    // observables
    _this.parent = ko.observable(_this.parent);
    _this.questions = ko.observableArray(_this.model.childs);
    _this.groupOrder = ko.observable(_this.model.GroupOrder);
    // computed observables
    _this.translations = ko.computed(_this.computeTranslations, _this);
    _this.name = ko.computed(function() {
      return getName(_this.parent(), _this.groupOrder());
    });
    _this.nextName = ko.computed(function() { // next child name
      return getName(_this, _this.nextGroupOrder());
    });
    _this.noAddSubQuestion = ko.computed(function() {
      return !_this.possibleAnswerMaps().length;
    });
  }
  utils.inherits(QuestionViewModel, ControllerViewModel);
  QuestionViewModel.prototype.viewTmpl = 'tmpl-question';

  QuestionViewModel.prototype.onLoad = function(routeData, join) { // overrides base
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
    _this.surveyVM.translations().forEach(function(surveyTranslationVM) {
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

  QuestionViewModel.prototype.nextGroupOrder = function() {
    return this.questions().length + 1;
  };

  QuestionViewModel.prototype.addPossibleAnswerMap = function(model) {
    var _this = this;
    _this.possibleAnswerMaps.push(createPossibleAnswerMap(_this.possibleAnswersVM, model));
  };

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + index + '.';
  }

  function createPossibleAnswerMap(possibleAnswersVM, model) {
    return new QPossibleAnswerMapViewModel({
      possibleAnswersVM: possibleAnswersVM,
      model: model,
    });
  }

  return QuestionViewModel;
});
