define([
  'ko',
  './ukov-model',
  './ukov-prop'
], function(
  ko,
  UkovModel, // should be undefined since ukov-model requires this file
  ukovProp
) {
  "use strict";
  var fn = {},
    alwaysClean = ko.computed({
      read: function() {
        return true;
      },
      // setting a value would throw an error if
      // this empty write fucntion weren't here
      write: function() {},
    });

  function createUkovPropArray(updateParent, ukovModel, model, doc, key) {
    if (!doc[0]) {
      throw new Error('expected doc to be an array with atleast one item');
    }

    var prop, propItemArray = [];
    prop = ko.observableArray([]);
    ko.utils.extend(prop, fn);

    // ensure update always has the correct scope
    prop.update = prop.update.bind(prop);

    prop.updateParent = updateParent;
    prop.ukovModel = ukovModel;
    prop.model = model;
    prop.doc = doc[0];
    prop.docIsmodel = prop.doc._model; // save here since UkovModel will remove it from the doc
    prop.key = key;

    prop.isClean = doc.alwaysClean ? alwaysClean : ko.observable(true);
    prop.errMsg = ko.observable();
    prop.isValid = ko.computed(function() {
      return !prop.errMsg();
    });

    // add child props
    model.forEach(function(item, index) {
      propItemArray.push(prop.createChild(index));
    });
    prop(propItemArray);
    prop.cleanLength = prop().length;

    // get notified when the prop's value changes
    prop.subscribe(function updateUnderlyingArray(newValue) {
      // update underlying array length
      prop.model.length = newValue.length;
      // update each key and each value in underlying array
      newValue.forEach(function(item, index) {
        item.key = index;
        item.updateStoredValue();
      });
      prop.update();
    });

    return prop;
  }
  fn.updateStoredValue = function() {
    this.ukovModel.model[this.key] = this.model;
    return this.model;
  };
  fn.createChild = function(index, initialValue) {
    var prop, doc = this.doc,
      model = this.model;

    initialValue = (initialValue !== undefined) ? initialValue : model[index];
    if (this.docIsmodel) {
      // lazy require to circumvent circular dependency issues
      if (!UkovModel) {
        UkovModel = require('./ukov-model');
      }
      prop = new UkovModel(this.update, model, initialValue, doc, index);
    } else if (Array.isArray(doc)) {
      prop = createUkovPropArray(this.update, this.ukovModel, initialValue, doc, index);
    } else {
      prop = ukovProp.create(this.update, this.ukovModel, model, doc, index, initialValue);
    }
    return prop;
  };
  fn.update = function(preventParentUpdate) {
    var errMsg, isClean = this.cleanLength === this().length;
    this().forEach(function(item) {
      if (!errMsg) {
        // only use first error
        errMsg = item.errMsg();
      }
      // dirty
      if (isClean && !item.isClean()) {
        isClean = false;
      }
    }, this);

    this.errMsg(errMsg);
    this.isClean(isClean);

    if (!preventParentUpdate) {
      this.updateParent();
    }
  };
  fn.validate = function() {
    this().forEach(function(item) {
      item.validate();
    });
  };
  fn.markClean = function(cleanArray, allowParentUpdate) {
    var hasCleanArray = cleanArray !== undefined;
    if (hasCleanArray) {
      if (!Array.isArray(cleanArray)) {
        throw new Error('cleanArray must be an array');
      }
      this.cleanLength = cleanArray.length;
    } else {
      this.cleanLength = this().length;
    }
    this().forEach(function(item, index) {
      var cleanVal = hasCleanArray ? cleanArray[index] : undefined;
      if (cleanVal !== undefined) {
        item.markClean(cleanVal);
      }
    });

    this.update(!allowParentUpdate);
  };
  fn.setVal = function() {
    throw new Error('not implemented');
  };

  fn.getValue = function() {
    var result = [];
    this().forEach(function(item) {
      result.push(item.getValue());
    }, this);
    return result;
  };

  return {
    create: createUkovPropArray,
  };
});
