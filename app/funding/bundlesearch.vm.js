define('src/funding/bundlesearch.vm', [
  'src/dataservice',
  'src/funding/bundlesearch.gvm',
  'src/funding/bundleitemsearch.gvm',
  'src/funding/packetitemsearch.gvm',
  'ko',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  BundleSearchGridViewModel,
  BundleItemSearchGridViewModel,
  PacketItemSearchGridViewModel,
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
        //console.log(item);
        dataservice.fundingsrv.bundleItems.read({
          id: item.BundleID,
        }, null, utils.safeCallback(null, function(err, resp) {
          // set result in grid
          _this.gvmItems.list(resp.Value);
          _this.gvmItems.setSelectedRows([]);
        }, function(err) {
          notify.error(err, 30);
        }));
        return true;
      },
    });

    _this.gvmItems = new BundleItemSearchGridViewModel({
      open: _this.open || function(item) {
        // console.log(item);
        dataservice.fundingsrv.gvmPackItems.read({
          id: item.PacketId,
        }, null, utils.safeCallback(null, function(err, resp) {
          _this.gvmPackItems.list(resp.Value);
          _this.gvmPackItems.setSelectedRows([]);
        }, function(err) {
          notify.error(err, 30);
        }));
        return true;
      }
    });
    _this.gvmPackItems = new PacketItemSearchGridViewModel({
      open: _this.open || function(item) {
        console.log('This is where we open tha packetItem.', item);
      }
    });
  }

  utils.inherits(BundleSearchViewModel, ControllerViewModel);
  BundleSearchViewModel.prototype.viewTmpl = 'tmpl-funding-bundlesearch';
  BundleSearchViewModel.prototype.height = 500;
  BundleSearchViewModel.prototype.width = '80%';

  BundleSearchViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    dataservice.fundingsrv.bundles.read({}, null, utils.safeCallback(join.add(), function(err, resp) {
      // set results in grid
      _this.gvm.list(resp.Value);
      _this.gvm.setSelectedRows([]);
    }, function(err) {
      notify.error(err, 30);
    }));
  };

  function clearData(_this) {
    var data = {
      BundleID: {},
      PurchaserId: nullStrConverter,
    };
    _this.data.setValue(data);
    _this.data.markClean(data, true);
  }

  function search(_this, cb) {
    _this.gvm.list([]);

    dataservice.fundingsrv.bundles.read({}, null, utils.safeCallback(cb, function(err, resp) {
      // set results in grid
      _this.gvm.list(resp.Value);
      _this.gvm.setSelectedRows([]);
    }, function(err) {
      notify.error(err, 30);
    }));
  }

  return BundleSearchViewModel;
});
