define('src/survey/qpossibleanswermap.new.vm', [
  'src/dataservice',
  'src/ukov',
  'ko',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  dataservice,
  ukov,
  ko,
  ComboViewModel,
  notify,
  BaseViewModel,
  utils
) {
  'use strict';

  var schema;

  schema = {
    _model: true,

    QuestionId: {},
    PossibleAnswerId: {
      validators: [
        ukov.validators.isRequired('Please select a Possible Answer'),
      ],
    },
    Expands: {},
    Fails: {},
  };

  function NewQPossibleAnswerMapViewModel(options) {
    var _this = this;
    NewQPossibleAnswerMapViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['questionVM', 'possibleAnswersVM']);

    _this.data = ukov.wrap(_this.item || {
      QuestionId: _this.questionVM.model.QuestionID,
      PossibleAnswerId: null,
      Expands: false,
      Fails: false,
    }, schema);

    _this.data.PossibleAnswerCvm = new ComboViewModel({
      selectedValue: _this.data.PossibleAnswerId,
      list: createComboList(_this.questionVM.possibleAnswerMaps(), _this.possibleAnswersVM.possibleAnswers(), _this.data.PossibleAnswerId.peek())
    });
    _this.data.ExpandsCvm = new ComboViewModel({
      selectedValue: _this.data.Expands,
      list: _this.yesNoOptions,
    });
    _this.data.FailsCvm = new ComboViewModel({
      selectedValue: _this.data.Fails,
      list: _this.yesNoOptions,
    });

    //
    // events
    //
    _this.clickCancel = function() {
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 10);
        return cb();
      }
      var model = _this.data.getValue();
      dataservice.survey.questionPossibleAnswerMaps.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (!_this.item) {
          // added new item
          _this.questionVM.addPossibleAnswerMap(resp.Value);
        }
        _this.layerResult = resp.Value;
        closeLayer(_this);
      }, notify.error));
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
  NewQPossibleAnswerMapViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  NewQPossibleAnswerMapViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = 'Please wait for save to finish.';
    }
    return msg;
  };

  function createComboList(possibleAnswerMaps, possibleAnswers, currentPossibleAnswerId) {
    var map, result = [];

    if (currentPossibleAnswerId) {
      // only add the current id
      possibleAnswers.some(function(pa) {
        if (pa.PossibleAnswerID === currentPossibleAnswerId) {
          result.push({
            value: pa.PossibleAnswerID,
            text: pa.AnswerText,
          });
          return true;
        }
      });
    } else {
      map = {};
      possibleAnswerMaps.forEach(function(vm) {
        map[vm.model.PossibleAnswerId] = true;
      });

      possibleAnswers.forEach(function(pa) {
        // don't add used possibleAnswers
        if (map[pa.PossibleAnswerID]) {
          return;
        }
        result.push({
          value: pa.PossibleAnswerID,
          text: pa.AnswerText,
        });
      });
    }

    //
    return result;
  }

  return NewQPossibleAnswerMapViewModel;
});
