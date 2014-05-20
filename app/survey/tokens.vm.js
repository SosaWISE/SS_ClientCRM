define('src/survey/tokens.vm', [
  'src/dataservice',
  'ko',
  'src/core/jsonhelpers',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  ko,
  jsonhelpers,
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
        // sort by Token value (ascending)
        resp.Value.sort(function(a, b) {
          var result = 0;
          if (a.Token > b.Token) {
            result = 1;
          }
          if (a.Token < b.Token) {
            result = -1;
          }
          return result;
        });
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

  // flatten and stringify context
  TokensViewModel.prototype.stringifyContext = function(dataContext) {
    var _this = this,
      compactObj = {},
      tokenNameMap = {};

    Object.keys(_this.tokenMap).forEach(function(id) {
      var token = _this.tokenMap[id];
      tokenNameMap[token.Token] = token;
    });

    (function recurse(obj, name) {
      if (typeof(obj) === 'object' && !Array.isArray(obj)) {
        // do recursion on object properties
        Object.keys(obj).forEach(function(propName) {
          var fullname = (name) ? (name + '.' + propName) : propName;
          recurse(obj[propName], fullname);
        });
      } else {
        // save leaf values
        var token = tokenNameMap[name];
        if (!token) {
          throw new Error('no token named `' + name + '`');
        }
        compactObj[token.TokenID] = obj;
      }
    })(dataContext, '');

    return jsonhelpers.stringify(compactObj);
  };
  // parse and unflatten context
  TokensViewModel.prototype.parseContext = function(str) {
    var _this = this,
      dataContext = {},
      compactObj = (utils.isStr(str)) ? jsonhelpers.parse(str) : str;

    Object.keys(compactObj).forEach(function(tokenID) {
      var token = _this.getToken(tokenID);
      if (!token) {
        throw new Error('no token with id `' + tokenID + '`');
      }
      walkToToken(dataContext, token.Token, compactObj[tokenID]);
    });

    return dataContext;
  };

  TokensViewModel.prototype.createTokenValueFunc = function(dataContext) {
    return function(token, valueToSet) {
      return walkToToken(dataContext, token, valueToSet);
    };
  };

  function walkToToken(dataContext, token, valueToSet) {
    var parts = token.split('.'),
      createMissing = arguments.length > 2,
      result;
    if (parts.length) {
      result = dataContext;
      parts.some(function(part, index) {
        if (result[part]) {
          result = result[part];
        } else if (createMissing) {
          if (index === parts.length - 1) {
            // set value
            result[part] = result = valueToSet;
          } else {
            // set object
            result[part] = result = {};
          }
        } else {
          // set result to the default value
          result = undefined;
        }
        // break if part wasn't found in result
        return !result;
      });
    }
    return result;
  }

  return TokensViewModel;
});
