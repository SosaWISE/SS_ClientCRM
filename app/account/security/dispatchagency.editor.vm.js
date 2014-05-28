define('src/account/security/dispatchagency.editor.vm', [
  'src/core/combo.vm',
  'src/dataservice',
  'ko',
  'src/ukov',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
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
    DaAssignmentId: {},
    AgencyName: {
      validators: [
        ukov.validators.isRequired('Agency name is required'),
      ],
    },
    DispatchPhone: {
      converter: ukov.converters.phone(),
      validators: [
        ukov.validators.isRequired('Phone number is required'),
      ],
    },
    DispatchAgencyType: {
      validators: [
        ukov.validators.isRequired('Agency type is required'),
      ],
    },
    PermitNumber: {
      validators: [
        ukov.validators.isRequired('Permit number is required'),
      ],
    },
    PermitEffectiveDate: {
      converter: dateConverter,
      validators: [
        ukov.validators.isRequired('Effective date is required'),
      ],
    },
    PermitExpireDate: {
      converter: dateConverter,
      validators: [
        ukov.validators.isRequired('Expiration date is required'),
      ],
    },
  };

  function DispatchAgencyEditorViewModel(options) {
    var _this = this;
    DispatchAgencyEditorViewModel.super_.call(_this, options);

    _this.focusFirst = ko.observable();

    _this.data = ukov.wrap(_this.item || {
      AgencyName: '',
      DispatchPhone: '',
      DispatchAgencyType: null,
      PermitNumber: '',
      PermitEffectiveDate: '',
      PermitExpireDate: '',
    }, schema);
    _this.data.DispatchAgencyTypeCvm = new ComboViewModel({
      selectedValue: _this.data.DispatchAgencyType,
      list: _this.dispatchAgencyTypes,
      fields: _this.dispatchAgencyTypeFields,
      // nullable: true,
    });

    //
    // events
    //
    // _this.cmdCancel = ko.command(function(cb) {
    //   closeLayer(null);
    //   cb();
    // }, function(busy) {
    //   return !busy && !_this.cmdSave.busy();
    // });
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), null, 7);
        cb();
        return;
      }
      var model = _this.data.getValue();
      _this.data.markClean(model, true);
      alert('currently i save nothing...');
      setTimeout(function() {
        cb();
        closeLayer(model);
      }, 5000);
      //@TODO: get correct api path and response format
      // dataservice.boh.boh.save({}, null, utils.safeCallback(null, function(err, resp) {
      //   cb();
      //   closeLayer(resp.Value);
      // }, function(err) {
      //   notify.notify('error', 'Error', err.Message);
      // }));
    }, function(busy) {
      return !busy && !_this.cmdDelete.busy();
    });
    _this.cmdDelete = ko.command(function(cb) {
      alert('currently i delete nothing...');
      setTimeout(function() {
        cb();
        closeLayer(1, true);
      }, 5000);
      //@TODO: get correct api path and response format
      // dataservice.boh.boh.del(_this.data.model.___ID, null, utils.safeCallback(null, function(err, resp) {
      //   cb();
      //   closeLayer(1, true);
      //   closeLayer(resp.Value||1, true);
      // }, function(err) {
      //   notify.notify('error', 'Error', err.Message);
      // }));
    }, function(busy) {
      return !busy && _this.item && !_this.cmdSave.busy();
    });
    _this.busy = ko.computed(function() {
      return _this.cmdSave.busy() || _this.cmdDelete.busy();
    });

    function closeLayer(result, deleted) {
      //@NOTE: command callbacks should be called before calling closeLayer
      if (_this.layer) {
        _this.layer.close(result, deleted);
      }
    }


    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(DispatchAgencyEditorViewModel, BaseViewModel);
  DispatchAgencyEditorViewModel.prototype.viewTmpl = 'tmpl-security-dispatchagency_editor';
  DispatchAgencyEditorViewModel.prototype.width = 600;
  DispatchAgencyEditorViewModel.prototype.height = 'auto';

  DispatchAgencyEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy()) {
      msg = 'Please wait for save to finish.';
    } else if (_this.cmdDelete.busy()) {
      msg = 'Please wait for delete to finish.';
    }
    return msg;
  };

  return DispatchAgencyEditorViewModel;
});
