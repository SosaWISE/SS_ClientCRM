define('src/funding/criteriasearch.vm', [
  'src/dataservice',
  'ko',
  'src/ukov',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  ko,
  ukov,
  utils,
  ControllerViewModel) {
  "use strict";
  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,

    CriteriaID: {},
    PurchaserId: {},
    Purchaser: {
      converter: nullStrConverter,
    },
    CriteriaName: {
      converter: nullStrConverter,
    },
    Description: {
      converter: nullStrConverter,
    },
    FilterString: {
      converter: nullStrConverter,
    },
  };

  // ctor
  function CriteriaSearchViewModel(options) {
    var _this = this;
    CriteriaSearchViewModel.super_.call(_this, options);

  }

  utils.inherits(CriteriaSearchViewModel, ControllerViewModel);
  CriteriaSearchViewModel.prototype.viewTmpl = 'tmpl-funding-criteriasearch';
  CriteriaSearchViewModel.prototype.height = 500;
  CriteriaSearchViewModel.prototype.width = '80%';

  return CriteriaSearchViewModel;

});
