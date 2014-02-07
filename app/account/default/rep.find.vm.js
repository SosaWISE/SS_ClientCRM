define('src/account/default/rep.find.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
  'src/dataservice'
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
        ukov.validators.isPattern(/^[a-z]{4}[0-9]{3}$/i, 'Invalid Company ID. Expected format: AAAA000'),
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
    _this.repData = ukov.wrap({
      CompanyID: '',
    }, schema);
    _this.loading = ko.observable(false);
    _this.loaded = ko.observable(false);
    _this.repResult = ko.observable(null);

    /////TESTING//////////////////////
    _this.repData.CompanyID('sosa001');
    /////TESTING//////////////////////

    //
    // events
    //
    _this.clickClose = function() {
      if (_this.layer) {
        _this.layer.close(_this.repResult());
      }
    };
    _this.cmdFind = ko.command(function(cb) {
      _this.repData.validate();
      if (!_this.repData.isValid()) {
        notify.notify('warn', _this.repData.errMsg(), 7);
        return cb();
      }

      _this.loaded(false);
      var model = _this.repData.getValue();
      _this.repData.markClean();
      _this.repResult(null);
      dataservice.qualify.salesrep.read({
        id: model.CompanyID
      }, null, function(err, resp) {
        if (err) {
          notify.notify('warn', err.Message, 10);
          _this.focusFirst(true);
        } else if (resp.Value) {
          _this.repResult(resp.Value);
          _this.loaded(true);
        }
        cb();
      });
    });

    _this.loading = _this.cmdFind.busy;

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

  return RepFindViewModel;
});
