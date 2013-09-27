define([
  'ko',
  './ukov-prop',
  './ukov-prop-array'
], function(
  ko,
  ukovProp,
  ukovPropArray
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

  function UkovModel(updateParent, parentModel, model, doc, key) {
    if (!model) {
      throw new Error('missing model for key: ' + key);
    }

    // _model is no longer needed
    delete doc._model;

    // ensure update always has the correct scope
    this.update = this.update.bind(this);

    this.updateParent = updateParent;
    this.parentModel = parentModel;
    this.model = model;
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
  UkovModel.prototype.createChild = function(key, initialValue) {
    var prop, doc = this.doc[key],
      model = this.model;

    if (!model.hasOwnProperty(key)) {
      // console.log('property `' + key + '` not on model. adding...');
      // add property since it doesn't exist
      if (doc._model) {
        model[key] = {};
      } else if (Array.isArray(doc)) {
        model[key] = [];
      } else {
        model[key] = null;
      }
    }

    initialValue = (initialValue !== undefined) ? initialValue : model[key];
    if (doc._model) {
      prop = new UkovModel(this.update, model, initialValue, doc, key);
    } else if (Array.isArray(doc)) {
      prop = ukovPropArray.create(this.update, this, initialValue, doc, key);
    } else {
      prop = ukovProp.create(this.update, this, model, doc, key, initialValue);
    }
    return prop;
  };
  UkovModel.prototype.update = function(preventParentUpdate) {
    var prop, isClean = true,
      errMsg;
    Object.keys(this.doc).some(function(key) {
      prop = this[key];
      // error
      if (!errMsg) {
        errMsg = prop.errMsg();
      }
      // dirty
      if (isClean && !prop.isClean()) {
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
