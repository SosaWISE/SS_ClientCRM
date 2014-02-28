define('src/survey/tokens.vm', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
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

    _this.list = _this.childs;
    _this.tokenMap = {};
  }
  utils.inherits(TokensViewModel, ControllerViewModel);

  TokensViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.tokens.read({}, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        resp.Value.forEach(function(token) {
          _this.tokenMap[token.TokenID] = token;
        });
        _this.list(resp.Value);
      } else {
        _this.list([]);
      }
    }, utils.no_op));
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
