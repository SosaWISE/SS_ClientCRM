define('src/survey/vm.question.new', [
  'src/dataservice',
  'ko',
  'src/vm.combo',
  'src/survey/vm.questionmeaning.new',
  'src/core/notify',
  'src/core/vm.base',
  'src/util/utils',
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
    _this.ensureProps(['surveyVM', 'surveyTypeVM']);

    _this.qmComboVM = new ComboViewModel();
    _this.qmComboVM.setList(createComboList(_this.surveyVM, _this.surveyTypeVM.questionMeanings()));
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
      var selectedItem = _this.qmComboVM.selectedItem();
      if (selectedItem === _this.qmComboVM.noItemSelected) {
        notify.notify('warn', 'No question meaning selected', 10);
        return cb();
      }
      dataservice.survey.questions.save({
        SurveyId: _this.surveyVM.model.SurveyID,
        QuestionMeaningId: selectedItem.item.vm.model.QuestionMeaningID,
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
        vm: _this.surveyTypeVM.addQuestionMeaning(model),
        text: model.Name,
      });
      _this.qmComboVM.selectItem(item);
    });
  };

  function createComboList(surveyVM, allQuestionMeanings) {
    var map = {},
      result = [];

    (function addToMap(questions) {
      questions.forEach(function(vm) {
        map[vm.model.QuestionMeaningId] = true;
        // start recursion
        addToMap(vm.questions());
      });
    })(surveyVM.questions());

    allQuestionMeanings.forEach(function(vm) {
      // don't add used tokens
      if (map[vm.model.QuestionMeaningID]) {
        return;
      }
      result.push({
        vm: vm,
        text: vm.model.Name,
      });
    });
    return result;
  }

  return NewQuestionViewModel;
});
