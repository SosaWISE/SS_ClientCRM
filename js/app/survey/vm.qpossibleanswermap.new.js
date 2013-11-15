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
    _this.paComboVM.setList(
      createComboList(_this.questionVM.possibleAnswerMaps(), _this.possibleAnswersVM.possibleAnswers()));
    _this.expandsComboVM = new ComboViewModel();
    _this.expandsComboVM.setList([
      {
        value: true,
        text: 'true',
      },
      {
        value: false,
        text: 'false',
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
      var selectedItem = _this.paComboVM.selectedItem();
      if (selectedItem === _this.paComboVM.noItemSelected) {
        notify.notify('warn', 'No possible answer selected', 10);
        return cb();
      }
      dataservice.survey.questionPossibleAnswerMaps.save({
        QuestionId: _this.questionVM.model.QuestionID,
        PossibleAnswerId: selectedItem.item.possibleAnswer.PossibleAnswerID,
        Expands: _this.expandsComboVM.selectedItem().item.value,
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
        } else {
          _this.questionVM.addPossibleAnswerMap(resp.Value);
          _this.layer.close();
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
