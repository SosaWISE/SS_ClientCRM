## Unified Knockout Validation (U-KOV) ##

#### How it works ####
Essentially u-kov wraps an object and turns it into an object where every property is validated, observable, and keeps track of whether its value is dirty or clean.

### Schema ###
A schema is an object with nested objects that describes the object to be wrapped, its properties, and the validations on each property.

  - property schema - object defining the property and validations
      - When value is wrapped it becomes a UkovProp
      - `_model` - Value must be falsey, so it can just be left out.
      - `converter` - Converter function for converting a string into a bool, number, etc.
          - returns a `new Error` if the conversion failed
      - `validators` - Array of validation functions.
          - validation function(value, model, ukovModel, ukovProp)
              - `value` - value to validate
              - `model` - model containing the value
              - `ukovModel` - u-kov model that wraps `model`
              - `ukovProp` - u-kov prop that wraps `value`
              - returns error message string when invalid and null/undefined/falsey value when valid
      - `validationGroup` - object used to group properties
          - `keys` - Array of property names in group.
          - `validators` - Array of validation functions.
      - All other properties are ignored.
  - object schema
      - When value is wrapped it becomes a UkovModel
      - `_model` - Value must be truthy.
      - All other properties including `validators` and `converter` are treated as nested child schemas.
  - array schema
      - When value is wrapped it becomes a UkovPropArray
      - Value should be an array and the first object should be a property or object schema.

### Ukov objects ###
  - UkovProp
      - observables
          - isClean() - returns true if the value has not been changed
          - isValid() - returns true if the value passed all validations
          - errMsg() - returns an error message string, if there is an error
      - functions
          - validate() - runs validators in schema on this property
          - markClean(cleanVal, allowParentUpdate) - mark this property as clean
              - `cleanVal` - value to set as the clean value
              - `allowParentUpdate` - true if `update` can be called on the parent model
  - UkovModel
      - observables
          - isClean() - returns true if no properties on this model has changed
          - isValid() - returns true if all child properties are valid
          - errMsg() - returns an error message string, if there is an error
      - functions
          - update(preventParentUpdate) - updates `isClean`, `isValid`, and `errMsg`
              - `preventParentUpdate` - true if `update` should not be called on the parent model
          - markClean(cleanVal, allowParentUpdate) - mark this object and all children as clean
              - `cleanVal` - value to set as the clean value
              - `allowParentUpdate` - true if `update` can be called on the parent model
          - getValue(onlyDirty) - get a plain json object of the model
              - `onlyDirty` - if true only object that are not clean are included
          - setVal(val) - updates the values of the model and its children
  - UkovPropArray
      - observables
          - isClean() - returns true if no items in the array has changed
          - isValid() - returns true if all items in the array are valid
          - errMsg() - returns an error message string from the first item in the array that has an error
      - functions
          - update(preventParentUpdate) - updates `isClean`, `isValid`, and `errMsg`
              - `preventParentUpdate` - true if `update` should not be called on the parent model
          - markClean(cleanArray, allowParentUpdate) - mark this property an all items in the array as clean
              - `cleanArray` - array to set as the clean value
              - `allowParentUpdate` - true if `update` can be called on the parent model


#### Example ####
```javascript
var ukov = require('src/ukov'),
  model,
  schema,
  vGroup,
  wrappedModel;

// model
model = {
  ranges: [
    {
      min: 0,
      max: 0,
    },
    {
      min: 0,
      max: 0,
    },
  ],
  ignoredField: 'asdf',
};

// define group validator
vGroup = {
  // properties in group
  keys: [ 'min', 'max' ],
  validators: [
    // define validator
    function (value) {
      if (value.min > value.max) {
        // didn't pass validation
        return 'min cannot be greater than max';
      }
    }
  ],
};
// define schema
schema = {
  _model: true, // let u-kov know this is an object
  ranges: [
    {
      _model: true, // let u-kov know this is an object
      min: {
        converter: ukov.converters.number(0),
        validators: [ ukov.validators.isInt(), ukov.validators.isInRange(-10, 10) ],
        validationGroup: vGroup,
      },
      max: {
        converter: ukov.converters.number(0),
        validators: [ ukov.validators.isInt(), ukov.validators.isInRange(-10, 10) ],
        validationGroup: vGroup,
      },
    }
  ],
};

wrappedModel = ukov.wrap(model, schema);

wrappedModel.ranges()[0].min(5);
console.log(wrappedModel.isValid()); // false
console.log(wrappedModel.errMsg()); // 'min cannot be greater than max'

wrappedModel.ranges()[0].max(10);
console.log(wrappedModel.isValid()); // true
console.log(wrappedModel.errMsg()); // undefined
```
