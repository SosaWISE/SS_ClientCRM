define('src/account/security/clist.industrynums.vm', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListIndustryViewModel(options) {
    var _this = this;
    CListIndustryViewModel.super_.call(_this, options);

    _this.mayReload = ko.observable(false);
    _this.industryAccounts = ko.observableArray();

    //
    // events
    //
    _this.cmdGenerate = ko.command(function(cb) {
      dataservice.monitoringstationsrv.msAccounts.save({
        id: _this.accountId,
        link: 'GenerateIndustryAccount',
      }, null, function(genErr /*, resp*/ ) {
        // always reload industry accounts since after an industry number is generated there can be errors
        load_industryAccounts(_this, utils.safeCallback(cb, function() {
          // show generation error if there was one
          if (genErr) {
            notify.error(genErr);
          }
        }, notify.iferror));
      });
    });
  }
  utils.inherits(CListIndustryViewModel, ControllerViewModel);
  CListIndustryViewModel.prototype.viewTmpl = 'tmpl-security-clist_industrynums';

  CListIndustryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.accountId = routeData.id;
    load_industryAccounts(_this, join.add());
  };

  function load_industryAccounts(_this, cb) {
    // _this.industryAccounts([]); // don't reset
    dataservice.monitoringstationsrv.msAccounts.read({
      id: _this.accountId,
      link: 'IndustryAccounts',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (!err) {
        _this.industryAccounts(resp.Value);
      }
    }));
  }

  return CListIndustryViewModel;
});
