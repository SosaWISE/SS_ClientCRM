define('src/survey/questions.parent.vm', [
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

  function QuestionsParentViewModel(options) {
    var _this = this;
    QuestionsParentViewModel.super_.call(_this, options);

    if (!_this.topVm && !!_this.model.SurveyID) {
      _this.topVm = _this;
    }
    QuestionsParentViewModel.ensureProps(_this, ['topVm']);

    // observables
    _this.parent = ko.observable(_this.parent);
    _this.questions = ko.observableArray((_this === _this.topVm) ? null : _this.model.childs);
    _this.groupOrder = ko.observable((_this === _this.topVm) ? null : _this.model.GroupOrder);
    // computed observables
    _this.name = ko.observable('');
    if (_this.parent()) {
      // update child names whenever our parent's name changes
      _this.parent().name.subscribe(_this.updateChildNames, _this);
    }
    // _this.name = ko.computed({
    //   deferEvaluation: true,
    //   read: _this.computeName,
    // }, _this);
    _this.nextName = ko.computed({
      deferEvaluation: true,
      read: _this.computeNextName,
    }, _this);
  }
  utils.inherits(QuestionsParentViewModel, ControllerViewModel);
  QuestionsParentViewModel.ensureProps = ControllerViewModel.ensureProps;

  // QuestionsParentViewModel.prototype.computeName = function() {
  //   return getName(this.parent(), this.groupOrder());
  // };
  QuestionsParentViewModel.prototype.computeNextName = function() {
    return getName(this, this.nextGroupOrder());
  };
  QuestionsParentViewModel.prototype.nextGroupOrder = function() {
    return this.questions().length + 1;
  };


  QuestionsParentViewModel.prototype.addQuestion = function() { //surveyVM, model, parent, cb) {
    throw new Error('not implemented');
  };
  QuestionsParentViewModel.prototype.updateChildNames = function() {
    var _this = this,
      questions = _this.questions(),
      num = 1;
    questions.forEach(function(q) {
      q.name(getName(_this, num));
      if (q.show) {
        num++;
      }
    });
  };


  function getName(parent, num) {
    if (!num) {
      return '';
    }
    var pName = parent ? parent.name() : '';
    return pName + num + '.';
  }
  QuestionsParentViewModel.getName = getName;

  return QuestionsParentViewModel;
});
