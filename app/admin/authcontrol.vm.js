define("src/admin/authcontrol.vm", [
  "src/admin/admincache",
  "src/admin/group.editor.vm",
  "src/admin/authcontrol.gvm",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  admincache,
  GroupEditorViewModel,
  AuthControlGridViewModel,
  dataservice,
  ukov,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var schema = {
    _model: true,
    Username: {
      validators: [
        ukov.validators.isRequired("Please enter a username"),
      ],
    },
  };

  function AuthControlViewModel(options) {
    var _this = this;
    AuthControlViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "layersVm",
    ]);
    _this.initFocusFirst();

    _this.data = ukov.wrap({}, schema);
    _this.gvm = new AuthControlGridViewModel({
      edit: function(groupName) {
        _this.clickEditGroup(groupName);
      },
    });

    function updateFilter(filter) {
      _this.gvm.setGroupNames(filter ? _this.userGroups.peek() : []);
    }
    _this.userGroups = ko.observableArray();
    _this.filter = ko.observable(true);
    _this.filter.subscribe(updateFilter);

    //
    // events
    //
    _this.cmdUserGroups = ko.command(function(cb) {
      if (!_this.data.Username.isValid.peek()) {
        notify.warn(_this.data.Username.errMsg.peek(), null, 7);
        return cb();
      }
      var val = _this.data.Username.getValue();
      load_userGroups(val, function(groups) {
        _this.data.Username.markClean(val);
        _this.userGroups(groups);
        updateFilter(_this.filter.peek());
      }, cb);
    });
    _this.clickEditGroup = function(groupName) {
      _this.layersVm.show(new GroupEditorViewModel({
        groupName: groupName,
        groupItems: _this.gvm.getGroupItems(groupName),
      }), function(groupItems) {
        if (groupItems) {
          _this.gvm.setGroupItems(groupName, groupItems);
        }
      });
    };
  }
  utils.inherits(AuthControlViewModel, ControllerViewModel);
  AuthControlViewModel.prototype.viewTmpl = "tmpl-admin-authcontrol";

  AuthControlViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    admincache.ensure("actions", join.add());
    admincache.ensure("applications", join.add());

    var tmpGroupItems;
    load_groupItems(function(list) {
      tmpGroupItems = GroupEditorViewModel.afterGroupItemsLoaded(list);
    }, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.gvm.setItems(tmpGroupItems);
    });
  };

  function load_groupItems(setter, cb) {
    dataservice.api_admin.groupItems.read({}, setter, cb);
  }

  function load_userGroups(username, setter, cb) {
    dataservice.api_admin.users.read({
      id: username,
      link: "groups",
    }, setter, cb);
  }

  return AuthControlViewModel;
});
