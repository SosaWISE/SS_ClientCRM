define([
 'ko',
 './ukov-prop'
], function(
  ko,
  ukovProp
) {
  "use strict";

  var fn = {};

  function createUkovPropItem(ukovModel, prop, doc, key, updateParent, index) {
    ukovProp.create(ukovModel, prop, doc, key, updateParent);
    ko.utils.extend(prop, fn);

    prop.index = index;
  }

  fn.setValue = function(newValue) {
    this.ukovModel.jsonModel[this.key][this.index] = newValue;
  };
  fn.getValue = function() {
    return this.ukovModel.jsonModel[this.key][this.index];
  };

  return {
    create: createUkovPropItem,
  };
});
