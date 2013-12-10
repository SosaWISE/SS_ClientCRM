define('src/u-kov/app/bindings', [
 'jquery',
 'ko',
], function(
  jquery,
  ko
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

  function updateElement(element, ukovItem) {
    var cls;
    if (!ukovItem) {
      throw new Error('no ukovItem');
    }
    if (ukovItem.isSaving && ukovItem.isSaving()) {
      cls = 'form-saving';
    } else if (ukovItem.isValid && !ukovItem.isValid()) {
      cls = 'form-error';
    } else if (ukovItem.isClean && !ukovItem.isClean()) {
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
