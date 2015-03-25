define('src/funding/criteriasearch.vm', [
  'src/dataservice',
  'src/funding/criteriasearch.gvm',
  'ko',
  'src/ukov',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  CriteriaSearchGridViewModel,
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
    CreatedBy: {
      converter: nullStrConverter,
    },
    CreatedOn: {
      converter: nullStrConverter,
    }
  };

  // ctor
  function CriteriaSearchViewModel(options) {
    var _this = this;
    CriteriaSearchViewModel.super_.call(_this, options);

    _this.data = ukov.wrap({}, schema);
    clearData(_this);

    _this.gvm = new CriteriaSearchGridViewModel({
      open: _this.open || function(item) {
        console.log(item);
      },
    });
  }

  utils.inherits(CriteriaSearchViewModel, ControllerViewModel);
  CriteriaSearchViewModel.prototype.viewTmpl = 'tmpl-funding-criteriasearch';
  CriteriaSearchViewModel.prototype.height = 500;
  CriteriaSearchViewModel.prototype.width = '80%';

  CriteriaSearchViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    dataservice.fundingsrv.criterias.read({}, null, utils.safeCallback(null, function(err, resp) {
      _this.gvm.list(resp.Value);
    }));
    join.when(function(err) {
      if (err) {
        return;
      }
    });
  };

  function clearData(_this) {
    var data = {
      CriteriaID: null,
      PurchaserId: 0,
      Purchaser: null,
      CriteriaName: null,
      Description: null,
      FilterString: null,
      CreatedBy: null,
      CreatedOn: null
    };
    _this.data.setValue(data);
    _this.data.markClean(data, true);
  }

  return CriteriaSearchViewModel;
});
