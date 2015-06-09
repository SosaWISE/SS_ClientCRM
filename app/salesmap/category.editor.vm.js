define("src/salesmap/category.editor.vm", [
  "src/salesmap/maphelper",
  "dataservice",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  maphelper,
  dataservice,
  ko,
  ukov,
  strings,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var intConverter = ukov.converters.number(0);
  var schema = {
    _model: true,
    ID: {
      converter: intConverter,
    },
    Name: {
      validators: [
        ukov.validators.isRequired("Missing a category name"),
      ],
    },
    Filename: {
      validators: [
        ukov.validators.isRequired("Missing a category icon"),
      ],
    },
  };

  function CategoryEditorViewModel(options) {
    var _this = this;
    CategoryEditorViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "categoryIcons",
    ]);
    _this.initFocusFirst();

    _this.data = ukov.wrap(_this.item || {}, schema);

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      _this.deleted = false;
      closeLayer(_this);
    };
    // Save a new contact
    _this.cmdSave = ko.command(function(cb) {
      saveCategory(_this, function(val) {
        // val = val.results; // id
        _this.layerResult = val;
        _this.deleted = false;
        closeLayer(_this);
      }, cb);
    });
    _this.cmdDelete = ko.command(function(cb) {
      deleteCategory(_this, function() {
        _this.layerResult = null;
        _this.deleted = true;
        closeLayer(_this);
      }, cb);
    }, function(busy) {
      return !busy && !!_this.data.ID();
    });
    _this.clickIcon = function(icon) {
      _this.data.Filename(icon.ID);
    };
  }
  utils.inherits(CategoryEditorViewModel, BaseViewModel);
  CategoryEditorViewModel.prototype.viewTmpl = "tmpl-salesmap-category_editor";
  CategoryEditorViewModel.prototype.width = "88%";
  CategoryEditorViewModel.prototype.height = "80%";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  CategoryEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, _this.deleted];
  };
  CategoryEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = "Please wait for save to finish.";
    } else if (_this.cmdDelete.busy() && !_this.deleted) {
      msg = "Please wait for delete to finish.";
    }
    return msg;
  };

  function saveCategory(_this, setter, cb) {
    if (!_this.data.isValid.peek()) {
      notify.warn(_this.data.errMsg.peek(), null, 5);
      return cb();
    }
    var model = _this.data.getValue();
    model.ID = model.ID || 0;
    dataservice.api_sales.categorys.save({
      id: model.ID || "",
      data: model,
    }, setter, cb);
  }

  function deleteCategory(_this, setter, cb) {
    dataservice.api_sales.categorys.save({
      id: _this.data.ID.getValue(),
    }, setter, cb);
  }

  return CategoryEditorViewModel;
});
