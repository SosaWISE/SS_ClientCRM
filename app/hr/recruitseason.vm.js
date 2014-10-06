define('src/hr/recruitseason.vm', [
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  ukov,
  dataservice,
  ko,
  ComboViewModel,
  notify,
  BaseViewModel,
  utils
) {
  'use strict';

  var schema, newRecruitTempID = -1;

  schema = {
    _model: true,
    SeasonID: {
      validators: [
        ukov.validators.isRequired('Season is required'),
      ],
    },
    CopyRecruitID: {},
  };

  function RecruitSeasonViewModel(options) {
    var _this = this;
    RecruitSeasonViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'userid',
      'cache',
      'recruitVms',
    ]);
    BaseViewModel.ensureProps(_this.cache, [
      'seasons',
    ]);

    _this.data = ukov.wrap({}, schema);
    _this.data.SeasonCvm = new ComboViewModel({
      selectedValue: _this.data.SeasonID,
      fields: {
        value: 'SeasonID',
        text: 'SeasonName'
      },
      list: filterSeasons(_this.cache.seasons, _this.recruitVms),
    });
    _this.data.CopyRecruitCvm = new ComboViewModel({
      selectedValue: _this.data.CopyRecruitID,
      fields: {
        value: 'RecruitID',
        text: 'SeasonName'
      },
      list: createCopyRecruitCvmList(_this.cache.seasons, _this.recruitVms),
      nullable: true,
    });
    //
    // events
    //
    _this.clickCancel = function() {
      closeLayer(_this);
    };
    _this.clickAdd = function() {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 10);
        return;
      }
      var recruit, model = _this.data.getValue();
      if (model.CopyRecruitID) {
        //@TODO: copy
        notify.warn('Copy is not implemented', null, 4);
        return;
      } else {
        recruit = {
          UserID: _this.userid,
          RecruitID: newRecruitTempID--,
          SeasonID: model.SeasonID
        };
      }
      _this.layerResult = recruit;
      closeLayer(_this);
    };
  }
  utils.inherits(RecruitSeasonViewModel, BaseViewModel);
  RecruitSeasonViewModel.prototype.viewTmpl = 'tmpl-hr-recruitseason';
  RecruitSeasonViewModel.prototype.width = 400;
  RecruitSeasonViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  RecruitSeasonViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  function filterSeasons(seasons, recruitVms) {
    var map = {};
    recruitVms.forEach(function(r) {
      map[r.data.SeasonID.peek()] = true;
    });
    // return seasons without a recruit
    return seasons.filter(function(s) {
      return !map[s.SeasonID];
    });
  }

  function createCopyRecruitCvmList(seasons, recruitVms) {
    var map = {};
    seasons.forEach(function(s) {
      map[s.SeasonID] = s;
    });
    return recruitVms.map(function(r) {
      var season = map[r.data.SeasonID.peek()];
      return {
        RecruitID: r.data.RecruitID.peek(),
        SeasonName: season.SeasonName,
      };
    });
  }

  return RecruitSeasonViewModel;
});
