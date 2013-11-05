define('src/survey/vm.qpossibleanswermap.new', [
  'src/dataservice',
  'ko',
  'src/vm.combo',
  'src/core/notify',
  'src/core/vm.base',
  'src/util/utils',
], function(
  dataservice,
  ko,
  ComboViewModel,
  notify,
  BaseViewModel,
  utils
) {
  'use strict';

  function NewQPossibleAnswerMapViewModel(options) {
    var _this = this;
    NewQPossibleAnswerMapViewModel.super_.call(_this, options);
    _this.ensureProps(['questionVM', 'possibleAnswersVM']);

    _this.paComboVM = new ComboViewModel();
    _this.paComboVM.setList(createComboList(_this.questionVM.list(), _this.possibleAnswersVM.list()));

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.cmdAdd.busy()) {
        return;
      }
      _this.layer.close(false);
    };
    _this.cmdAdd = ko.command(function(cb) {
      var selectedItem = _this.paComboVM.selectedItem();
      if (selectedItem === _this.paComboVM.noItemSelected) {
        notify.notify('warn', 'No possible answer selected', 10);
        return cb();
      }
      dataservice.survey.saveQuestionPossibleAnswerMap({
        QuestionId: _this.questionVM.model.QuestionID,
        PossibleAnswerId: selectedItem.item.possibleAnswer.PossibleAnswerID,
        IsDeleted: false,
      }, function(resp) {
        if (resp.Code !== 0) {
          notify.notify('error', resp.Message);
        } else {
          _this.questionVM.addPossibleAnswerMap(resp.Value);
          _this.layer.close(); //resp.Value);
        }
        cb();
      });
    });
  }
  utils.inherits(NewQPossibleAnswerMapViewModel, BaseViewModel);
  NewQPossibleAnswerMapViewModel.prototype.viewTmpl = 'tmpl-qpossibleanswermap_new';

  function createComboList(tokenMaps, tokens) {
    var map = {},
      result = [];

    tokenMaps.forEach(function(vm) {
      map[vm.model.PossibleAnswerId] = true;
    });

    tokens.forEach(function(pa) {
      // don't add used possibleAnswers
      if (map[pa.PossibleAnswerID]) {
        return;
      }
      result.push({
        possibleAnswer: pa,
        text: pa.AnswerText,
      });
    });
    return result;
  }

  return NewQPossibleAnswerMapViewModel;
});
