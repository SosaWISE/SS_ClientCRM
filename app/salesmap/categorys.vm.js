define("src/salesmap/categorys.vm", [
  "src/salesmap/category.editor.vm",
  "src/salesmap/maphelper",
  "dataservice",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  CategoryEditorViewModel,
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

  function CategorysViewModel(options) {
    var _this = this;
    CategorysViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "layersVm",
      "categoryIcons",
      "categorys",
    ]);
    if (!ko.isObservable(_this.categorys)) {
      throw new Error("categorys is not observable");
    }

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      _this.deleted = false;
      closeLayer(_this);
    };

    _this.cmdNewCategory = ko.command(function(cb) {
      showCategoryEditor(_this, null, cb);
    });
    _this.cmdEditCategory = ko.command(function(cb, item) {
      showCategoryEditor(_this, item, cb);
    });

    _this.idToDelete = ko.observable();
    _this.startDelete = function(item) {
      _this.idToDelete(item.ID);
    };
    _this.cancelDelete = function() {
      _this.idToDelete(-1);
    };
    _this.deleteCategory = function() {
      var id = _this.idToDelete.peek();
      // remove from list
      _this.categorys.removeById(id);
      //
      _this.cancelDelete();
      // actually delete it
      dataservice.api_sales.categorys.del({
        id: id,
      }, null, notify.iferror);
    };
  }
  utils.inherits(CategorysViewModel, BaseViewModel);
  CategorysViewModel.prototype.viewTmpl = "tmpl-salesmap-categorys";
  CategorysViewModel.prototype.width = "88%";
  CategorysViewModel.prototype.height = "80%";

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  CategorysViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult, _this.deleted];
  };

  function showCategoryEditor(_this, item, cb) {
    var vm = new CategoryEditorViewModel({
      item: utils.clone(item),
      categoryIcons: _this.categoryIcons,
    });
    var id = (item) ? item.ID : null;
    _this.layersVm.show(vm, function(item, deleted) {
      // update categorys
      if (deleted) {
        _this.categorys.removeById(id);
      } else if (item) {
        _this.categorys.updateItem(item);
      }
      cb();
    });
  }

  return CategorysViewModel;
});
