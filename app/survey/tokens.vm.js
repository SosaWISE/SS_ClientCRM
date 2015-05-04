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
  TokensViewModel.prototype.getTokenByName = function(tokenName) {
    var _this = this,
      result;
    _this.list.peek().some(function(item) {
      if (item.Token === tokenName) {
        result = item;
        return true;
      }
    });
    if (!result) {
      console.error('no token for', tokenName);
    }
    return result;
  };


  // flatten context
  TokensViewModel.prototype.deflateContext = function(dataContext) {
    var _this = this,
      compactObj = {},
      tokenNameMap = createTokenNameMap(_this.tokenMap);

    (function recurse(obj, name) {
      if (obj && typeof(obj) === 'object' && !Array.isArray(obj)) {
        // do recursion on object properties
        Object.keys(obj).forEach(function(propName) {
          var fullname = (name) ? (name + '.' + propName) : propName;
          recurse(obj[propName], fullname);
        });
      } else {
        // save leaf values
        var token = tokenNameMap[name];
        // silently exclude unknown token
        if (token) {
          compactObj[token.TokenID] = obj;
        } else {
          // throw new Error('no token named `' + name + '`');
        }
      }
    })(dataContext, '');

    return compactObj;
  };
  // flatten and stringify context
  TokensViewModel.prototype.stringifyContext = function(dataContext, isFlat) {
    var _this = this,
      compactObj;
    if (isFlat) {
      // test that the context is actually flat
      flatTest(dataContext);
      compactObj = dataContext;
    } else {
      compactObj = _this.deflateContext(dataContext);
    }
    return jsonhelpers.stringify(compactObj);
  };
  // inflate flattened dataContext
  TokensViewModel.prototype.inflateContext = function(flatContext) {
    var _this = this,
      dataContext = {};

    Object.keys(flatContext).forEach(function(tokenID) {
      var token = _this.getToken(tokenID);
      if (!token) {
        throw new Error('no token with id `' + tokenID + '`');
      }
      walkToToken(dataContext, token.Token, flatContext[tokenID]);
    });

    return dataContext;
  };
  // parse and unflatten context
  TokensViewModel.prototype.parseContext = function(str) {
    var _this = this,
      compactObj = (utils.isStr(str)) ? jsonhelpers.parse(str) : str;

    return _this.inflateContext(compactObj);
  };

  TokensViewModel.prototype.createTokenValueFunc = function(dataContext, isFlat) {
    var _this = this,
      tokenNameMap = createTokenNameMap(_this.tokenMap);

    function func(tokenName, valueToSet) {
      var tokenObj = tokenNameMap[tokenName];
      if (!tokenObj) {
        // only do something if it is a valid token
        return;
      }
      if (isFlat) {
        return flatWalkToToken(dataContext, tokenObj.TokenID, valueToSet);
      } else {
        return walkToToken(dataContext, tokenObj.Token, valueToSet);
      }
    }

    if (isFlat) {
      flatTest(dataContext);
    }
    return func;
  };

  function createTokenNameMap(tokenMap) {
    var tokenNameMap = {};
    Object.keys(tokenMap).forEach(function(id) {
      var token = tokenMap[id];
      tokenNameMap[token.Token] = token;
    });
    return tokenNameMap;
  }

  function flatWalkToToken(flatContext, tokenId, valueToSet) {
    var createMissing = arguments.length > 2,
      result;
    if (tokenId) {
      if (flatContext[tokenId]) {
        result = flatContext[tokenId];
      } else if (createMissing) {
        flatContext[tokenId] = result = valueToSet;
      } else {
        // set result to the default value
        result = undefined;
      }
    }
    return result;
  }

  function walkToToken(dataContext, tokenName, valueToSet) {
    var parts = tokenName.split('.'),
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
        // break if part was not found in result
        return !result;
      });
    }
    return result;
  }

  function flatTest(dataContext) {
    Object.keys(dataContext).forEach(function(key) {
      /* jshint eqeqeq:false */
      // test for all number keys
      if (parseInt(key, 10) != key) {
        throw new Error('Invalid flat dataContext: property names must be integers');
      }
      // test for nesting
      var obj = dataContext[key];
      if (obj && typeof(obj) === 'object' && !Array.isArray(obj)) {
        throw new Error('Invalid flat dataContext: objects cannot be nested');
      }
    });
  }

  return TokensViewModel;
});
