define('src/survey/qmtokenmap.new.vm', [
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

  function NewQMTokenMapViewModel(options) {
    var _this = this;
    NewQMTokenMapViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['questionMeaningVM', 'tokensVM']);

    _this.tokenComboVM = new ComboViewModel({
      list: createComboList(_this.questionMeaningVM.tokenMaps(), _this.tokensVM.list())
    });

    //
    // events
    //
    _this.clickCancel = function() {
      closeLayer(_this);
    };
    _this.cmdAdd = ko.command(function(cb) {
      var selectedValue = _this.tokenComboVM.selectedValue();
      if (!selectedValue) {
        notify.warn('No token selected', null, 10);
        return cb();
      }
      dataservice.survey.questionMeaningTokenMaps.save({
        data: {
          QuestionMeaningId: _this.questionMeaningVM.model.QuestionMeaningID,
          TokenId: selectedValue.TokenID,
          IsDeleted: false,
        },
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.questionMeaningVM.addTokenMap(resp.Value);
        _this.layerResult = resp.Value;
        closeLayer(_this);
      }, function(err) {
        notify.error(err);
      }));
    });
  }
  utils.inherits(NewQMTokenMapViewModel, BaseViewModel);
  NewQMTokenMapViewModel.prototype.viewTmpl = 'tmpl-qmtokenmap_new';
  NewQMTokenMapViewModel.prototype.width = 450;
  NewQMTokenMapViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  NewQMTokenMapViewModel.prototype.closeMsg = function() { // overrides base
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
      map[vm.model.TokenId] = true;
    });

    tokens.forEach(function(token) {
      // do not add used tokens
      if (map[token.TokenID]) {
        return;
      }
      result.push({
        value: token,
        text: token.Token,
      });
    });
    return result;
  }

  return NewQMTokenMapViewModel;
});
