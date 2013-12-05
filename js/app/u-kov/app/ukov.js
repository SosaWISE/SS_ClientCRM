define('src/u-kov/app/ukov', [
 'src/u-kov/app/ukov-model',
 'src/u-kov/app/ukov-prop-array',
 'src/u-kov/app/ukov-prop',
], function(
  UkovModel,
  ukovPropArray,
  ukovProp
) {
  "use strict";

  function createChild(update, model, doc, ukovModel, key, initialValue) {
    if (initialValue === undefined) {
      initialValue = model[key];
    } else {
      if (model[key] !== undefined) {
        console.error('both model[key] and initialValue are set', arguments);
      }
      model[key] = initialValue;
    }

    var prop;
    if (doc._model) {
      prop = new UkovModel(update, model, doc, key);
    } else if (Array.isArray(doc)) {
      prop = ukovPropArray.create(update, ukovModel || {
        model: []
      }, initialValue, doc, key);
    } else {
      prop = ukovProp.create(update, ukovModel || {}, model, doc, key);
    }
    return prop;
  }
  UkovModel.prototype.createChild = function(key, initialValue) {
    var _this = this,
      doc = _this.doc[key],
      model = _this.model;

    if (!model.hasOwnProperty(key)) {
      // console.log('property `' + key + '` not on model. adding...');
      // add property since it doesn't exist
      if (doc._model) {
        model[key] = {};
      } else if (Array.isArray(doc)) {
        model[key] = [];
      } else {
        model[key] = null;
      }
    }

    return createChild(_this.update, model, doc, _this, key, initialValue);
  };
  ukovPropArray.fn.createChild = function(index, initialValue) {
    var _this = this;
    return createChild(_this.update, _this.model, _this.doc, _this.ukovModel, index, initialValue);
  };

  function no_op() {}

  function Ukov() {
    // init with empty schema
    // this allows for adding validations at anytime
    this.schema = {};
  }
  Ukov.prototype.wrap = function(model, docArg, updateParent) {
    var doc, wrapped;

    if (typeof(docArg) === 'object') {
      doc = docArg;
    } else {
      doc = this.schema[docArg];
    }

    if (!doc) {
      throw new Error('no doc for `' + docArg + '`');
    }
    if (!model) {
      throw new Error('missing model for doc: ' + docArg);
    }

    if (typeof(updateParent) !== 'function') {
      updateParent = no_op;
    }

    // wrap value
    wrapped = createChild(updateParent, {
      root: model,
    }, doc, null, 'root');
    // validate value
    wrapped.validate();
    wrapped.update();

    return wrapped;
  };
  Ukov.prototype.create = function() {
    return new Ukov();
  };

  return new Ukov();
});
