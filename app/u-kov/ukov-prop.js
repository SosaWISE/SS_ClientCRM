define('src/u-kov/ukov-prop', [
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
      // this empty write function weren't here
      write: function() {},
    });

  function areEqual(a, b) {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    return a === b;
  }

  function createUkovProp(updateParent, ukovModel, model, doc, key) { //, initialValue) {
    if (!ukovModel || !model) {
      throw new Error('missing ukovModel or model for key: ' + key);
    }
    var prop = ko.observable(null),
      currVal;
    prop.setValue = prop;
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
      prop.isClean(areEqual(prop.cleanVal(), newValue));
      // update model state
      updateParent();
    });

    return prop;
  }
  fn.updateStoredValue = function() {
    var _this = this,
      val = _this.peek(),
      converter = _this.doc.converter;
    if (converter && typeof(val) === 'string') {
      val = converter(val);
    }
    _this.model[_this.key] = val;
    return val;
  };
  fn.getValue = function() {
    var _this = this;
    return _this.model[_this.key];
  };
  fn.getNameInGroup = function() {
    var _this = this;
    return _this.doc.nameInGroup || _this.key;
  };
  fn.markClean = function(cleanVal, allowParentUpdate) {
    var _this = this,
      noVal = cleanVal === undefined,
      thisVal = _this.getValue();
    cleanVal = (noVal ? thisVal : cleanVal);
    _this.cleanVal(cleanVal);
    _this.isClean(areEqual(cleanVal, thisVal));

    if (allowParentUpdate) {
      _this.updateParent();
    }
  };
  fn.ignore = function(ignoreVal, allowParentUpdate) {
    var _this = this;
    if (arguments.length) {
      _this._ignore = !! ignoreVal;
      // rerun validations
      _this.validate();
      if (allowParentUpdate) {
        _this.updateParent();
      }
    }
    return _this._ignore;
  };
  fn.update = function() {};
  fn.validate = function() {
    var _this = this;
    if (_this._ignore) {
      // mark as valid
      _this.errMsg(null);
    } else if (!_this.validateGroup()) {
      _this.validateSingle();
    }
  };
  fn.validateSingle = function() {
    var _this = this,
      val = _this.getValue();
    if (val instanceof Error) {
      _this.errMsg(val.message || 'invalid value');
    } else {
      _this.errMsg(getValidationMsg(_this.doc.validators, val, _this.model, _this.ukovModel, _this));
    }
    return _this.isValid();
  };
  fn.validateGroup = function() {
    var _this = this,
      validationGroup = _this.doc.validationGroup,
      prop, validIndividually = true,
      groupUkovProps = [],
      groupVal = {}, errMsg;
    if (!validationGroup) {
      return false;
    }

    // validate each field in the group individually
    validationGroup.keys.forEach(function(key) {
      prop = _this.ukovModel[key];
      // validate individual field
      validIndividually &= prop.validateSingle();
      // store for later
      groupUkovProps.push(prop);
      groupVal[prop.getNameInGroup()] = prop.getValue();
    }, _this);

    // validate group as a whole
    if (validIndividually) {
      errMsg = getValidationMsg(validationGroup.validators, groupVal, _this.model, _this.ukovModel, _this);
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
