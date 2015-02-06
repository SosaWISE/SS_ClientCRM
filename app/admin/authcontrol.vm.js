define("src/admin/authcontrol.vm", [
  "src/admin/group.editor.vm",
  "src/admin/authcontrol.gvm",
  "src/dataservice",
  "src/ukov",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
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
        allActions: _this.actions,
        allApplications: _this.applications,
      }), function(result) {
        if (result) {
          _this.gvm.setGroupItems(groupName, result.groupActions.concat(result.groupApplications));
        }
      });
    };
  }
  utils.inherits(AuthControlViewModel, ControllerViewModel);
  AuthControlViewModel.prototype.viewTmpl = "tmpl-admin-authcontrol";

  AuthControlViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    load_admin_list("actions", function(val) {
      _this.actions = val;
    }, join.add());
    load_admin_list("applications", function(val) {
      _this.applications = val;
    }, join.add());
    load_admin_list("groupActions", function(val) {
      _this.groupActions = GroupEditorViewModel.afterGroupItemsLoaded("act", val);
    }, join.add());
    load_admin_list("groupApplications", function(val) {
      _this.groupApplications = GroupEditorViewModel.afterGroupItemsLoaded("app", val);
    }, join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.gvm.setItems(_this.groupActions.concat(_this.groupApplications));
    });
  };

  function load_admin_list(name, setter, cb) {
    dataservice.adminsrv[name].read({}, setter, cb);
  }

  function load_userGroups(username, setter, cb) {
    dataservice.adminsrv.users.read({
      id: username,
      link: "groups",
    }, setter, cb);
  }

  return AuthControlViewModel;
});
