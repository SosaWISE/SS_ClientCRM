define('src/survey/vm.takequestion', [
  'ko',
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
], function(
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  function TakeQuestionViewModel(options) {
    var _this = this;
    TakeQuestionViewModel.super_.call(_this, options);
    _this.ensureProps([]);

    _this.parent = ko.observable();
    _this.name = ko.computed({
      deferEvaluation: true,
      read: function() {
        return getName(_this.parent(), _this.GroupOrder);
      },
    });
  }
  utils.inherits(TakeQuestionViewModel, BaseViewModel);
  TakeQuestionViewModel.prototype.viewTmpl = 'tmpl-question';

  function getName(parent, index) {
    var pName = parent ? parent.name() : '';
    return pName + (index + 1) + '.';
  }

  return TakeQuestionViewModel;
});
