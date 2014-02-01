define('src/scrum/scrum.panel.vm', [
  'src/core/ko.bindingHandlers.jquery.ui',
  'src/dataservice',
  'src/scrum/scrumrepo',
  'src/scrum/backlog.vm',
  'src/scrum/planning.vm',
  'src/scrum/tracking.vm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  jquery_ui,
  dataservice,
  ScrumRepo,
  BacklogViewModel,
  PlanningViewModel,
  TrackingViewModel,
  utils,
  ControllerViewModel
) {
  "use strict";
  //@TODO: move to panels folder

  function ScrumPanelViewModel(options) {
    var _this = this;
    ScrumPanelViewModel.super_.call(_this, options);
    ControllerViewModel.ensureProps(_this, ['id']);

    _this.list = _this.childs;

    //
    // events
    //
    _this.clickItem = function(vm) {
      _this.selectChild(vm);
    };
  }
  utils.inherits(ScrumPanelViewModel, ControllerViewModel);
  ScrumPanelViewModel.prototype.viewTmpl = 'tmpl-panel_scrum';

  ScrumPanelViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.scrum.storys.read({
      id: _this.id,
      link: 'bysprint'
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {

        _this.repo = new ScrumRepo({
          stepValues: [1, 2, 3],
        });

        _this.list([
          new BacklogViewModel({
            pcontroller: _this,
            id: 'backlog',
            title: 'Backlog',
            repo: _this.repo,
          }),
          new PlanningViewModel({
            pcontroller: _this,
            id: 'plan',
            title: 'Story Board',
            repo: _this.repo,
          }),
          new TrackingViewModel({
            pcontroller: _this,
            id: 'track',
            title: 'Task Board',
            repo: _this.repo,
          }),
        ]);

        resp.Value.forEach(function(story) {
          _this.repo.updateStory(story);
        });
      }, cb);
    });
  };

  return ScrumPanelViewModel;
});
