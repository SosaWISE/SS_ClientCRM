define('src/account/vm.salesinfo', [
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko',
  'src/core/vm.combo',
], function(
  dataservice,
  notify,
  utils,
  ControllerViewModel,
  ko,
  ComboViewModel
) {
  "use strict";

  function SalesInfoViewModel(options) {
    var _this = this;
    SalesInfoViewModel.super_.call(_this, options);

    // ** Fields
    _this.psComboVM = new ComboViewModel();
    _this.title = ko.observable(_this.title);

    //
    // events
    //
  }
  utils.inherits(SalesInfoViewModel, ControllerViewModel);
  SalesInfoViewModel.prototype.viewTmpl = 'tmpl-salesinfo';

  SalesInfoViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();

    //@TODO: load real account
    dataservice.salessummary.pointsystems.read({}, null, function(err, resp) {
      if (err) {
        notify.notify('error', err.Message);
        return;
      }

      // ** Bind data
      var map = resp.Value.map(function(item) {
        return {
          text: item.TemplateName,
          value: item.InvoiceTemplateID
        };
      });
      _this.psComboVM.setList(map);

      cb();

    });
  };

  return SalesInfoViewModel;
});