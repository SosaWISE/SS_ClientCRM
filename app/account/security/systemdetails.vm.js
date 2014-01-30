define('src/account/security/systemdetails.vm', [
  'src/rep.find.vm',
  'src/account/security/emcontacts.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  RepFindViewModel,
  EmContactsViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SystemDetailsViewModel(options) {
    var _this = this;
    SystemDetailsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.data = ko.observable();
    _this.repModel = ko.observable();

    _this.emcontactsVm = new EmContactsViewModel({
      layersVm: _this.layersVm,
    });

    //
    // events
    //
    _this.cmdFindRep = ko.command(function(cb) {
      if (_this.layer) {
        return;
      }
      _this.layer = _this.layersVm.show(new RepFindViewModel({
        title: 'Technician',
      }), function onClose(result) {
        _this.layer = null;
        _this.repModel(result);
      });
      cb();
    }, function(busy) {
      return !busy && !_this.repModel();
    });
  }
  utils.inherits(SystemDetailsViewModel, ControllerViewModel);
  SystemDetailsViewModel.prototype.viewTmpl = 'tmpl-security-systemdetails';

  SystemDetailsViewModel.prototype.onLoad = function(routeData, join) { // overrides base
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

  return SystemDetailsViewModel;
});
