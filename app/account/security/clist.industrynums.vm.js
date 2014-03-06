define('src/account/security/clist.industrynums.vm', [
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListIndustryViewModel(options) {
    var _this = this;
    CListIndustryViewModel.super_.call(_this, options);

    _this.data = ko.observable();
  }
  utils.inherits(CListIndustryViewModel, ControllerViewModel);
  CListIndustryViewModel.prototype.viewTmpl = 'tmpl-security-clist_industrynums';

  CListIndustryViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: create/load numbers
      _this.data({
        'IndustryNumber': '54332211',
        'ReceiverNumber': '8775555555',
        'LastNOCDate': 'Midnight of 2/5/2014 11:59:59 PM (MST)',
      });

      cb();
    }, 2000);
  };

  return CListIndustryViewModel;
});
