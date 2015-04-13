define("src/u-kov/bindings", [
  "jquery",
  "ko",
], function(
  jquery,
  ko
) {
  "use strict";

  var exports = {};

  ko.bindingHandlers.ukov = {
    // init: function(element, valueAccessor) {
    //   var prop = valueAccessor();
    //   // set prop to converted value when element loses focus
    //   jquery(element).blur(function setProp() {
    //     var value = prop.getValue();
    //     if (!(value instanceof Error)) {
    //       prop(value);
    //     }
    //   });
    // },
    update: function(element, valueAccessor) {
      exports.updateElement(element, valueAccessor());
    }
  };

  function updateElement(element, ukovItem) {
    var cls, title = "";
    if (!ukovItem) {
      throw new Error("no ukovItem");
    }
    if (ukovItem.isSaving && ukovItem.isSaving()) {
      cls = "form-saving";
    } else if (ukovItem.isValid && !ukovItem.isValid()) {
      cls = "form-error";
      title = "Invalid: " + ukovItem.errMsg();
    } else if (ukovItem.isClean && !ukovItem.isClean()) {
      cls = "form-dirty";
      //@REVIEW: it would be nice to format this like the value... but how??
      title = ukovItem.cleanVal.peek();
      if (title == null) {
        title = "(null)";
      }
      title = "Clean: " + title;
    } else {
      cls = null;
    }

    element = jquery(element);
    //
    element.attr("title", title);
    // store on the element so that the same ukovItem
    // can be bound to multiple elements simultaneously
    var ukovPrevCls = element.data("ukovPrevCls");
    if (ukovPrevCls) {
      element.removeClass(ukovPrevCls);
    }
    if (cls) {
      element.addClass(cls);
    }
    element.data("ukovPrevCls", cls);
  }

  exports.updateElement = updateElement;
  return exports;
});
