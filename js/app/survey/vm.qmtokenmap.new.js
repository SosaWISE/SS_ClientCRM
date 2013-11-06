define('src/survey/vm.qmtokenmap.new', [
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

  function NewQMTokenMapViewModel(options) {
    var _this = this;
    NewQMTokenMapViewModel.super_.call(_this, options);
    _this.ensureProps(['questionMeaningVM', 'tokensVM']);

    _this.tokenComboVM = new ComboViewModel();
    _this.tokenComboVM.setList(createComboList(_this.questionMeaningVM.tokens(), _this.tokensVM.list()));

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
      var selectedItem = _this.tokenComboVM.selectedItem();
      if (selectedItem === _this.tokenComboVM.noItemSelected) {
        notify.notify('warn', 'No token selected', 10);
        return cb();
      }
      dataservice.survey.saveQuestionMeaningTokenMap({
        QuestionMeaningId: _this.questionMeaningVM.model.QuestionMeaningID,
        TokenId: selectedItem.item.token.TokenID,
        IsDeleted: false,
      }, function(resp) {
        if (resp.Code !== 0) {
          notify.notify('error', resp.Message);
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
        token: token,
        text: token.Token,
      });
    });
    return result;
  }

  return NewQMTokenMapViewModel;
});
