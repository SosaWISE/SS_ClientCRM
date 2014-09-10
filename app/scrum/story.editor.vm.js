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
    strConverter = ukov.converters.string();

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
    Points: {},
    PersonId: {},
    ProjectOrder: {},

    IsDeleted: {},
    Version: {},
  };

  function StoryEditorViewModel(options) {
    var _this = this;
    StoryEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, []);

    _this.title = (_this.item ? 'Edit' : 'New') + ' Story';
    _this.data = ukov.wrap(_this.item || {
      StoryTypeId: 1,
      Name: '',
      Description: '',
      Points: null,
      PersonId: null,
      ProjectOrder: null,
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

    //
    // events
    //
    _this.cmdSave = ko.command(function(cb) {
      _this.save(cb);
    });
    _this.cmdClose = ko.command(function(cb) {
      closeLayer(_this);
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
  StoryEditorViewModel.prototype.width = 800;
  StoryEditorViewModel.prototype.height = 'auto';


  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  StoryEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, _this.isDeleted];
  };
  StoryEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = 'Please wait for save to finish.';
    }
    return msg;
  };

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
      }
      _this.layerResult = resp.Value;
      closeLayer(_this);
      cb(resp.Value);
    });
  };

  StoryEditorViewModel.prototype.storyTypeOptions = [ //
    {
      value: 1,
      text: 'Story',
    }, {
      value: 2,
      text: 'Bug',
    },
  ];
  StoryEditorViewModel.prototype.pointOptions = [ //
    {
      value: 0,
      text: '0',
    }, {
      value: 0.5,
      text: '0.5',
    }, {
      value: 1,
      text: '1',
    }, {
      value: 2,
      text: '2',
    }, {
      value: 3,
      text: '3',
    }, {
      value: 5,
      text: '5',
    }, {
      value: 8,
      text: '8',
    }, {
      value: 13,
      text: '13',
    }, {
      value: 20,
      text: '20',
    }, {
      value: 40,
      text: '40',
    },
  ];

  return StoryEditorViewModel;
});
