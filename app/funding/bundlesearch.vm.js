define('src/funding/bundlesearch.vm', [
  'src/dataservice',
  'src/funding/criteriasearch.gvm',
  'ko',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  CriteriaSearchGridViewModel,
  ko,
  ukov,
  notify,
  utils,
  ControllerViewModel) {
  "use strict";
  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,

    BundleID: {},
    PurchaserId: nullStrConverter,
  };

  // ctor
  function BundleSearchViewModel(options) {
    var _this = this;
    BundleSearchViewModel.super_.call(_this, options);

    _this.data = ukov.wrap({}, schema);
    clearData(_this);

    _this.cmdSearch = ko.command(function(cb) {
      search(_this, cb);
    });
    _this.gvm = new BundleSearchGridViewModel({
      open: _this.open || function(item) {
        console.log(item);
      },
    });
  }

  utils.inherits(BundleSearchViewModel, ControllerViewModel);
  BundleSearchViewModel.prototype.viewTmpl = 'tmpl-funding-bundlesearch';
  BundleSearchViewModel.prototype.height = 500;
  BundleSearchViewModel.prototype.width = '80%';

  BundleSearchViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    dataservice.fundingsrv.criterias.read({}, null, utils.safeCallback(join.add(), function(err, resp) {
      // set results in grid
      _this.gvm.list(resp.Value);
      _this.gvm.setSelectedRows([]);
    }, function(err) {
      notify.error(err, 30);
    }));
    // join.when(function(err) {
    //   if (err) {
    //     return;
    //   }
    // });
  };
});
