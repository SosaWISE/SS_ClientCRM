define([
 './ukov-model',
 './ukov-collection'
], function(
  UkovModel,
  UkovCollection
) {
  "use strict";

  function Ukov() {
    this.ukovCollectionsMap = {};
    // init with empty schema
    // this allows for adding validations at anytime
    this.init({});
  }
  Ukov.prototype.init = function(schema) {
    this.schema = schema;
  };
  Ukov.prototype.wrapModel = Ukov.prototype.validateModel = function(model, docName, collectionName) {
    var doc = this.schema[docName],
      ukovModel;

    if (!doc) {
      throw new Error('no doc for `' + docName + '`');
    }
    if (!model) {
      throw new Error('missing model for doc: ' + docName);
    }

    // ensure a ukov collection exists
    collectionName = collectionName || 'default';
    if (!this.ukovCollectionsMap[collectionName]) {
      this.ukovCollectionsMap[collectionName] = new UkovCollection();
    }

    // setup ukov model
    ukovModel = new UkovModel(this.ukovCollectionsMap[collectionName].update, null, model, doc);
    this.ukovCollectionsMap[collectionName].ukovModels.push(ukovModel);

    return ukovModel;
  };
  Ukov.prototype.create = function() {
    return new Ukov();
  };

  return new Ukov();
});
