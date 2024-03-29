define('src/survey/qmtokenmap.vm', [
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  dataservice,
  ko,
  notify,
  utils,
  BaseViewModel
) {
  'use strict';

  function QMTokenMapViewModel(options) {
    var _this = this;
    QMTokenMapViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['tokensVM']);

    _this.token = _this.tokensVM.getToken(_this.model.TokenId);
    // _this.active(!_this.model.IsDeleted);
    // //
    // // events
    // //
    // _this.cmdToggle = ko.command(
    //   function(cb) {
    //     var model = _this.model;
    //     model.IsDeleted = !model.IsDeleted;
    //     dataservice.survey.questionMeaningTokenMaps.save({data:model,}, null, function(err, resp) {
    //       if (err) {
    //         notify.error(err, 10);
    //       } else {
    //         _this.model = resp.Value;
    //         _this.active(!_this.model.IsDeleted);
    //       }
    //       cb();
    //     });
    //   }
    // );
  }
  utils.inherits(QMTokenMapViewModel, BaseViewModel);

  return QMTokenMapViewModel;
});
