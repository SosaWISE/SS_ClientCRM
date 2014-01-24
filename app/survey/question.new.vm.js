define('src/survey/question.new.vm', [
  'src/dataservice',
  'ko',
  'src/core/combo.vm',
  'src/survey/questionmeaning.new.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  dataservice,
  ko,
  ComboViewModel,
  NewQuestionMeaningViewModel,
  notify,
  BaseViewModel,
  utils
) {
  'use strict';

  function NewQuestionViewModel(options) {
    var _this = this;
    NewQuestionViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['surveyVM', 'surveyTypeVM']);

    _this.qmComboVM = new ComboViewModel({
      list: createComboList(_this.surveyVM, _this.surveyTypeVM.questionMeanings())
    });
    _this.qmComboVM.actions([
      {
        text: 'Add New Meaning',
        onClick: _this.showAddNewMeaning.bind(_this),
      }
    ]);

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.cmdAdd.busy()) {
        return;
      }
      _this.layer.close();
    };
    _this.cmdAdd = ko.command(function(cb) {
      var selectedValue = _this.qmComboVM.selectedValue();
      if (!selectedValue) {
        notify.notify('warn', 'No question meaning selected', 10);
        return cb();
      }
      dataservice.survey.questions.save({
        SurveyId: _this.surveyVM.model.SurveyID,
        QuestionMeaningId: selectedValue.model.QuestionMeaningID,
        ParentId: (_this.parent) ? _this.parent.model.QuestionID : null,
        GroupOrder: _this.groupOrder,
        MapToTokenId: null,
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
        } else {
          _this.layer.close(resp.Value);
        }
        cb();
      });
    });
  }
  utils.inherits(NewQuestionViewModel, BaseViewModel);
  NewQuestionViewModel.prototype.viewTmpl = 'tmpl-question_new';
  NewQuestionViewModel.prototype.width = 300;
  NewQuestionViewModel.prototype.height = 250;

  NewQuestionViewModel.prototype.showAddNewMeaning = function(filterText) {
    var _this = this,
      vm = new NewQuestionMeaningViewModel({
        surveyTypeVM: _this.surveyTypeVM,
        name: filterText,
      });
    _this.layersVM.show(vm, function(model) {
      if (!model) {
        return;
      }
      var item = _this.qmComboVM.addItem({
        value: _this.surveyTypeVM.addQuestionMeaning(model),
        text: model.Name,
      });
      _this.qmComboVM.selectItem(item);
    });
  };

  function createComboList(surveyVM, allQuestionMeanings) {
    var map = {},
      result = [];

    // ** Build a map of existing questions
    (function addToMap(questions) {
      questions.forEach(function(vm) {
        map[vm.model.QuestionMeaningId] = true;
        // start recursion
        addToMap(vm.questions());
      });
    })(surveyVM.questions());

    // ** loop through each question and only add the ones that do not exists.
    allQuestionMeanings.forEach(function(vm) {
      // don't add used tokens
      if (map[vm.model.QuestionMeaningID]) {
        return;
      }
      result.push({
        value: vm,
        text: vm.model.Name,
      });
    });
    return result;
  }

  return NewQuestionViewModel;
});
