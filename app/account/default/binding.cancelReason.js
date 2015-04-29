define("src/account/default/binding.cancelReason", [
  "src/account/mscache",
  "ko",
], function(
  mscache,
  ko
) {
  "use strict";

  ko.bindingHandlers.cancelReason = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      // pass through to `text` binding
      ko.bindingHandlers.text.init(element, valueAccessor, allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      function newValueAccessor() {
        var id = ko.unwrap(valueAccessor());
        var item = mscache.getMap("types/accountCancelReasons")[id];
        return item ? item.Name : id;
      }
      // call `text` binding
      ko.bindingHandlers.text.update(element, newValueAccessor, allBindings, viewModel, bindingContext);
    },
  };

  return function(cb) {
    mscache.ensure("types/accountCancelReasons", cb);
  };
});
