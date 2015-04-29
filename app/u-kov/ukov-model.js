define('src/u-kov/ukov-model', [
  'ko',
], function(
  ko
) {
  "use strict";

  var alwaysClean = ko.computed({
    read: function() {
      return true;
    },
    // setting a value would throw an error if
    // this empty write fucntion weren't here
    write: function() {},
  });

  function UkovModel(updateParent, parentModel, doc, key) {
    var _this = this;
    _this.model = parentModel[key];
    if (!_this.model) {
      throw new Error('missing model for key: ' + key);
    }

    // excluded `_model` from enumerations
    delete doc._model;
    Object.defineProperty(doc, '_model', {
      value: true,
      configurable: true, // makes it so `delete doc._model` doesn't throw
    });

    _this.__ignore_updates__ = false;

    // ensure update always has the correct scope
    _this.update = _this.update.bind(_this);

    _this.updateParent = updateParent;
    _this.parentModel = parentModel;
    _this.doc = doc;
    _this.key = key;

    _this.isClean = doc.alwaysClean ? alwaysClean : ko.observable(true);
    _this.errMsg = ko.observable();
    _this.isValid = ko.computed(function() {
      return !_this.errMsg();
    }, _this);

    // setup each property on the model that is in the doc
    Object.keys(_this.doc).forEach(function(key) {
      // setup ukov item
      _this[key] = _this.createChild(key);
    }, _this);

    if (!_this.parentModel) {
      // start clean if we're the top model
      _this.markClean();
    }
  }
  UkovModel.prototype.updateStoredValue = function() {
    var _this = this;
    _this.parentModel[_this.key] = _this.model;
    return _this.model;
  };
  UkovModel.prototype.createChild = function( /*index, initialValue*/ ) {
    throw new Error('override me in ukov.js');
  };
  UkovModel.prototype.update = function(preventParentUpdate, drillDown) {
    var _this = this,
      item, isClean = true,
      errMsg;

    if (_this.__ignore_updates__) {
      return;
    }

    Object.keys(_this.doc).some(function(key) {
      item = _this[key];
      if (drillDown) {
        item.update(true, drillDown);
      }
      if (item.ignore()) {
        return;
      }

      // error
      if (!errMsg) {
        errMsg = item.errMsg();
      }
      // dirty
      if (isClean && !item.isClean()) {
        isClean = false;
      }
      // stop if errored and dirty
      return !isClean && errMsg;
    }, _this);

    _this.errMsg(errMsg);
    _this.isClean(isClean);

    if (!preventParentUpdate) {
      _this.updateParent();
    }

    // notify to one subscriber that we were updated
    if (typeof(_this._onUpdate) === 'function' || (_this._onUpdate instanceof Function)) {
      _this._onUpdate();
    }
  };
  UkovModel.prototype.subscribe = function(cb) {
    var _this = this;
    _this._onUpdate = cb;
  };
  UkovModel.prototype.validate = function() {
    var _this = this;
    Object.keys(_this.doc).forEach(function(key) {
      _this[key].validate();
    }, _this);
  };
  UkovModel.prototype.ignore = function(ignoreVal, allowParentUpdate) {
    var _this = this;
    if (arguments.length) {
      _this._ignore = !!ignoreVal;
      // set ignore on fields
      Object.keys(_this.doc).forEach(function(key) {
        _this[key].ignore(ignoreVal, false);
      });
      // update self
      _this.update(!allowParentUpdate && _this.parentModel);
    }
    return _this._ignore;
  };
  UkovModel.prototype.markClean = function(cleanVal, allowParentUpdate) {
    cleanVal = cleanVal || {};

    var _this = this;
    Object.keys(_this.doc).forEach(function(key) {
      _this[key].markClean(cleanVal[key]);
    }, _this);

    _this.update(!allowParentUpdate && _this.parentModel);
  };
  UkovModel.prototype.setValue = function(val) {
    val = val || {};

    var _this = this;
    _this.__ignore_updates__ = true;
    Object.keys(_this.doc).forEach(function(key) {
      if (val.hasOwnProperty(key)) {
        _this[key].setValue(val[key]);
      }
    }, _this);
    _this.__ignore_updates__ = false;
    _this.update(true);
  };

  UkovModel.prototype.getValue = function(onlyDirty, excludeIgnored) {
    var _this = this,
      result = {},
      prop;
    Object.keys(_this.doc).forEach(function(key) {
      prop = _this[key];
      if (!onlyDirty || !prop.isClean()) {
        if (!excludeIgnored || !prop.ignore()) {
          result[key] = prop.getValue();
        } else {
          // use null for ignored values
          result[key] = null;
        }
      }
    }, _this);
    return result;
  };
  UkovModel.prototype.getValue2 = function(excludeClean, includeIgnored) {
    var _this = this,
      result = {},
      prop;
    Object.keys(_this.doc).forEach(function(key) {
      prop = _this[key];
      if (excludeClean && prop.isClean()) {
        return;
      }
      if (!includeIgnored && prop.ignore()) {
        // // use null for ignored values
        // result[key] = null;
        return;
      }
      result[key] = prop.getValue();
    }, _this);
    return result;
  };
  UkovModel.prototype.getCleanValue = function(includeIgnored) {
    var _this = this,
      result = {},
      prop;
    Object.keys(_this.doc).forEach(function(key) {
      prop = _this[key];
      if (!includeIgnored && prop.ignore()) {
        // // use null for ignored values
        // result[key] = null;
        return;
      }
      result[key] = prop.getCleanValue();
    }, _this);
    return result;
  };
  UkovModel.prototype.reset = function(allowParentUpdate) {
    var _this = this;
    _this.__ignore_updates__ = true;
    Object.keys(_this.doc).forEach(function(key) {
      _this[key].reset();
    });
    _this.__ignore_updates__ = false;
    _this.update(!allowParentUpdate && _this.parentModel);
  };

  return UkovModel;
});
