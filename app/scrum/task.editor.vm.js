define('src/scrum/task.editor.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/ukov',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
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
    StoryId: {},

    Name: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Name is required'),
      ],
    },
    PersonId: {},
    Hours: {
      converter: ukov.converters.number(2),
      validators: [],
    },
    TaskStepId: {},

    SortOrder: {
      converter: intConverter,
    },

    IsDeleted: {},
    Version: {},
  };

  function TaskEditorViewModel(options) {
    var _this = this;
    TaskEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['taskSteps']);
    if (!_this.storyId && !_this.item) {
      throw new Error('a storyId or an item is required');
    }

    _this.title = (_this.item ? 'Edit' : 'New') + ' Task';
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap(_this.item || {
      StoryId: _this.storyId,
      Name: '',
      PersonId: null,
      Hours: null,
      TaskStepId: 1,
      SortOrder: null,
      IsDeleted: false,
      Version: 1,
    }, schema);
    _this.data.PersonCvm = new ComboViewModel({
      selectedValue: _this.data.PersonId,
      list: [],
      nullable: true,
    });
    _this.data.TaskStepCvm = new ComboViewModel({
      selectedValue: _this.data.TaskStepId,
      list: _this.taskSteps,
      fields: {
        value: 'ID',
        text: 'Name',
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
  TaskEditorViewModel.prototype.viewTmpl = 'tmpl-scrum_task_editor';
  TaskEditorViewModel.prototype.width = 400;
  TaskEditorViewModel.prototype.height = 'auto';

  TaskEditorViewModel.prototype.save = function(cb) {
    var _this = this,
      model;
    if (!_this.data.isValid()) {
      notify.notify('warn', _this.data.errMsg(), 7);
      cb();
      return;
    }

    model = _this.data.getValue();
    _this.data.markClean(model, true);
    dataservice.scrum.tasks.save(model, null, function(err, resp) {
      if (err) {
        notify.notify('error', err.Message);
      } else if (_this.layer) {
        _this.layer.close(resp.Value);
      }
      cb(resp.Value);
    });
  };

  return TaskEditorViewModel;
});
