define("src/core/override.vm", [
  "ko",
  "src/core/subscriptionhandler",
  "src/core/combo.vm",
  "src/core/strings",
  "src/core/harold",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ko,
  SubscriptionHandler,
  ComboViewModel,
  strings,
  harold,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  function OverrideViewModel(options) {
    var _this = this;
    OverrideViewModel.super_.call(_this, options);
    utils.assertPropFuncs(_this, [
      "onActionRequest",
    ]);
    utils.assertProps(_this, [
      "requestUrl",
      "authNeeds",
    ]);

    _this.title = ko.observable(_this.title);
    _this.initFocusFirst();
    _this.mixinLoad();
    _this.handler = new SubscriptionHandler();

    var accache = harold.fetch("accache");

    _this.reasonId = ko.observable();
    _this.reason = ko.observable("");
    _this.reasonCvm = new ComboViewModel({
      selectedValue: _this.reasonId,
      fields: accache.metadata("types/requestReasons"),
    }).subscribe(accache.getList("types/requestReasons"), _this.handler);

    //
    // events
    //
    _this.cmdActionRequest = ko.command(function(cb) {
      _this.onActionRequest({
        ApplicationId: _this.authNeeds.ApplicationId,
        ActionId: _this.authNeeds.ActionId,
        RequestReasonId: _this.reasonId.peek(),
        RequestReason: strings.trim(_this.reason.peek()) || null,
        // OnBehalfOf: null,
      }, function(val) {
        var status = val.Status;
        switch (status) {
          case "approved":
            break;
          default:
            // case "pending":
            // case "denied":
            // case "expired":
            // case "used":
            notify.warn("Unsupported Status", status + " is currently not supported", 0);
            return;
        }
        _this.layerResult = val.Token;
        closeLayer(_this);
      }, cb);
    });
  }
  utils.inherits(OverrideViewModel, BaseViewModel);
  OverrideViewModel.prototype.viewTmpl = "tmpl-core-override";
  OverrideViewModel.prototype.width = 400;
  OverrideViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  OverrideViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  OverrideViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this;
    var msg;
    if (_this.cmdActionRequest.busy.peek() && !_this.layerResult) {
      msg = "Please wait for action request to finish.";
    }
    return msg;
  };

  OverrideViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    var accache = harold.fetch("accache");
    accache.ensure("types/requestReasons", join.add());

    join.when(function() {
      _this.reasonCvm.ensureSelected();
    });
  };

  return OverrideViewModel;
});
