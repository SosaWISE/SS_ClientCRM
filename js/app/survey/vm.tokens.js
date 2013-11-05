define('src/survey/vm.tokens', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.controller',
], function(
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  function TokensViewModel(options) {
    var _this = this;
    TokensViewModel.super_.call(_this, options);

    _this.tokenMap = {};
  }
  utils.inherits(TokensViewModel, ControllerViewModel);

  TokensViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this;

    dataservice.survey.getTokens({}, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        resp.Value.forEach(function(token) {
          _this.tokenMap[token.TokenID] = token;
        });
        _this.list(resp.Value);
      }
      cb(false);
    });
  };

  TokensViewModel.prototype.getToken = function(tokenId) {
    var result = this.tokenMap[tokenId];
    if (!result) {
      console.error('no token for', tokenId);
    }
    return result;
  };

  return TokensViewModel;
});
