define("src/scheduler/tech.setup.vm", [
  "src/scheduler/scheduler-cache",
  "src/scheduler/techschedule.vm",
  "src/scheduler/techskills.vm",
  "jquery",
  "src/dataservice",
  "ko",
  "src/ukov",
  "src/core/joiner",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/controller.vm",
], function(
  schedulercache,
  TechScheduleViewModel,
  TechSkillsViewModel,
  jquery,
  dataservice,
  ko,
  ukov,
  joiner,
  strings,
  notify,
  utils,
  ControllerViewModel
) {
  "use strict";

  var schema = {
    _model: true,

    ID: {}, // long
    IsDeleted: {}, // bool
    Version: {}, // int
    RecruitId: {}, // int?
    StartLocation: {}, // string
    StartLocLatitude: {}, // double
    StartLocLongitude: {}, // double
    MaxRadius: {}, // int
  };

  //
  //
  //
  function TechSetupViewModel(options) {
    var _this = this;
    TechSetupViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      "item",
      "allSkills",
    ]);

    _this.data = ukov.wrap(_this.item, schema);
    _this.editing = ko.observable(false);
    _this.scheduleVm = new TechScheduleViewModel({
      editing: _this.editing,
    });
    _this.skillsVm = new TechSkillsViewModel({
      editing: _this.editing,
      allSkills: _this.allSkills,
    });

    _this.vmList = [_this, _this.scheduleVm, _this.skillsVm];
    _this.isClean = ko.computed(function() {
      return _this.vmList.every(function(vm) {
        return vm.data.isClean();
      });
    });

    //
    // events
    //
    _this.clickEdit = function() {
      _this.editing(true);
    };
    _this.clickCancel = function() {
      if (!_this.isClean()) {
        notify.confirm("Reset changes?", "There are unsaved changes. Click yes to undo these changes.", function(result) {
          if (result !== "yes") {
            return;
          }
          resetData(_this.vmList);
          _this.editing(false);
        });
      } else {
        _this.editing(false);
      }
    };
    _this.cmdSave = ko.command(function(cb) {
      saveAllData(_this, cb);
    }, function(busy) {
      return !busy && _this.editing();
    });

    _this.busy = ko.computed(function() {
      return _this.loading() || _this.cmdSave.busy();
    });

    _this.vms = [ // nested view models
      _this.scheduleVm,
      _this.skillsVm,
    ];
  }

  utils.inherits(TechSetupViewModel, ControllerViewModel);
  TechSetupViewModel.prototype.viewTmpl = "tmpl-scheduler-tech_setup";

  //
  // members
  //

  TechSetupViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me
    var _this = this;

    routeData = {
      id: _this.data.model.ID,
    };
    _this.vms.forEach(function(vm) {
      vm.load(routeData, extraData, join.add());
    });
    // loadVmList(_this, join);
  };

  // function loadVmList(_this, join) {
  //   var routeData = {
  //     id: _this.data.model.ID,
  //   };
  //   var extraData = {};
  //   _this.vmList.forEach(function(vm) {
  //     if (vm === _this) {
  //       // do not reload this vm since it is already loading
  //       return;
  //     }
  //     vm.load(routeData, extraData, join.add());
  //   });
  // }

  function saveAllData(_this, cb) {
    if (!isValidPeek(_this.vmList)) {
      notify.warn(errMsgPeek(_this.vmList), null, 7);
      return cb();
    }

    saveTech(_this, function(err) {
      if (err) {
        return cb(err);
      }

      var join = joiner();
      var techid = _this.data.model.ID;
      _this.vmList.forEach(function(vm) {
        if (utils.isFunc(vm.saveData)) {
          vm.techid = techid;
          vm.saveData(join.add());
        }
      });

      join.when(function(err) {
        if (!err) {
          // end editing
          _this.editing(false);
        }
        cb(err);
      });
    });
  }

  function saveTech(_this, cb) {
    if (_this.data.isClean() && _this.data.model.ID) {
      // only save if dirty and not new
      return cb();
    }

    var model = _this.data.getValue();
    // ensure RecruitId is set (in case of new tech)
    if (!model.RecruitId) {
      model.RecruitId = _this.recruitid;
    }
    //
    dataservice.ticketsrv.techs.save({
      id: model.ID || "", // if not set then create, else update
      data: model,
    }, function(data) {
      _this.data.setValue(data);
      _this.data.markClean(data, true);
    }, cb);
  }


  function isValidPeek(vmList) {
    return vmList.every(function(vm) {
      return vm.data.isValid.peek();
    });
  }

  function errMsgPeek(vmList) {
    var err;
    vmList.some(function(vm) {
      err = vm.data.errMsg.peek();
      return err;
    });
    return err;
  }

  function resetData(vmList) {
    vmList.forEach(function(vm) {
      vm.data.reset(true);
    });
  }

  return TechSetupViewModel;
});
