define('src/survey/vm.qpossibleanswermap.new', [
  'src/dataservice',
  'ko',
  'src/core/vm.combo',
  'src/core/notify',
  'src/core/vm.base',
  'src/core/utils',
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
    BaseViewModel.ensureProps(_this, ['questionVM', 'possibleAnswersVM']);

    _this.paComboVM = new ComboViewModel({
      list: createComboList(_this.questionVM.possibleAnswerMaps(), _this.possibleAnswersVM.possibleAnswers())
    });
    _this.expandsComboVM = new ComboViewModel({
      list: [
        {
          value: true,
          text: 'true',
        },
        {
          value: false,
          text: 'false',
        }
      ]
    });
    _this.expandsComboVM.selectedValue(false);

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
      var possibleAnswer = _this.paComboVM.selectedValue();
      if (!possibleAnswer) {
        notify.notify('warn', 'No possible answer selected', 10);
        return cb();
      }
      dataservice.survey.questionPossibleAnswerMaps.save({
        QuestionId: _this.questionVM.model.QuestionID,
        PossibleAnswerId: possibleAnswer.PossibleAnswerID,
        Expands: _this.expandsComboVM.selectedValue(),
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
  NewQPossibleAnswerMapViewModel.prototype.width = 300;
  NewQPossibleAnswerMapViewModel.prototype.height = 250;

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
        value: pa,
        text: pa.AnswerText,
      });
    });
    return result;
  }

  return NewQPossibleAnswerMapViewModel;
});
