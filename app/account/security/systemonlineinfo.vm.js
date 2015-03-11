  define('src/account/security/systemonlineinfo.vm', [
    'jquery',
    'ko',
    'src/dataservice',
    'src/core/utils',
    'src/core/controller.vm',
  ], function(
    jquery,
    ko,
    dataservice,
    utils,
    ControllerViewModel
  ) {
    "use strict";

    // ** Special KO stuff
    ko.bindingHandlers.csr = {
      update: function(element, valueAccessor) {
        var cls, creditGroup = ko.unwrap(valueAccessor()),
          el = jquery(element);
        switch (creditGroup) {
          case "Good":
            cls = "green";
            break;
          case "Warning":
            cls = "yellow";
            break;
          case "Critical":
            cls = "red";
            break;
        }

        if (valueAccessor._prevCls) {
          el.removeClass(valueAccessor._prevCls);
        }
        if (cls) {
          valueAccessor._prevCls = cls;
          el.addClass(cls);
        }
      }
    };

    function SystemOnlineInfoViewModel(options) {
      var _this = this;
      SystemOnlineInfoViewModel.super_.call(_this, options);
      ControllerViewModel.ensureProps(_this, ['layersVm']);

      // ** Properties
      _this.msAccountStatus = ko.observableArray();

    }
    utils.inherits(SystemOnlineInfoViewModel, ControllerViewModel);
    SystemOnlineInfoViewModel.prototype.viewTmpl = 'tmpl-systemonline-info';

    SystemOnlineInfoViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
      var _this = this;
      dataservice.monitoringstationsrv.msAccountStatusInformations.read({
        id: routeData.id,
      }, null, utils.safeCallback(join.add(), function(err, resp) {
        _this.msAccountStatus(resp.Value);
      }, utils.no_op));
    };

    return SystemOnlineInfoViewModel;
  });
