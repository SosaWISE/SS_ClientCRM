define("src/core/ko.bindingHandlers.value", [
  "src/core/utils",
  "jquery",
  "ko"
], function(
  utils,
  jquery,
  ko
) {
  "use strict";

  var binding = ko.bindingHandlers.value,
    oldInit = binding.init;

  binding.init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    // call default
    oldInit(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

    var hasFocus = false,
      updateValue = getUpdateValueFunc(valueAccessor());

    //
    // Select all input text when text input is clicked
    //
    if (ko.utils.tagNameLower(element) === "input" &&
      (element.type === "text" || element.type === "password")) {
      //@NOTE: click is used instead of focus because focus will select the
      //       text and then a click event will happen and unselect the text
      jquery(element)
        .click(function() {
          // this should select all the text only if the user clicks the text
          // the if statements are in hopes of stopping annoying behavior such as:
          //  - preventing the user from selecting part of the text
          //  - selecting all the text when the user clicks at the beginning
          //  - selecting all the text when the user clicks at the end

          // if already focused do not "help" the user
          if (hasFocus) {
            return;
          }
          hasFocus = true;

          // return if the user has made a selection
          if (element.selectionStart !== element.selectionEnd) {
            return;
          }

          // return if the user did not click the text
          if (element.selectionEnd === 0 ||
            element.selectionEnd === element.value.length) {
            return;
          }

          // select all text
          element.select();
        })
        .blur(function() {
          hasFocus = false;
          // // i thought this would work for firefoxes bug,
          // // but in chrome this prevents the blur
          // element.selectionEnd = element.selectionStart;

          // set prop to converted value when element loses focus
          updateValue();
        });
    }
  };

  function getUpdateValueFunc(prop) {
    if (prop && prop.doc && prop.doc.converter && utils.isFunc(prop.updateValue)) {
      // prop must have a converter and an updateValue function
      return prop.updateValue.bind(prop);
    } else {
      return noop;
    }
  }

  function noop() {}
});
