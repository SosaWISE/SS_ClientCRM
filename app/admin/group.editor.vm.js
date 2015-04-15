define("src/admin/group.editor.vm", [
  "src/core/multiselect.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/combo.vm",
  "ko",
  "src/ukov",
  "src/dataservice",
  "src/core/strings",
  "src/core/joiner",
  "src/core/base.vm",
], function(
  MultiSelectViewModel,
  notify,
  utils,
  ComboViewModel,
  ko,
  ukov,
  dataservice,
  strings,
  joiner,
  BaseViewModel
) {
  "use strict";

  function GroupEditorViewModel(options) {
    var _this = this;
    GroupEditorViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "groupName",
      "groupItems",
      "allActions",
      "allApplications",
    ]);
    _this.initFocusFirst();

    _this.data = ukov.wrap({
      groupActions: [],
      groupApplications: [],
    }, {
      _model: true,
      groupActions: {},
      groupApplications: {},
    });

    _this.actionsMsvm = new MultiSelectViewModel({
      selectedValues: _this.data.groupActions,
      list: _this.allActions,
      fields: {
        id: "ActionID",
      }
    });
    _this.appsMsvm = new MultiSelectViewModel({
      selectedValues: _this.data.groupApplications,
      list: _this.allApplications,
      fields: {
        id: "ApplicationID",
      }
    });

    _this.layerResult = {
      groupActions: _this.groupItems.filter(function(item) {
        return item.RefType === "Actions";
      }),
      groupApplications: _this.groupItems.filter(function(item) {
        return item.RefType === "Applications";
      }),
    };


    var val;
    //
    val = _this.layerResult.groupActions.map(toRefId);
    _this.actionsMsvm.selectedValues(val);
    _this.actionsMsvm.selectedValues.markClean(val, true);
    //
    val = _this.layerResult.groupApplications.map(toRefId);
    _this.appsMsvm.selectedValues(val);
    _this.appsMsvm.selectedValues.markClean(val, true);


    //
    // events
    //
    _this.clickCancel = function() {
      closeLayer(_this);
    };

    _this.cmdSave = ko.command(function(cb) {
      saveData(_this, _this.groupName, cb);
    }, function(busy) {
      return !busy;
    });
  }
  utils.inherits(GroupEditorViewModel, BaseViewModel);
  GroupEditorViewModel.prototype.viewTmpl = "tmpl-admin-group_editor";
  GroupEditorViewModel.prototype.width = 350;
  GroupEditorViewModel.prototype.height = "auto";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  GroupEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  GroupEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy()) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };

  function saveData(_this, groupName, cb) {
    if (!_this.data.isValid.peek()) {
      notify.warn(_this.data.errMsg.peek(), null, 7);
      return cb();
    }

    var join = joiner();
    saveGroupData(_this.actionsMsvm, "groupActions", groupName, function(val) {
      _this.layerResult.groupActions = GroupEditorViewModel.afterGroupItemsLoaded("act", val);
    }, join.add());
    saveGroupData(_this.appsMsvm, "groupApplications", groupName, function(val) {
      _this.layerResult.groupApplications = GroupEditorViewModel.afterGroupItemsLoaded("app", val);
    }, join.add());

    join.when(function(err) {
      if (err) {
        return cb(err);
      }
      cb();
      closeLayer(_this);
    });
  }

  function saveGroupData(msvm, name, groupName, setter, cb) {
    var data = msvm.selectedValues;
    // if (data.isClean()) {
    //   // nothing to save
    //   return cb();
    // }

    var list = data.getValue();
    dataservice.api_admin[name].save({
      id: groupName,
      data: list,
    }, function(val) {
      // call setter for layerResult
      setter(val);
      // set
      val = val.map(toRefId);
      data.setValue(val);
      data.markClean(val, true);
    }, cb);
  }

  function toRefId(item) {
    return item.RefId;
  }

  GroupEditorViewModel.afterGroupItemsLoaded = function(prefix, groupItems) {
    groupItems.forEach(function(item) {
      item.sid = prefix + item.ID;
    });
    return groupItems;
  };

  return GroupEditorViewModel;
});
