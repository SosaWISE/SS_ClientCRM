define([
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

  function createUkovProp(updateParent, ukovModel, model, doc, key, initialValue) {
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
      prop(currVal === null ? currVal : currVal + '');
    } else {
      prop(currVal);
    }

    // get notified when the prop's value changes
    prop.subscribe(function propValueChanged() { //val) {
      // set underlying store value
      var newValue = prop.updateStoredValue();
      // validate
      prop.validate();
      // set dirty state
      prop.isClean(prop.cleanVal() === newValue);
      // update model state
      updateParent();

      // instead use a binding to set the prop value
      // if ((prop.isValid() && !textEqual(newValue, val)) ||
      //     (newValue === 0 && val === '')) {
      //   prop(newValue);
      // }
    });

    // try to set initial value
    if (initialValue !== undefined) {
      if (prop.doc.stringify) {
        prop(initialValue === null ? initialValue : initialValue + '');
      } else {
        prop(initialValue);
      }
      prop.markClean();
    }

    return prop;
  }
  // function textEqual(newValue, val) {
  //   if (typeof newValue !== 'string') {
  //     newValue = (newValue === null || newValue === undefined) ?
  //       '' : newValue + '';
  //   }
  //   /* jshint eqeqeq:false */
  //   return newValue == val;
  // }

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
  fn.markClean = function(cleanVal, allowParentUpdate) {
    var noVal = cleanVal === undefined,
      thisVal = this.getValue();
    cleanVal = (noVal ? thisVal : cleanVal);
    this.cleanVal(cleanVal);
    this.isClean(cleanVal === thisVal);

    if (allowParentUpdate) {
      this.updateParent();
    }
  };
  fn.setVal = function(val) {
    this(val);
  };
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
  };
});
