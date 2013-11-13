define('src/u-kov/app/bindings', [
 'jquery',
 'ko',
 'src/u-kov/app/ukov',
 'src/u-kov/app/ukov-collection'
], function(
  jquery,
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
      jquery(element).blur(function setProp() {
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
      jquery(element).removeClass(ukovItem._ukovPrevCls);
    }
    if (cls) {
      jquery(element).addClass(cls);
    }
    ukovItem._ukovPrevCls = cls;
  }

  exports.updateElement = updateElement;
  return exports;
});
