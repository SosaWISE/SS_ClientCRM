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

  var schema;

  schema = {
    _model: true,

    ID: {},

    StoryTypeId: {},
    Name: {
      converter: ukov.converters.string(),
      validators: [
        ukov.validators.isRequired('Name is required'),
      ],
    },
    Description: {},
    Points: {
      validators: [
        //
        function(val, model) {
          if (val == null && model.strictValidation) {
            return 'Points is required';
          }
        },
      ],
    },
    PersonId: {},
    SortOrder: {
      converter: ukov.converters.number(0),
    },

    IsDeleted: {},
    Version: {},
  };

  function StoryEditorViewModel(options) {
    var _this = this;
    StoryEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, []);

    _this.item = _this.item || {
      StoryTypeId: 1,
      Name: '',
      Description: '',
      Points: null,
      PersonId: null,
      SortOrder: null,
      IsDeleted: false,
      Version: 1,
    };
    _this.item.strictValidation = _this.strictValidation || (_this.item.Points != null);

    _this.title = (_this.item.sid ? _this.item.sid.toUpperCase() : 'New Story');
    _this.data = ukov.wrap(_this.item, schema);
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
      notify.warn(_this.data.errMsg(), null, 7);
      cb(_this.data.errMsg(), null);
      return;
    }

    model = _this.data.getValue();
    dataservice.scrum.storys.save(model, null, utils.safeCallback(cb, function(err, resp) {
      _this.data.markClean(model, true);
      _this.layerResult = resp.Value;
      closeLayer(_this);
    }, notify.error));
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
