define('src/u-kov/bindings', [
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
    var cls, title = '';
    if (!ukovItem) {
      throw new Error('no ukovItem');
    }
    if (ukovItem.isSaving && ukovItem.isSaving()) {
      cls = 'form-saving';
    } else if (ukovItem.isValid && !ukovItem.isValid()) {
      cls = 'form-error';
      title = 'Invalid: ' + ukovItem.errMsg();
    } else if (ukovItem.isClean && !ukovItem.isClean()) {
      cls = 'form-dirty';
    } else {
      cls = null;
    }

    element = jquery(element);
    //
    element.attr('title', title);
    //
    if (ukovItem._ukovPrevCls) {
      element.removeClass(ukovItem._ukovPrevCls);
    }
    if (cls) {
      element.addClass(cls);
    }
    ukovItem._ukovPrevCls = cls;
  }

  exports.updateElement = updateElement;
  return exports;
});
