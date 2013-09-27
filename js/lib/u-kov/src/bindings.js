define([
 'jquery',
 'ko',
 './ukov',
 './ukov-collection'
], function(
  $,
  ko,
  ukov,
  UkovCollection
) {
  "use strict";

  var exports = {};

  ko.bindingHandlers.ukov = {
    init: function(element, valueAccessor) {
      var prop = valueAccessor();
      // set prop to converted value when element loses focus
      $(element).blur(function setProp() {
        var value = prop.getValue();
        if (!(value instanceof Error)) {
          prop(value);
        }
      });
    },
    update: function(element, valueAccessor) {
      exports.updateElement(element, valueAccessor());
    }
  };
  ko.bindingHandlers.ukovCollection = {
    init: function(element, valueAccessor) {
      var collectionName = valueAccessor(),
        ukovCollection = ukov.ukovCollectionsMap[collectionName];

      if (!ukovCollection) {
        ukov.ukovCollectionsMap[collectionName] = ukovCollection = new UkovCollection();
      }
      ukovCollection.onChanged(function() {
        exports.updateElement(element, ukovCollection);
      });
    }
  };

  function updateElement(element, ukovItem) {
    var cls;
    if (!ukovItem) {
      throw new Error('no ukovItem');
    }
    if (ukovItem.isSaving && ukovItem.isSaving()) {
      cls = 'form-saving';
    } else if (!ukovItem.isValid()) {
      cls = 'form-error';
    } else if (!ukovItem.isClean()) {
      cls = 'form-dirty';
    } else {
      cls = null;
    }
    if (ukovItem._ukovPrevCls) {
      $(element).removeClass(ukovItem._ukovPrevCls);
    }
    if (cls) {
      $(element).addClass(cls);
    }
    ukovItem._ukovPrevCls = cls;
  }

  exports.updateElement = updateElement;
  return exports;
});
