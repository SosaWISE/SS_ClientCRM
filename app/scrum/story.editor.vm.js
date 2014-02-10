define('src/scrum/story.editor.vm', [
  'src/core/combo.vm',
  'src/ukov',
  'ko',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ComboViewModel,
  ukov,
  ko,
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
    BaseViewModel.ensureProps(_this, []);

    _this.title = (options.item ? 'Edit' : 'New') + ' Story';
    _this.data = ukov.wrap(options.item || {
      StoryTypeId: 1,
      Name: '',
      Description: '',
      Points: null,
      PersonId: null,
      SprintId: null,
      EpicId: null,
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
    _this.clickClose = function() {
      if (_this.layer) {
        _this.layer.close(null);
      }
    };
    _this.cmdSave = ko.command(function(cb) {
      if (_this.layer) {
        _this.layer.close(_this.data.getValue());
      }
      cb();
    });
  }
  utils.inherits(StoryEditorViewModel, BaseViewModel);
  StoryEditorViewModel.prototype.viewTmpl = 'tmpl-scrum_story_editor';
  StoryEditorViewModel.prototype.width = 400;
  StoryEditorViewModel.prototype.height = 'auto';

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
