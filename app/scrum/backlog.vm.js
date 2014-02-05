define('src/scrum/backlog.vm', [
  'src/scrum/backlogdata',
  'src/dataservice',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  BacklogData,
  dataservice,
  utils,
  ControllerViewModel
) {
  "use strict";

  function BacklogViewModel(options) {
    var _this = this;
    BacklogViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['repo']);

    _this.bd = new BacklogData();

    //
    // events
    //
  }
  utils.inherits(BacklogViewModel, ControllerViewModel);
  BacklogViewModel.prototype.viewTmpl = 'tmpl-scrum_backlog';

  BacklogViewModel.prototype.onLoad = function(routeData, join) {
    var _this = this,
      epics, storys;

    load_epics(function(val) {
      epics = val;
    }, join);
    load_storys(function(val) {
      storys = val;
    }, join);

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.bd.init([
        {
          type: 'epic',
          list: epics,
        },
        {
          type: 'story',
          list: storys,
        }
      ]);
    });
  };

  function load_epics(setter, join) {
    var cb = join.add();
    dataservice.scrum.scopes.read({}, setter, function(err, resp) {
      cb(err, resp);
    });
  }

  function load_storys(setter, join) {
    var cb = join.add();
    dataservice.scrum.storys.read({
      id: 'null',
      link: 'bysprint'
    }, setter, function(err, resp) {
      cb(err, resp);
    });
  }

  return BacklogViewModel;
});
