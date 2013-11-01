define('src/survey/vm.mdeditor', [
  'src/util/strings',
  'markdown',
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  strings,
  markdown,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  function MDEditorViewModel(options) {
    var _this = this;
    MDEditorViewModel.super_.call(_this, options);

    // _this.input = ko.observable('');
    _this.output = ko.computed(_this.computeHtml, _this);
  }
  utils.inherits(MDEditorViewModel, BaseViewModel);
  MDEditorViewModel.prototype.viewTmpl = 'tmpl-mdeditor';

  MDEditorViewModel.prototype.computeHtml = function() {
    //@TODO: format {0:c},{0:spaced},etc.
    //@TODO: format with real & mock tokens
    var params = [
      'Param One',
      'Param Two',
      'Param Three',
      'Param Four',
      'Param Five',
    ];
    return markdown.toHTML(strings.aformat(this.input(), params));
  };

  return MDEditorViewModel;
});
