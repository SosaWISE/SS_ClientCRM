define("src/account/security/dispatchagency.editor.vm", [
  "src/core/combo.vm",
  "src/dataservice",
  "ko",
  "src/ukov",
  "src/core/notify",
  "src/core/base.vm",
  "src/core/utils",
], function(
  ComboViewModel,
  dataservice,
  ko,
  ukov,
  notify,
  BaseViewModel,
  utils
) {
  "use strict";

  var schema,
    dateConverter = ukov.converters.date();

  schema = {
    _model: true,
    DispatchAgencyAssignmentID: {},
    AccountId: {},
    DispatchAgencyName: {
      validators: [
        ukov.validators.isRequired("Agency name is required"),
      ],
    },
    Phone1: {
      converter: ukov.converters.phone(),
      validators: [
        ukov.validators.isRequired("Phone number is required"),
      ],
    },
    DispatchAgencyTypeId: {
      validators: [
        ukov.validators.isRequired("Agency type is required"),
      ],
    },
    PermitNumber: {
      // validators: [
      //   ukov.validators.isRequired("Permit number is required"),
      // ],
    },
    PermitEffectiveDate: {
      converter: dateConverter,
      // validators: [
      //   ukov.validators.isRequired("Effective date is required"),
      // ],
    },
    PermitExpireDate: {
      converter: dateConverter,
      // validators: [
      //   ukov.validators.isRequired("Expiration date is required"),
      // ],
    },
  };

  function DispatchAgencyEditorViewModel(options) {
    var _this = this;
    DispatchAgencyEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      "dispatchAgencyTypes",
      "dispatchAgencyTypeFields",
    ]);

    _this.initFocusFirst();

    _this.data = ukov.wrap(_this.item || {
      AccountId: options.accountId,
      DispatchAgencyName: "",
      Phone1: "",
      DispatchAgencyTypeId: null,
      PermitNumber: "",
      PermitEffectiveDate: "",
      PermitExpireDate: "",
    }, schema);
    _this.data.DispatchAgencyTypeCvm = new ComboViewModel({
      selectedValue: _this.data.DispatchAgencyTypeId,
      list: _this.dispatchAgencyTypes,
      fields: _this.dispatchAgencyTypeFields,
    });

    //
    // events
    //
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      dataservice.monitoringstationsrv.accountDispatchAgencyAssignments.save({
        // id: _this.data.model.DispatchAgencyAssignmentID,
        data: model,
      }, function(val) {
        _this.data.markClean(model, true);
        //
        _this.layerResult = val;
        _this.isDeleted = false;
        closeLayer(_this);
      }, cb);
    }, function(busy) {
      return !busy && !_this.cmdDelete.busy();
    });
    _this.cmdDelete = ko.command(function(cb) {
      dataservice.monitoringstationsrv.accountDispatchAgencyAssignments.del({
        id: _this.data.model.DispatchAgencyAssignmentID,
      }, function(val) {
        //
        _this.layerResult = val || 1;
        _this.isDeleted = true;
        closeLayer(_this);
      }, cb);
    }, function(busy) {
      return !busy && _this.item && !_this.cmdSave.busy();
    });
    _this.busy = ko.computed(function() {
      return _this.cmdSave.busy() || _this.cmdDelete.busy();
    });
  }
  utils.inherits(DispatchAgencyEditorViewModel, BaseViewModel);
  DispatchAgencyEditorViewModel.prototype.viewTmpl = "tmpl-security-dispatchagency_editor";
  DispatchAgencyEditorViewModel.prototype.width = 600;
  DispatchAgencyEditorViewModel.prototype.height = "auto";
  DispatchAgencyEditorViewModel.prototype.onLoad = function() {
    var _this = this;

    console.log(_this);
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  DispatchAgencyEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, _this.isDeleted];
  };
  DispatchAgencyEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = "Please wait for save to finish.";
    } else if (_this.cmdDelete.busy() && !_this.layerResult) {
      msg = "Please wait for delete to finish.";
    }
    return msg;
  };

  return DispatchAgencyEditorViewModel;
});
