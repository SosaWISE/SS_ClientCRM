define('src/hr/teameditor.vm', [
  'src/hr/hr-cache',
  'src/hr/teamsearch.vm',
  'src/core/combo.vm',
  'src/dataservice',
  'src/ukov',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  hrcache,
  TeamSearchViewModel,
  ComboViewModel,
  dataservice,
  ukov,
  strings,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var schema,
    max50 = ukov.validators.maxLength(50),
    boolConverter = ukov.converters.bool(),
    intConverter = ukov.converters.number(0);

  schema = {
    _model: true,

    TeamID: { // int
      // validators: [],
    },
    Description: { // string
      validators: [
        max50,
        ukov.validators.isRequired('Team Name is required'),
      ],
    },
    CreatedFromTeamId: {}, // int?
    TeamLocationId: { // int
      converter: intConverter,
      validators: [
        ukov.validators.isRequired('Office is required'),
      ],
    },
    RoleLocationId: {}, // int?
    RegionalManagerRecruitId: {}, // int?
    IsActive: { // bool
      converter: boolConverter,
    },
    IsDeleted: { // bool
      converter: boolConverter,
    },
    CreatedBy: {}, // string
    CreatedOn: {}, // DateTime?
    ModifiedBy: {}, // string
    ModifiedOn: {}, // DateTime?
  };

  // ctor
  function TeamEditorViewModel(options) {
    var _this = this;
    TeamEditorViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, [
      'layersVm',
      // 'seasonid',
    ]);

    _this.initFocusFirst();
    _this.data = ukov.wrap({
      TeamID: _this.teamid || 0,
    }, schema);
    _this.data.OfficeCvm = new ComboViewModel({
      selectedValue: _this.data.TeamLocationId,
      nullable: true,
      fields: {
        value: 'TeamLocationID',
        text: 'Description',
      },
    });
    _this.data.RoleLocationCvm = new ComboViewModel({
      selectedValue: _this.data.RoleLocationId,
      nullable: true,
      fields: {
        value: 'RoleLocationID',
        text: 'Role',
      },
    });

    _this.editing = ko.observable(false);
    _this.viewTmpl = ko.computed(function() {
      if (_this.editing()) {
        return 'tmpl-hr-teameditor';
      } else {
        return 'tmpl-hr-teaminfo';
      }
    });
    _this.isDirty = ko.computed({
      deferEvaluation: true,
      read: function() {
        return _this.editing() && !_this.data.isClean();
      },
    });

    //
    // events
    //
    function resetData(result) {
      if (result === 'yes') {
        _this.editing(false);
        _this.data.reset(true);
      }
    }
    _this.clickCancel = function() {
      if (!_this.isDirty()) {
        resetData('yes');
      } else {
        notify.confirm('Reset changes?', 'There are unsaved changes. Click yes to undo these changes.', resetData);
      }
    };
    _this.clickEdit = function() {
      _this.editing(true);
      _this.focusFirst(true);
    };
    _this.cmdSave = ko.command(function(cb) {
      saveTeam(_this, cb);
    }, function(busy) {
      return !busy && !_this.data.isClean();
    });
  }
  utils.inherits(TeamEditorViewModel, ControllerViewModel);

  TeamEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    hrcache.ensure('roleLocations', join.add());
    hrcache.ensure('teamLocations', join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.data.RoleLocationCvm.setList(hrcache.getList('roleLocations').peek());
      _this.data.OfficeCvm.setList(filterBySeasonID(hrcache.getList('teamLocations').peek(), _this.seasonid));
    });
  };
  TeamEditorViewModel.prototype.setItem = function(item) {
    var _this = this;
    // set item now in order to show title even if onLoad is never called
    _this.data.setValue(item);
    // set item once we're loaded
    _this.loader.onLoad(function() {
      _this.data.setValue(item);
      _this.data.markClean(item);
    });
  };
  TeamEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy()) {
      msg = 'Please wait for save to finish.';
    } else if (_this.isDirty.peek() && _this.data.TeamID.peek() > 0) {
      msg = 'There are unsaved changes for Team Info. Please cancel the edit before closing.';
    }
    return msg;
  };

  function saveTeam(_this, cb) {
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
    } else {
      var model = _this.data.getValue();
      dataservice.hr.teams.save({
        data: model,
      }, null, utils.safeCallback(cb, function(err, resp) {
        var data = resp.Value,
          pcontroller = _this.pcontroller;
        if (!data) {
          return;
        }
        if (pcontroller.id !== data.TeamID) {
          // was a new team
          pcontroller.id = data.TeamID;
          // redirect
          _this.goTo(pcontroller.getRouteData());
        }

        _this.data.setValue(data);
        _this.data.markClean(data, true);
        // end editing
        _this.editing(false);
      }, notify.iferror));
    }
  }

  function filterBySeasonID(list, seasonID) {
    if (!seasonID) {
      return list;
    }
    return list.filter(function(item) {
      return item.SeasonID === seasonID;
    });
  }

  return TeamEditorViewModel;
});
