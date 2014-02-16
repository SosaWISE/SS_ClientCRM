define('src/scrum/story.editor.vm', [
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

    StoryTypeId: {},
    Name: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Name is required'),
      ],
    },
    Description: {},
    Points: {
      converter: intConverter,
    },
    PersonId: {},
    SprintId: {},
    EpicId: {},

    SortOrder: {
      converter: intConverter,
    },

    IsDeleted: {},
    Version: {},
  };

  function StoryEditorViewModel(options) {
    var _this = this;
    StoryEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['epics']);

    _this.title = (_this.item ? 'Edit' : 'New') + ' Story';
    _this.data = ukov.wrap(_this.item || {
      EpicId: _this.epicId,
      StoryTypeId: 1,
      Name: '',
      Description: '',
      Points: null,
      PersonId: null,
      SprintId: null,
      SortOrder: null,
      IsDeleted: false,
      Version: 1,
    }, schema);
    _this.data.StoryTypeCvm = new ComboViewModel({
      selectedValue: _this.data.StoryTypeId,
      list: _this.storyTypeOptions,
    });
    _this.data.PointsCvm = new ComboViewModel({
      selectedValue: _this.data.Points,
      list: _this.pointOptions,
      nullable: true,
    });
    _this.data.PersonCvm = new ComboViewModel({
      selectedValue: _this.data.PersonId,
      list: [],
      nullable: true,
    });
    _this.data.SprintCvm = new ComboViewModel({
      selectedValue: _this.data.SprintId,
      list: [],
      nullable: true,
    });
    _this.data.EpicCvm = new ComboViewModel({
      selectedValue: _this.data.EpicId,
      list: _this.epics,
      fields: {
        value: 'ID',
        text: 'Name',
      },
      nullable: true,
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
  utils.inherits(StoryEditorViewModel, BaseViewModel);
  StoryEditorViewModel.prototype.viewTmpl = 'tmpl-scrum_story_editor';
  StoryEditorViewModel.prototype.width = 400;
  StoryEditorViewModel.prototype.height = 'auto';

  StoryEditorViewModel.prototype.save = function(cb) {
    var _this = this,
      model;
    if (!_this.data.isValid()) {
      notify.notify('warn', _this.data.errMsg(), 7);
      cb();
      return;
    }

    model = _this.data.getValue();
    _this.data.markClean(model, true);
    dataservice.scrum.storys.save(model, null, function(err, resp) {
      if (err) {
        notify.notify('error', err.Message);
      } else if (_this.layer) {
        _this.layer.close(resp.Value);
      }
      cb(resp.Value);
    });
  };

  StoryEditorViewModel.prototype.storyTypeOptions = [
    {
      value: 1,
      text: 'Story',
    },
    {
      value: 2,
      text: 'Bug',
    },
  ];
  StoryEditorViewModel.prototype.pointOptions = [
    {
      value: 0,
      text: '0',
    },
    {
      value: 0.5,
      text: '0.5',
    },
    {
      value: 1,
      text: '1',
    },
    {
      value: 2,
      text: '2',
    },
    {
      value: 3,
      text: '3',
    },
    {
      value: 5,
      text: '5',
    },
    {
      value: 8,
      text: '8',
    },
    {
      value: 13,
      text: '13',
    },
    {
      value: 20,
      text: '20',
    },
    {
      value: 40,
      text: '40',
    },
  ];

  return StoryEditorViewModel;
});
