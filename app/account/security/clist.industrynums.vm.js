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

    _this.industryAccounts = ko.observableArray();

    //
    // events
    //
    _this.cmdGenerate = ko.command(function(cb) {
      dataservice.monitoringstationsrv.msAccounts.read({ //@TODO: this should be a POST
        id: _this.accountId,
        link: 'GenerateIndustryAccount',
      }, null, utils.safeCallback(null, function( /*err, resp*/ ) {
        // console.log(resp);
        load_industryAccounts(_this, function(err) {
          if (err) {
            notify.notify('error', 'Error', err.Message);
          }
          cb();
        });
      }, function(err) {
        notify.notify('error', 'Error', err.Message);
        cb();
      }));
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
    dataservice.monitoringstationsrv.msAccounts.read({
      id: _this.accountId,
      link: 'IndustryAccounts',
    }, null, utils.safeCallback(cb, function(err, resp) {
      _this.industryAccounts(resp.Value);
    }));
  }

  return CListIndustryViewModel;
});
