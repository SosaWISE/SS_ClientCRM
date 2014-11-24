define('src/hr/teams.vm', [
  'src/dataservice',
  'src/hr/chooseseason.vm',
  'src/hr/team.vm',
  'src/hr/teamsearch.vm',
  'ko',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  dataservice,
  ChooseSeasonViewModel,
  TeamViewModel,
  TeamSearchViewModel,
  ko,
  notify,
  utils,
  ControllerViewModel
) {
  'use strict';

  var newTeamID = -1;

  function TeamsViewModel(options) {
    var _this = this;
    TeamsViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
    ]);

    _this.searchVm = ko.observable();
    _this.list = _this.childs;

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
    _this.clickSearch = function() {
      _this.selectChild(_this.searchVm.peek());
    };
    _this.clickNew = function() {
      _this.layersVm.show(new ChooseSeasonViewModel(), function(season) {
        if (!season) {
          return;
        }
        var vm = createTeamViewModel(_this, newTeamID--, season.SeasonID);
        _this.list.push(vm);
        _this.selectChild(vm);
      });
    };
  }
  utils.inherits(TeamsViewModel, ControllerViewModel);
  TeamsViewModel.prototype.viewTmpl = 'tmpl-hr-teams';

  TeamsViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    _this.searchVm(new TeamSearchViewModel({
      pcontroller: _this,
      id: 'search',
      title: 'Search',
    }));
    _this.defaultChild = _this.searchVm.peek();

    join.add()();
  };

  TeamsViewModel.prototype.findChild = function(routeData) {
    var _this = this,
      searchVm, result, id;
    searchVm = _this.searchVm.peek();
    if (searchVm && routeData[searchVm.routePart] === searchVm.id) {
      result = searchVm;
    } else {
      result = TeamsViewModel.super_.prototype.findChild.call(_this, routeData);
      if (!result) {
        // get child id
        id = routeData[_this.getChildRoutePart(routeData.route)];
        if (id > 0) {
          // add child
          result = createTeamViewModel(_this, id);
          _this.list.push(result);
        }
      }
    }
    return result;
  };

  function createTeamViewModel(_this, id, seasonid) {
    return new TeamViewModel({
      seasonid: seasonid,
      pcontroller: _this,
      id: id,
      layersVm: _this.layersVm,
    });
  }

  return TeamsViewModel;
});
