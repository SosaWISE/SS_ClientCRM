define('src/account/default/rep.find.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
  'src/dataservice',
  'src/account/security/equipment.vm'
], function(
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  dataservice,
  EquipmentViewModel
) {
  "use strict";

  var schema = {
    _model: true,
    CompanyID: {
      converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired('Company ID is required'),
        ukov.validators.isPattern(/^[a-z]{2,4}[0-9]{3}$/i, 'Invalid Company ID. Expected format: AAAA000'),
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
      CompanyID: _this.text || '',
    }, schema);
    _this.repResult = ko.observable(null);

    // /////TESTING//////////////////////
    // _this.repData.CompanyID('sosa001');
    // /////TESTING//////////////////////

    //
    // events
    //
    _this.clickClose = function() {
      if (_this.layer) {
        _this.layer.close(_this.repResult());
      }
    };
    _this.cmdFind = ko.command(function(cb) {
      _this.repResult(null);

      _this.repData.validate();
      if (!_this.repData.isValid()) {
        notify.warn(_this.repData.errMsg(), null, 7);
        return cb();
      }

      var model = _this.repData.getValue();
      dataservice.qualify.salesrep.read({
        id: model.CompanyID
      }, null, utils.safeCallback(cb, function(err, resp) {
        _this.repData.markClean(model);
        if (resp && resp.Value) {
          _this.repResult(resp.Value);


          //Extract TechnicianID - I'm not sure if this is the right way of passing value to EquipmentViewModel
          return new EquipmentViewModel({
            //repResult:resp.Value
            repCompanyID: resp.Value.CompanyID
          });



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

  return RepFindViewModel;
});
