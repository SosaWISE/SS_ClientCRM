define("src/scrum/task.editor.vm", [
  "src/scrum/scrum-cache",
  "src/dataservice",
  "src/core/combo.vm",
  "src/ukov",
  "ko",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  scrumcache,
  dataservice,
  ComboViewModel,
  ukov,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema,
    strConverter = ukov.converters.string(),
    intConverter = ukov.converters.number(0);

  schema = {
    _model: true,

    ID: {},
    ParentId: {},

    Name: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired("Name is required"),
      ],
    },
    PersonId: {},
    Hours: {
      converter: ukov.converters.number(2),
      validators: [],
    },
    StepId: {},

    SortOrder: {
      converter: intConverter,
    },

    IsDeleted: {},
    Version: {},
  };

  function TaskEditorViewModel(options) {
    var _this = this;
    TaskEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      // "taskSteps"
    ]);
    if (!_this.ParentId && !_this.item) {
      throw new Error("a ParentId or an item is required");
    }
    _this.mixinLoad();

    _this.title = (_this.item ? "Edit" : "New") + " Task";
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap(_this.item || {
      ParentId: _this.ParentId,
      Name: "",
      PersonId: null,
      Hours: null,
      StepId: 1,
      SortOrder: null,
      IsDeleted: false,
      Version: 1,
    }, schema);
    _this.data.PersonCvm = new ComboViewModel({
      selectedValue: _this.data.PersonId,
      list: [],
      nullable: true,
    });
    _this.data.StepCvm = new ComboViewModel({
      selectedValue: _this.data.StepId,
      // list: _this.taskSteps,
      fields: {
        value: "ID",
        text: "Name",
      },
    });


    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to actually focusFirst
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

    //
    // events
    //
    _this.cmdSave = ko.command(function(cb) {
      _this.save(cb);
    });
    _this.cmdClose = ko.command(function(cb) {
      if (_this.layer) {
        _this.layer.close(null);
      }
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy();
    });
  }
  utils.inherits(TaskEditorViewModel, BaseViewModel);
  TaskEditorViewModel.prototype.viewTmpl = "tmpl-scrum_task_editor";
  TaskEditorViewModel.prototype.width = 400;
  TaskEditorViewModel.prototype.height = "auto";

  TaskEditorViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this;

    scrumcache.ensure("tasksteps", join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.data.StepCvm.setList(scrumcache.getList("tasksteps").peek());
    });
  };

  TaskEditorViewModel.prototype.save = function(cb) {
    var _this = this,
      model;
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
      return;
    }

    model = _this.data.getValue();
    _this.data.markClean(model, true);
    dataservice.scrum.tasks.save(model, null, function(err, resp) {
      if (err) {
        notify.error(err);
      } else if (_this.layer) {
        _this.layer.close(resp.Value);
      }
      cb(resp.Value);
    });
  };

  return TaskEditorViewModel;
});
