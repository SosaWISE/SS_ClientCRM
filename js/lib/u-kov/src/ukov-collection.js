define([
 'ko'
], function(
  ko
) {
  "use strict";

  function UkovCollection() {
    // ensure update always has the correct scope
    this.update = this.update.bind(this);

    this.isClean = ko.observable(false);
    this.errMsg = ko.observable([]);
    this.isValid = ko.computed(function() {
      return !this.errMsg();
    }, this);

    this.ukovModels = [];
  }
  UkovCollection.prototype.onChanged = function(fn) {
    this._onChange = fn;
  };

  UkovCollection.prototype.update = function() {
    var isClean = true,
      errMsg;

    this.ukovModels.some(function(model) {
      // error
      if (!errMsg) {
        errMsg = model.errMsg();
      }
      // dirty
      if (isClean && !model.isClean()) {
        isClean = false;
      }
      // stop if errored and dirty
      return errMsg && !isClean;
    }, this);

    this.isClean(isClean);
    this.errMsg(errMsg);

    if (this._onChange) {
      this._onChange();
    }
  };

  return UkovCollection;
});
