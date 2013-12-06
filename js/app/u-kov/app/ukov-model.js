define('src/u-kov/app/ukov-model', [
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
    this.model = parentModel[key];
    if (!this.model) {
      throw new Error('missing model for key: ' + key);
    }

    // excluded `_model` from enumerations
    delete doc._model;
    Object.defineProperty(doc, '_model', {
      value: true,
      configurable: true, // makes it so `delete doc._model` doesn't throw
    });

    // ensure update always has the correct scope
    this.update = this.update.bind(this);

    this.updateParent = updateParent;
    this.parentModel = parentModel;
    this.doc = doc;
    this.key = key;

    this.isClean = doc.alwaysClean ? alwaysClean : ko.observable(true);
    this.errMsg = ko.observable();
    this.isValid = ko.computed(function() {
      return !this.errMsg();
    }, this);

    // setup each property on the model that is in the doc
    Object.keys(this.doc).forEach(function(key) {
      // setup ukov item
      this[key] = this.createChild(key);
    }, this);

    if (!this.parentModel) {
      // start clean if we're the top model
      this.markClean();
    }
  }
  UkovModel.prototype.updateStoredValue = function() {
    this.parentModel[this.key] = this.model;
    return this.model;
  };
  UkovModel.prototype.createChild = function( /*index, initialValue*/ ) {
    throw new Error('override me in ukov.js');
  };
  UkovModel.prototype.update = function(preventParentUpdate, drillDown) {
    var item, isClean = true,
      errMsg;
    Object.keys(this.doc).some(function(key) {
      item = this[key];
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
    }, this);

    this.errMsg(errMsg);
    this.isClean(isClean);

    if (!preventParentUpdate) {
      this.updateParent();
    }
  };
  UkovModel.prototype.validate = function() {
    Object.keys(this.doc).forEach(function(key) {
      this[key].validate();
    }, this);
  };
  UkovModel.prototype.ignore = function(ignoreVal, allowParentUpdate) {
    var _this = this;
    if (arguments.length) {
      if (ignoreVal) {
        _this._ignore = true;
      } else {
        delete _this._ignore;
      }
      _this.update(!allowParentUpdate && _this.parentModel);
    }
    return !!_this._ignore;
  };
  UkovModel.prototype.markClean = function(cleanVal, allowParentUpdate) {
    cleanVal = cleanVal || {};

    Object.keys(this.doc).forEach(function(key) {
      this[key].markClean(cleanVal[key]);
    }, this);

    this.update(!allowParentUpdate && this.parentModel);
  };
  UkovModel.prototype.setVal = function(val) {
    val = val || {};

    Object.keys(this.doc).forEach(function(key) {
      if (val.hasOwnProperty(key)) {
        this[key].setVal(val[key]);
      }
    }, this);

    this.update(true);
  };

  UkovModel.prototype.getValue = function(onlyDirty) {
    var result = {}, prop;
    Object.keys(this.doc).forEach(function(key) {
      prop = this[key];
      if (!onlyDirty || !prop.isClean()) {
        result[key] = prop.getValue();
      }
    }, this);
    return result;
  };

  return UkovModel;
});
