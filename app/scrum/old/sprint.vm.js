define('src/scrum/sprint.vm', [
  'src/scrum/backlogdata',
  'src/dataservice',
  'ko',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  BacklogData,
  dataservice,
  ko,
  utils,
  ControllerViewModel
) {
  "use strict";

  function SprintViewModel(options) {
    var _this = this;
    SprintViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['layersVm']);

    _this.bd = new BacklogData({
      layersVm: _this.layersVm,
      isBacklog: !(!_this.epics),
    });

    //
    // events
    //
  }
  utils.inherits(SprintViewModel, ControllerViewModel);
  // SprintViewModel.prototype.viewTmpl = 'tmpl-scrum_sprint';

  SprintViewModel.prototype.onLoad = function(routeData, extraData, join) {
    var _this = this,
      storys;

    load_storys(_this.id, function(val) {
      storys = val;
    }, join);

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.bd.init(_this.epics || [], storys);
    });
  };

  function load_storys(id, setter, join) {
    var cb = join.add();
    dataservice.scrum.sprints.read({
      id: id,
      link: 'storys'
    }, setter, function(err, resp) {
      cb(err, resp);
    });
  }


  return SprintViewModel;
});
