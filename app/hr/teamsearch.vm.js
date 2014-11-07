define('src/hr/teamsearch.vm', [
  'src/hr/hr-cache',
  'src/core/combo.vm',
  'src/dataservice',
  'src/hr/teamsearch.gvm',
  'src/ukov',
  'src/core/notify',
  'src/core/utils',
  'src/core/controller.vm',
  'ko'
], function(
  hrcache,
  ComboViewModel,
  dataservice,
  TeamSearchGridViewModel,
  ukov,
  notify,
  utils,
  ControllerViewModel,
  ko
) {
  "use strict";
  var schema,
    nullStrConverter = ukov.converters.nullString();

  schema = {
    _model: true,


    TeamID: { // int?
      converter: nullStrConverter,
    },
    TeamName: { // string
      converter: nullStrConverter,
    },
    OfficeName: { // string
      converter: nullStrConverter,
    },
    SeasonID: { // int?
      converter: nullStrConverter,
    },
    SeasonName: { // string
      converter: nullStrConverter,
    },
    City: { // string
      converter: nullStrConverter,
    },
    StateAB: { // string
      converter: nullStrConverter,
    },
    RoleLocationID: { // int?
      converter: nullStrConverter,
    },

    // PageSize: {
    //   converter: ukov.converters.number(0),
    //   validators: [
    //     ukov.validators.isRequired('Results per Page is required'),
    //   ],
    // },
    // PageNumber: {
    //   converter: ukov.converters.number(0),
    // },
  };

  // ctor
  function TeamSearchViewModel(options) {
    var _this = this;
    TeamSearchViewModel.super_.call(_this, options);
    // ControllerViewModel.ensureProps(_this, [
    //   'cache',
    // ]);

    _this.title = ko.observable(_this.title);
    _this.focusFirst = ko.observable(false);
    _this.data = ukov.wrap({}, schema);
    clearData(_this);
    _this.data.SeasonCvm = new ComboViewModel({
      selectedValue: _this.data.SeasonID,
      nullable: true,
      fields: {
        value: 'SeasonID',
        text: 'SeasonName',
      },
    });

    _this.gvm = new TeamSearchGridViewModel({
      open: _this.open || function(item) {
        _this.goTo({
          route: 'hr',
          collection: 'teams',
          id: item.TeamID,
        });
      },
    });

    //
    // events
    //
    _this.cmdSearch = ko.command(function(cb) {
      search(_this, cb);
    });
    _this.clickClear = function() {
      clearData(_this);
      _this.focusFirst(true);
    };

    //
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the rep id
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });
  }
  utils.inherits(TeamSearchViewModel, ControllerViewModel);
  TeamSearchViewModel.prototype.viewTmpl = 'tmpl-hr-teamsearch';
  TeamSearchViewModel.prototype.height = 500;
  TeamSearchViewModel.prototype.width = '80%';

  TeamSearchViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    hrcache.ensure('seasons', join.add());
    // hrcache.ensure('teamTypes', join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.data.SeasonCvm.setList(hrcache.getList('seasons').peek());
      // _this.data.TeamTypeCvm.setList(hrcache.getList('teamTypes').peek());
    });
  };

  function clearData(_this) {
    var data = {
      TeamID: null,
      TeamName: null,
      OfficeName: null,
      SeasonID: null,
      SeasonName: null,
      City: null,
      StateAB: null,
      RoleLocationID: null,
    };
    _this.data.setValue(data);
    _this.data.markClean(data, true);
  }

  function search(_this, cb) {
    var model;
    if (!_this.data.isValid()) {
      notify.warn(_this.data.errMsg(), null, 7);
      cb();
    } else {
      model = _this.data.getValue();
      // clear grid
      _this.gvm.list([]);
      // do search
      dataservice.humanresourcesrv.teams.save({
        data: model,
        link: 'search',
      }, null, utils.safeCallback(cb, function(err, resp) {
        // mark search query as the new clean
        _this.data.markClean(model, true);
        // set results in grid
        _this.gvm.list(resp.Value);
        _this.gvm.setSelectedRows([]);
      }, function(err) {
        notify.error(err, 30);
      }));
    }
  }

  return TeamSearchViewModel;
});
