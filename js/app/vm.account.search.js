define('src/vm.account.search', [
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.controller',
  'ko'
], function(
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var count = 4;

  function SearchAccountViewModel(options) {
    var _this = this;
    SearchAccountViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);

    //
    // events
    //
    _this.clickOpen = function() {
      _this.goTo({
        id: 100000 + count,
      });
      count++;
    };
  }
  utils.inherits(SearchAccountViewModel, ControllerViewModel);
  SearchAccountViewModel.prototype.viewTmpl = 'tmpl-account_search';

  return SearchAccountViewModel;
});
