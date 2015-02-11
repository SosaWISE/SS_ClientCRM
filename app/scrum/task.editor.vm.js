define("src/scrum/task.editor.vm", [
  "src/scrum/scrum-cache",
  "src/dataservice",
  "src/core/combo.vm",
  "src/ukov",
  "ko",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  scrumcache,
  dataservice,
  ComboViewModel,
  ukov,
  ko,
  strings,
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
    Points: {
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
    // utils.assertProps(_this, [
    // ]);
    if (!_this.ParentId && !_this.item) {
      throw new Error("a ParentId or an item is required");
    }

    _this.item = _this.item || {
      ParentId: _this.ParentId,
      Name: "",
      PersonId: null,
      Points: null,
      StepId: 1,
      SortOrder: null,
      IsDeleted: false,
      Version: 1,
    };

    _this.title = (_this.item ? "Edit" : "New") + " Task";
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap(_this.item, schema);
    _this.data.PersonCvm = new ComboViewModel({
      nullable: true,
      selectedValue: _this.data.PersonId,
      list: scrumcache.getList("persons").peek(),
      fields: {
        value: "ID",
        text: function(item) {
          return strings.format("{0} {1}", item.FirstName, item.LastName);
        },
      },
    });
    _this.data.StepCvm = new ComboViewModel({
      selectedValue: _this.data.StepId,
      list: scrumcache.getList("tasksteps").peek(),
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

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  TaskEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, _this.isDeleted];
  };
  TaskEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };

  TaskEditorViewModel.prototype.save = function(cb) {
    var _this = this,
      model;
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      return cb();
    }

    model = _this.data.getValue();
    dataservice.scrum.tasks.save(model, function(val) {
      _this.data.markClean(val, true);
      _this.layerResult = val;
      closeLayer(_this);
    }, cb);
  };

  return TaskEditorViewModel;
});
