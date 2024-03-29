define('src/u-kov/ukov-prop-array', [
  'ko',
], function(
  ko
) {
  "use strict";
  var fn = {},
    alwaysClean = ko.computed({
      read: function() {
        return true;
      },
      // setting a value would throw an error if
      // this empty write fucntion were not here
      write: function() {},
    });

  function createUkovPropArray(updateParent, ukovModel, model, doc, key) {
    if (!ukovModel || !model) {
      throw new Error('missing ukovModel or model for key: ' + key);
    }
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
  fn.createChild = function( /*index, initialValue*/ ) {
    throw new Error('override me in ukov.js');
  };
  fn.update = function(preventParentUpdate, drillDown) {
    var errMsg, isClean = this.cleanLength === this.peek().length;
    this.peek().forEach(function(item) {
      if (drillDown) {
        item.update(true, drillDown);
      }
      if (item.ignore()) {
        return;
      }

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
    this.peek().forEach(function(item) {
      item.validate();
    });
  };
  fn.ignore = function(ignoreVal, allowParentUpdate) {
    var _this = this;
    if (arguments.length) {
      if (ignoreVal) {
        _this._ignore = true;
      } else {
        delete _this._ignore;
      }
      // set ignore on items
      this.peek().forEach(function(item) {
        item.ignore(ignoreVal, false);
      });
      // update self
      _this.update(!allowParentUpdate);
    }
    return !!_this._ignore;
  };
  fn.markClean = function(cleanArray, allowParentUpdate) {
    var hasCleanArray = cleanArray !== undefined;
    if (hasCleanArray) {
      if (!Array.isArray(cleanArray)) {
        throw new Error('cleanArray must be an array');
      }
      this.cleanLength = cleanArray.length;
    } else {
      this.cleanLength = this.peek().length;
    }
    this.peek().forEach(function(item, index) {
      if (hasCleanArray) {
        var cleanVal = cleanArray[index];
        if (cleanVal !== undefined) {
          item.markClean(cleanVal);
        }
      } else {
        item.markClean();
      }
    });

    this.update(!allowParentUpdate);
  };
  fn.setValue = function(model) {
    var _this = this;
    _this.model = model;
    var propItemArray = model.map(function(item, index) {
      return _this.createChild(index);
    });
    _this(propItemArray);
    _this.update(true);
  };

  fn.getValue = function() {
    var result = [];
    this.peek().forEach(function(item) {
      result.push(item.getValue());
    }, this);
    return result;
  };
  fn.getCleanValue = function() {
    var result = [];
    this.peek().forEach(function(item) {
      result.push(item.getCleanValue());
    }, this);
    return result;
  };
  fn.reset = function(allowParentUpdate) {
    //@NOTE: this does not work when items have been removed/added
    this.peek().forEach(function(item) {
      item.reset();
    });
    this.update(!allowParentUpdate);
  };

  return {
    create: createUkovPropArray,
    fn: fn,
  };
});
