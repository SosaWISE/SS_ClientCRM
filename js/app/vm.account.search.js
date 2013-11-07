define('src/vm.account.search', [
  'src/core/notify',
  'src/util/utils',
  'src/core/vm.base',
  'ko'
], function(
  notify,
  utils,
  BaseViewModel,
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
      _this.redirectTo({
        id: 100000 + count,
      });
      count++;
    };
  }
  utils.inherits(SearchAccountViewModel, BaseViewModel);
  SearchAccountViewModel.prototype.viewTmpl = 'tmpl-account_search';

  return SearchAccountViewModel;
});
