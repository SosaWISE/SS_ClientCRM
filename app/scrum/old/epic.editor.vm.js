define('src/scrum/epic.editor.vm', [
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
    Name: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Name is required'),
      ],
    },
    ParentId: {},
    SortOrder: {
      converter: intConverter,
    },
    Version: {},
  };

  function EpicEditorViewModel(options) {
    var _this = this;
    EpicEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['epics']);

    _this.title = (_this.item ? 'Edit' : 'New') + ' Epic';
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap(_this.item || {
      Name: '',
      ParentId: _this.parentId,
      SortOrder: null,
      Version: 1,
    }, schema);
    _this.data.ParentCvm = new ComboViewModel({
      selectedValue: _this.data.ParentId,
      list: _this.epics, //@TODO: exclude self
      fields: {
        value: 'ID',
        text: 'Name',
      },
      nullable: true,
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
  utils.inherits(EpicEditorViewModel, BaseViewModel);
  EpicEditorViewModel.prototype.viewTmpl = 'tmpl-scrum_epic_editor';
  EpicEditorViewModel.prototype.width = 400;
  EpicEditorViewModel.prototype.height = 'auto';

  EpicEditorViewModel.prototype.save = function(cb) {
    var _this = this,
      model;
    if (!_this.data.isValid()) {
      notify.notify('warn', _this.data.errMsg(), 7);
      cb();
      return;
    }

    model = _this.data.getValue();
    _this.data.markClean(model, true);
    dataservice.scrum.epics.save(model, null, function(err, resp) {
      if (err) {
        notify.notify('error', err.Message);
      } else if (_this.layer) {
        _this.layer.close(resp.Value);
      }
      cb(resp.Value);
    });
  };

  return EpicEditorViewModel;
});
