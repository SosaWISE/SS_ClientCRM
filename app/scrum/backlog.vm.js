define('src/scrum/backlog.vm', [
  'src/scrum/backlogdata',
  'src/dataservice',
  'src/scrum/backlog.gvm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  BacklogData,
  dataservice,
  BacklogGridViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";

  function BacklogViewModel(options) {
    var _this = this;
    BacklogViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['repo']);

    _this.bd = new BacklogData();
    // _this.gvm = new BacklogGridViewModel({
    //   bd: _this.bd,
    // });

    //
    // events
    //
  }
  utils.inherits(BacklogViewModel, ControllerViewModel);
  BacklogViewModel.prototype.viewTmpl = 'tmpl-scrum_backlog';

  BacklogViewModel.prototype.onLoad = function(routeData, join) {
    var _this = this,
      scopes, storys;

    load_scopes(function(val) {
      scopes = val;
    }, join);
    load_storys(function(val) {
      storys = val;
    }, join);

    join.when(function(err) {
      if (!err) {
        _this.bd.init(scopes, storys);
      }
    });
  };

  function load_scopes(setter, join) {
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
