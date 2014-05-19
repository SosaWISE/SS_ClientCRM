define('src/survey/question.parent.v', [
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function QuestionParentViewModel(options) {
    var _this = this;
    QuestionParentViewModel.super_.call(_this, options);
    // ControllerViewModel.ensureProps(_this, ['surveyVM', 'possibleAnswersVM', 'questionMeaningVM']);
    ControllerViewModel.ensureProps(_this.model, ['childs']);

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
  utils.inherits(QuestionParentViewModel, ControllerViewModel);
  QuestionParentViewModel.prototype.viewTmpl = 'tmpl-question';

  QuestionParentViewModel.prototype.nextGroupOrder = function() {
    return this.questions().length + 1;
  };

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + index + '.';
  }

  return QuestionParentViewModel;
});
