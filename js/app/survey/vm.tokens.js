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

    _this.list = _this.childs;

    _this.tokenMap = {};
  }
  utils.inherits(TokensViewModel, ControllerViewModel);

  TokensViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.tokens.read({}, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      resp.Value.forEach(function(token) {
        _this.tokenMap[token.TokenID] = token;
      });
      _this.list(resp.Value);
      cb();
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
