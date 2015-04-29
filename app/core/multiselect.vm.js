define("src/core/multiselect.vm", [
  "ko",
  "src/core/jsonhelpers",
  "src/core/strings",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ko,
  jsonhelpers,
  strings,
  utils,
  BaseViewModel
) {
  "use strict";

  function MultiSelectViewModel(options) {
    var _this = this;
    MultiSelectViewModel.super_.call(_this, options);

    _this.isOpen = ko.observable(false);

    function updateSelected() {
      if (updatingSelected) {
        return;
      }
      updatingSelected = true;
      //
      var checkedTexts = [];
      var selectedValues = [];
      items.peek().forEach(function(item) {
        if (item.checked.peek()) {
          checkedTexts.push(item.text);
          selectedValues.push(item.id);
        }
      });
      _this.selectedText(checkedTexts.join(", "));
      _this.selectedValues(selectedValues);
      //
      updatingSelected = false;
    }
    var updatingSelected = false;
    _this.selectedText = ko.observable();
    if (!_this.selectedValues || !ko.isObservable(_this.selectedValues)) {
      _this.selectedValues = ko.observable(_this.selectedValues || []);
    }

    // ensure fields property exists
    var fields = _this.fields || {};
    fields.id = fields.id || "ID";
    fields.text = fields.text || "Name";

    var idsCheckedMap = {};
    var items = ko.observableArray();
    _this.list = ko.computed({
      deferEvaluation: true,
      read: function() {
        return items();
      },
      write: function(list) {
        // map list to items
        items(list.map(function(item) {
          if (!(fields.id in item)) {
            throw new Error("no `" + fields.id + "` field: " + jsonhelpers.stringify(item));
          }
          var id = ko.unwrap(item[fields.id]);
          //
          var text;
          if (utils.isFunc(fields.text)) { // text field can be a format function
            text = fields.text(item);
          } else if (!(fields.text in item)) {
            throw new Error("no `" + fields.text + "` field: " + jsonhelpers.stringify(item));
          } else {
            text = ko.unwrap(item[fields.text]);
          }
          //
          return {
            item: item,
            id: id,
            text: text,
            checked: ko.observable(idsCheckedMap[id] || false),
          };
        }));
        //
        updateSelected();
      },
    });

    /*
      // _this.selectedIds = ko.computed({
      //   deferEvaluation: true,
      //   read: function() {
      //     idsCheckedMap = {}; // clear map
      //     _this.list().forEach(function(item) { // subscribe to list
      //       if (item.checked()) { // subscribe to checked
      //         idsCheckedMap[item.id] = true;
      //       }
      //     });
      //     return Object.keys(idsCheckedMap);
      //   },
      //   write: function(values) {
      //     idsCheckedMap = {}; // clear map
      //     values.forEach(function(val) {
      //       idsCheckedMap[val] = true;
      //     });
      //     //
      //     items.forEach(function(item) {
      //       item.checked(idsCheckedMap[item.id] || false);
      //     });
      //     //
      //     updateSelected();
      //   },
      // });
    */
    function selectedValuesChanged(values) {
      idsCheckedMap = {}; // clear map
      values.forEach(function(val) {
        idsCheckedMap[val] = true;
      });
      //
      items.peek().forEach(function(item) {
        item.checked(idsCheckedMap[item.id] || false);
      });
      //
      updateSelected();
    }
    _this.selectedValues.subscribe(selectedValuesChanged);


    //
    // events
    //
    _this.toggleOpen = function() {
      _this.isOpen(!_this.isOpen.peek());
    };
    _this.toggleChecked = function(vm) {
      vm.checked(!vm.checked.peek());
      //
      updateSelected();
    };
    _this.keydownToggleOpen = function(vm, evt) {
      var keyCode = evt.keyCode;
      switch (keyCode) {
        case 9: // tab
        case 229: // see combo.vm.js
          return true; // do default action
      }
      _this.toggleOpen(vm);
      return false;
    };


    // init
    if (options && options.list) {
      _this.list(options.list);
    }
    selectedValuesChanged(_this.selectedValues.peek());
  }
  utils.inherits(MultiSelectViewModel, BaseViewModel);
  MultiSelectViewModel.prototype.viewTmpl = "tmpl-core-multiselect";


  function makeMsvmValueAccessor(valueAccessor) {
    return function() {
      var msvm = ko.unwrap(valueAccessor());
      if (!(msvm instanceof MultiSelectViewModel)) {
        throw new Error("expected bound value to be a MultiSelectViewModel");
      }
      return {
        data: msvm,
        name: msvm.viewTmpl,
        templateEngine: ko.nativeTemplateEngine.instance,
      };
    };
  }
  ko.bindingHandlers.msvm = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      return ko.bindingHandlers.template.init(element, makeMsvmValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      return ko.bindingHandlers.template.update(element, makeMsvmValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    },
  };

  return MultiSelectViewModel;
});
