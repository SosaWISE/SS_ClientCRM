define('src/hr/recruitseason.vm', [
  'src/hr/hr-cache',
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  hrcache,
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
    CopyRecruit: {},
  };

  function RecruitSeasonViewModel(options) {
    var _this = this;
    RecruitSeasonViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'userid',
      'seasons',
      'recruitVms',
    ]);

    _this.data = ukov.wrap({}, schema);
    _this.data.SeasonCvm = new ComboViewModel({
      selectedValue: _this.data.SeasonID,
      list: filterSeasons(_this.seasons, _this.recruitVms),
      fields: {
        value: 'SeasonID',
        text: 'SeasonName'
      },
    });
    _this.data.CopyRecruitCvm = new ComboViewModel({
      selectedValue: _this.data.CopyRecruit,
      list: createCopyRecruitCvmList(_this.seasons, _this.recruitVms),
      fields: {
        value: 'Recruit',
        text: 'SeasonName'
      },
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
      var recruit, managerId, model = _this.data.getValue();
      if (model.CopyRecruit) {
        recruit = model.CopyRecruit;

        // reset team since we don't know the id in the new season
        recruit.TeamID = null;
        // ReportsToID
        if (recruit.ReportsToID != null) {
          notify.warn('Manager not copied', null, 4);
          // get manager's id for new recruit's season
          managerId = recruit.ReportsToID;
          recruit.ReportsToID = null; // reset incase the manager isn't found in the season

          //@TODO: get manager recruit /recruits/{managerId}
          //@TODO: find manager in selected season by UserID, SeasonID, and manager's UserTypeId


          // //get manager
          // RU_Recruit manager = _service.GetRecruit(managerID);
          // if (manager != null) {
          //
          //   //get manager for season
          //   RU_Recruit newManager = _service.GetRecruitByUserSeasonAndUserType(manager.UserID, seasonID, manager.UserTypeId);
          //   if (newManager != null) {
          //
          //     //set manager
          //     recruit.ReportsToID = newManager.RecruitID;
          //   }
          // }
        }

        recruit.CurrentAddressID = null; // ensure null since it should not be used
      } else {
        recruit = {
          UserID: _this.userid,
        };
      }
      // set data relevant to user and season
      recruit.UserID = _this.userid;
      recruit.RecruitID = newRecruitTempID--;
      recruit.SeasonID = model.SeasonID;

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
