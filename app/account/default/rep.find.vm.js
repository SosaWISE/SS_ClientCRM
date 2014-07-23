define('src/account/default/rep.find.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
  'src/dataservice',
], function(
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  dataservice
) {
  "use strict";

  var schema = {
    _model: true,
    CompanyID: {
      converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Company ID is required'),
        ukov.validators.isPattern(/^[a-z]{2,5}[0-9]{3}$/i, 'Invalid Company ID. Expected format: AAAA000'),
      ],
    },
    // SeasonId: {},
    // TeamLocationId: {},
  };

  function RepFindViewModel(options) {
    var _this = this;
    RepFindViewModel.super_.call(_this, options);

    _this.title = _this.title || 'Sales Rep';
    _this.focusFirst = ko.observable(false);
    _this.focusOk = ko.observable(false);
    _this.repData = ukov.wrap({
      CompanyID: _this.text || '',
    }, schema);
    _this.rep = ko.observable();

    //
    // events
    //
    _this.clickOk = function() {
      _this.layerResult = _this.rep.peek();
      closeLayer(_this);
    };
    _this.cmdFind = ko.command(function(cb) {
      // clear out previously found rep
      _this.rep(null);

      _this.repData.validate();
      if (!_this.repData.isValid()) {
        notify.warn(_this.repData.errMsg(), null, 7);
        return cb();
      }

      var model = _this.repData.getValue();
      dataservice.qualify.salesrep.read({
        id: model.CompanyID
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (resp) {
          // mark clean what was searched
          _this.repData.markClean(model);
          // set rep
          _this.rep(resp.Value);
          _this.focusOk(true);
        }
      }, function(err) {
        notify.error(err);
        _this.focusFirst(true);
      }));
    });

    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(RepFindViewModel, BaseViewModel);
  RepFindViewModel.prototype.viewTmpl = 'tmpl-acct-default-rep_find';
  RepFindViewModel.prototype.width = 400;
  RepFindViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  RepFindViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return RepFindViewModel;
});
