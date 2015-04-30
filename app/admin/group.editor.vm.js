define("src/admin/group.editor.vm", [
  "src/admin/admincache",
  "src/core/multiselect.vm",
  "src/core/notify",
  "src/core/utils",
  "src/core/combo.vm",
  "ko",
  // "src/ukov",
  "src/dataservice",
  "src/core/strings",
  "src/core/joiner",
  "src/core/base.vm",
], function(
  admincache,
  MultiSelectViewModel,
  notify,
  utils,
  ComboViewModel,
  ko,
  // ukov,
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
      "groupActionItems",
    ]);
    _this.mixinLoad();
    _this.initFocusFirst();

    _this.actionsMsvm = new MultiSelectViewModel({});
    _this.appsMsvm = new MultiSelectViewModel({});

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };

    _this.cmdSave = ko.command(function(cb) {
      saveGroupActionItems(_this, cb);
    }, function(busy) {
      return !busy;
    });
  }
  utils.inherits(GroupEditorViewModel, BaseViewModel);
  GroupEditorViewModel.prototype.viewTmpl = "tmpl-admin-group_editor";
  GroupEditorViewModel.prototype.width = 800;
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
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };
  GroupEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    admincache.ensure("actions", join.add());
    admincache.ensure("applications", join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      //
      _this.actionsMsvm.list(admincache.getList("actions").peek());
      _this.appsMsvm.list(admincache.getList("applications").peek());
      //
      function toRefId(item) {
        return item.RefId;
      }
      _this.actionsMsvm.selectedValues(_this.groupActionItems.filter(function(item) {
        return item.RefType === "Actions" && !item.IsDeleted;
      }).map(toRefId));
      _this.appsMsvm.selectedValues(_this.groupActionItems.filter(function(item) {
        return item.RefType === "Applications" && !item.IsDeleted;
      }).map(toRefId));
    });
  };

  function saveGroupActionItems(_this, cb) {
    var selectedValues = []
      .concat(_this.actionsMsvm.selectedValues.peek())
      .concat(_this.appsMsvm.selectedValues.peek());
    var selectedMap = {};
    selectedValues.forEach(function(refId) {
      selectedMap[refId] = true;
    });
    //
    var itemMap = {};
    _this.groupActionItems.forEach(function(item) {
      itemMap[item.RefId] = item;
    });

    // find groups that have changed
    function tryAddToChangedList(refType, refId) {
      var isDeleted = !selectedMap[refId];
      var item = itemMap[refId];
      if (!item) {
        if (isDeleted) {
          // do not create if it is just going to be deleted
          return;
        }
        // add new
        item = {
          // ID: 0,
          GroupName: _this.groupName,
          RefType: refType,
          RefId: refId,
          IsDeleted: false,
          ModifiedOn: new Date(),
        };
      } else if (item.IsDeleted === isDeleted) {
        // item is not changing
        return;
      }
      // set deleted
      item.IsDeleted = isDeleted;
      changedList.push(item);
    }
    var changedList = [];
    _this.actionsMsvm.list.peek().forEach(function(wrapped) {
      tryAddToChangedList("Actions", wrapped.item.ID);
    });
    _this.appsMsvm.list.peek().forEach(function(wrapped) {
      tryAddToChangedList("Applications", wrapped.item.ID);
    });

    if (!changedList.length) {
      // nothing to save
      cb(); // call callback and then cancel
      return _this.clickCancel();
    }

    dataservice.api_admin.groupActionItems.save({
      id: _this.groupName,
      data: changedList,
    }, function(list) {
      _this.layerResult = GroupEditorViewModel.afterGroupActionItemsLoaded(list);
      closeLayer(_this);
    }, cb);
  }

  GroupEditorViewModel.afterGroupActionItemsLoaded = function(groupActionItems) {
    groupActionItems.forEach(function(item) {
      item.sid = item.RefType.substr(0, 3) + item.ID;
      // item.sid = item.RefType + ":" + item.ID;
    });
    return groupActionItems;
  };

  return GroupEditorViewModel;
});
