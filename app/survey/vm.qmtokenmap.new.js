define('src/survey/vm.qmtokenmap.new', [
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

  function NewQMTokenMapViewModel(options) {
    var _this = this;
    NewQMTokenMapViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(this, ['questionMeaningVM', 'tokensVM']);

    _this.tokenComboVM = new ComboViewModel({
      list: createComboList(_this.questionMeaningVM.tokenMaps(), _this.tokensVM.list())
    });

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
      var selectedValue = _this.tokenComboVM.selectedValue();
      if (!selectedValue) {
        notify.notify('warn', 'No token selected', 10);
        return cb();
      }
      dataservice.survey.questionMeaningTokenMaps.save({
        QuestionMeaningId: _this.questionMeaningVM.model.QuestionMeaningID,
        TokenId: selectedValue.TokenID,
        IsDeleted: false,
      }, null, function(err, resp) {
        if (err) {
          notify.notify('error', err.Message);
        } else {
          _this.questionMeaningVM.addTokenMap(resp.Value);
          _this.layer.close();
        }
        cb();
      });
    });
  }
  utils.inherits(NewQMTokenMapViewModel, BaseViewModel);
  NewQMTokenMapViewModel.prototype.viewTmpl = 'tmpl-qmtokenmap_new';
  NewQMTokenMapViewModel.prototype.width = 300;
  NewQMTokenMapViewModel.prototype.height = 250;

  function createComboList(tokenMaps, tokens) {
    var map = {},
      result = [];

    tokenMaps.forEach(function(vm) {
      map[vm.model.TokenId] = true;
    });

    tokens.forEach(function(token) {
      // don't add used tokens
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
