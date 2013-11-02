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
    var _this = this,
      list = [];
    NewQuestionViewModel.super_.call(_this, options);
    if (!_this.surveyVM) {
      throw new Error('missing surveyVM');
    }
    if (!_this.surveyTypeVM) {
      throw new Error('missing surveyTypeVM');
    }

    _this.saving = ko.observable(false);

    _this.surveyTypeVM.questionMeanings().forEach(function(vm) {
      //@TODO: don't add used meanings
      list.push({
        vm: vm,
        text: vm.model.Name,
      });
    });

    _this.qmComboVM = new ComboViewModel();
    _this.qmComboVM.setList(list);
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
      if (_this.saving()) {
        return;
      }
      _this.layer.close(false);
    };
    _this.clickAdd = function() {
      if (_this.saving()) {
        return;
      }
      var selectedItem = _this.qmComboVM.selectedItem();
      if (!selectedItem) {
        notify.notify('warn', 'No question meaning selected', 10);
        return;
      }
      _this.saving(true);
      dataservice.survey.saveQuestion({
        SurveyId: _this.surveyVM.model.SurveyID,
        QuestionMeaningId: selectedItem.item.vm.model.QuestionMeaningID,
        ParentId: (_this.parent) ? _this.parent.model.QuestionID : null,
        GroupOrder: _this.groupOrder,
        MapToTokenId: null,
      }, function(resp) {
        _this.saving(false);
        if (resp.Code !== 0) {
          notify.notify('error', resp.Message);
        } else {
          _this.layer.close(resp.Value);
        }
      });
    };
  }
  utils.inherits(NewQuestionViewModel, BaseViewModel);
  NewQuestionViewModel.prototype.viewTmpl = 'tmpl-question_new';

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

  return NewQuestionViewModel;
});
