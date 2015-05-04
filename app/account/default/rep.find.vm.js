define("src/account/default/rep.find.vm", [
  "howie",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/dataservice",
], function(
  howie,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov,
  strings,
  dataservice
) {
  "use strict";

  var schema = {
    _model: true,
    CompanyID: {
      converter: ukov.converters.toUpper(),
      validators: [
        ukov.validators.isRequired("Company ID is required"),
        ukov.validators.isCompanyID(),
      ],
    },
    // SeasonId: {},
    // TeamLocationId: {},
  };

  function RepFindViewModel(options) {
    var _this = this;
    RepFindViewModel.super_.call(_this, options);

    _this.title = _this.title || "Sales Rep";
    _this.initFocusFirst();
    _this.focusOk = ko.observable(false);
    _this.repData = ukov.wrap({
      CompanyID: _this.text || "",
    }, schema);
    _this.rep = ko.observable();

    // /////TESTING//////////////////////
    // _this.repData.CompanyID("sosa001");
    // /////TESTING//////////////////////

    //
    // events
    //
    _this.clickOk = function() {
      _this.layerResult = _this.rep.peek();
      closeLayer(_this);
    };
    _this.cmdFind = ko.command(function(cb) {
      // clear out previously found rep
      _this.rep(null);

      _this.repData.validate();
      if (!_this.repData.isValid()) {
        notify.warn(_this.repData.errMsg(), null, 7);
        return cb();
      }

      var model = _this.repData.getValue();
      dataservice.qualify.salesrep.read({
        id: model.CompanyID
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (resp && resp.Value) {
          // mark clean what was searched
          _this.repData.markClean(model);
          // set rep
          resp.Value.ImagePath = strings.format("//{0}/HumanResourceSrv/users/{1}/photo",
            howie.fetch("config").serviceDomain, resp.Value.UserID);
          _this.rep(resp.Value);
          _this.focusOk(true);
        }
      }, function(err) {
        notify.error(err);
        _this.focusFirst(true);
      }));
    });
  }
  utils.inherits(RepFindViewModel, BaseViewModel);
  RepFindViewModel.prototype.viewTmpl = "tmpl-acct-default-rep_find";
  RepFindViewModel.prototype.width = 400;
  RepFindViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  RepFindViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  return RepFindViewModel;
});
