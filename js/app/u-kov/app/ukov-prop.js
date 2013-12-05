define('src/u-kov/app/ukov-prop', [
  'ko'
], function(
  ko
) {
  "use strict";

  var fn = {}, count = 0,
    alwaysClean = ko.computed({
      read: function() {
        return true;
      },
      // setting a value would throw an error if
      // this empty write fucntion weren't here
      write: function() {},
    });

  function createUkovProp(updateParent, ukovModel, model, doc, key) { //, initialValue) {
    if (!ukovModel || !model) {
      throw new Error('missing ukovModel or model for key: ' + key);
    }
    var prop = ko.observable(null),
      currVal;
    ko.utils.extend(prop, fn);

    prop.uid = 'prop' + (++count);

    prop.updateParent = updateParent;
    prop.ukovModel = ukovModel;
    prop.model = model;
    prop.doc = doc;
    prop.key = key;

    prop.isClean = doc.alwaysClean ? alwaysClean : ko.observable(true);
    prop.cleanVal = ko.observable(model.length);
    prop.errMsg = ko.observable();
    prop.isValid = ko.computed(function() {
      return !prop.errMsg();
    });

    // set to current value
    currVal = prop.getValue();
    if (prop.doc.stringify) {
      prop(currVal == null ? currVal : currVal + '');
    } else {
      prop(currVal);
    }
    prop.updateStoredValue();
    prop.markClean();

    // get notified when the prop's value changes
    prop.subscribe(function propValueChanged() {
      // set underlying store value
      var newValue = prop.updateStoredValue();
      // validate
      prop.validate();
      // set dirty state
      prop.isClean(prop.cleanVal() === newValue);
      // update model state
      updateParent();
    });

    return prop;
  }
  fn.updateStoredValue = function() {
    var val = this.peek(),
      converter = this.doc.converter;
    if (converter && typeof(val) === 'string') {
      val = converter(val);
    }
    this.model[this.key] = val;
    return val;
  };
  fn.getValue = function() {
    return this.model[this.key];
  };
  fn.getNameInGroup = function() {
    return this.doc.nameInGroup || this.key;
  };
  fn.setVal = function(val) {
    this(val);
  };
  fn.markClean = function(cleanVal, allowParentUpdate) {
    var _this = this,
      noVal = cleanVal === undefined,
      thisVal = _this.getValue();
    cleanVal = (noVal ? thisVal : cleanVal);
    _this.cleanVal(cleanVal);
    _this.isClean(cleanVal === thisVal);

    if (allowParentUpdate) {
      _this.updateParent();
    }
  };
  fn.ignore = function(ignoreVal, allowParentUpdate) {
    var _this = this;
    if (arguments.length) {
      if (ignoreVal) {
        _this._ignore = true;
      } else {
        delete _this._ignore;
      }
      if (allowParentUpdate) {
        _this.updateParent();
      }
    }
    return !!_this._ignore;
  };
  fn.update = function() {};
  fn.validate = function() {
    if (!this.validateGroup()) {
      this.validateSingle();
    }
  };
  fn.validateSingle = function() {
    var val = this.getValue();
    if (val instanceof Error) {
      this.errMsg(val.message || 'invalid value');
    } else {
      this.errMsg(getValidationMsg(this.doc.validators, val, this.model, this.ukovModel, this));
    }
    return this.isValid();
  };
  fn.validateGroup = function() {
    var validationGroup = this.doc.validationGroup,
      prop, validIndividually = true,
      groupUkovProps = [],
      groupVal = {}, errMsg;
    if (!validationGroup) {
      return false;
    }

    // validate each field in the group individually
    validationGroup.keys.forEach(function(key) {
      prop = this.ukovModel[key];
      // validate individual field
      validIndividually &= prop.validateSingle();
      // store for later
      groupUkovProps.push(prop);
      groupVal[prop.getNameInGroup()] = prop.getValue();
    }, this);

    // validate group as a whole
    if (validIndividually) {
      errMsg = getValidationMsg(validationGroup.validators, groupVal, this.model, this.ukovModel, this);
      if (errMsg) {
        // mark each with the group error
        groupUkovProps.forEach(function(prop) {
          prop.errMsg(errMsg);
        });
      }
    }

    return true;
  };

  function getValidationMsg(validators, val, model, ukovModel, prop) {
    var errMsg;
    if (validators) {
      validators.some(function(validate) {
        errMsg = validate(val, model, ukovModel, prop);
        // break on first error
        return errMsg;
      });
    }
    return errMsg;
  }

  return {
    create: createUkovProp,
    fn: fn,
  };
});
