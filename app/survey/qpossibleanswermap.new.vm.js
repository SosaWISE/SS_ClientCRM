define('src/survey/qpossibleanswermap.new.vm', [
  'src/dataservice',
  'ko',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
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
      list: [ //
        {
          value: true,
          text: 'true',
        }, {
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
      closeLayer(_this);
    };
    _this.cmdAdd = ko.command(function(cb) {
      var possibleAnswer = _this.paComboVM.selectedValue();
      if (!possibleAnswer) {
        notify.warn('No possible answer selected', null, 10);
        return cb();
      }
      dataservice.survey.questionPossibleAnswerMaps.save({
        data: {
          QuestionId: _this.questionVM.model.QuestionID,
          PossibleAnswerId: possibleAnswer.PossibleAnswerID,
          Expands: _this.expandsComboVM.selectedValue(),
        },
      }, null, function(err, resp) {
        if (err) {
          notify.error(err);
        } else {
          _this.questionVM.addPossibleAnswerMap(resp.Value);
          _this.layerResult = resp.Value;
          closeLayer(_this);
        }
        cb();
      });
    });
  }
  utils.inherits(NewQPossibleAnswerMapViewModel, BaseViewModel);
  NewQPossibleAnswerMapViewModel.prototype.viewTmpl = 'tmpl-qpossibleanswermap_new';
  NewQPossibleAnswerMapViewModel.prototype.width = 300;
  NewQPossibleAnswerMapViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  NewQPossibleAnswerMapViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdAdd.busy() && !_this.layerResult) {
      msg = 'Please wait for add to finish.';
    }
    return msg;
  };

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
