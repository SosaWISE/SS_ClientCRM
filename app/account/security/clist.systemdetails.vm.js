define('src/account/security/clist.systemdetails.vm', [
  'src/account/default/rep.find.vm',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  RepFindViewModel,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function CListSystemDetailsViewModel(options) {
    var _this = this;
    CListSystemDetailsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.data = ko.observable();
    _this.repModel = ko.observable();

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
  utils.inherits(CListSystemDetailsViewModel, ControllerViewModel);
  CListSystemDetailsViewModel.prototype.viewTmpl = 'tmpl-security-clist_systemdetails';

  CListSystemDetailsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();
    setTimeout(function() {
      //@TODO: load real data
      _this.data({});

      cb();
    }, 2000);
  };

  return CListSystemDetailsViewModel;
});
