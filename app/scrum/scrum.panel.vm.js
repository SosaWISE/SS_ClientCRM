define('src/scrum/scrum.panel.vm', [
  'jquery.ui',
  'jquery',
  'ko',
  'src/dataservice',
  'src/scrum/scrumrepo',
  'src/scrum/backlog.vm',
  'src/scrum/planning.vm',
  // 'src/scrum/tracking.vm',
  'src/scrum/taskboard.vm',
  'src/core/utils',
  'src/core/controller.vm',
], function(
  _jquery_ui,
  jquery,
  ko,
  dataservice,
  ScrumRepo,
  BacklogViewModel,
  PlanningViewModel,
  // TrackingViewModel,
  TaskBoardViewModel,
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

  ScrumPanelViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
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
          // new TrackingViewModel({
          //   pcontroller: _this,
          //   id: 'track',
          //   title: 'Task Board',
          //   repo: _this.repo,
          // }),
          new TaskBoardViewModel({
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


  //
  // ui bindings
  //
  ko.bindingHandlers.scrumDrag = {
    init: function(el, valueAccessor, allBindingsAccessor, viewModel) {
      var dragOptions, dragClass;
      el = jquery(el);
      dragOptions = ko.unwrap(valueAccessor());
      dragClass = viewModel.dragClass || 'item-dragging';

      el.draggable({
        zIndex: 1,
        addClasses: false,
        revert: 'invalid',
        appendTo: el.closest('.sprints').get(0), // get the first .sprints element
        helper: 'clone',
        scroll: true,
        distance: 1,
        handle: '.drag-hdl',
        start: function(evt, ui) {
          if (viewModel.onDragStart) {
            viewModel.onDragStart({
              evt: evt,
              ui: ui
            });
          }

          var h = ui.helper,
            p = h.parent();
          h.data('scrollTop', p.scrollTop());
          h.data('scrollLeft', p.scrollLeft());

          h.addClass(dragClass);
          h.width(el.width());
          h.css({
            position: 'absolute',
          });

          el.addClass('draggable');
        },
        drag: function(evt, ui) {
          var h = ui.helper,
            p = h.parent();
          // when the parent has scrolled jquery ui needs some help
          ui.position.top += (p.scrollTop() - h.data('scrollTop'));
          ui.position.left += (p.scrollLeft() - h.data('scrollLeft'));
        },
        stop: function( /*evt, ui*/ ) {
          el.removeClass('draggable');

          var fn = el.data('onStop');
          if (fn) {
            fn(viewModel);
          }
        }
      });
    }
  };
  ko.bindingHandlers.scrumDrop = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      var el, dropOptions, onDrop, onOver, onOut, onAccept;

      el = jquery(element);
      // el.droppable("destroy");

      dropOptions = ko.unwrap(valueAccessor());

      onDrop = viewModel[getField(dropOptions, 'onDrop', 'onDrop')];
      onOver = viewModel[getField(dropOptions, 'onOver', 'onOver')];
      onOut = viewModel[getField(dropOptions, 'onOut', 'onOut')];
      onAccept = viewModel[getField(dropOptions, 'onAccept', 'onAccept')];

      el.droppable({
        tolerance: getField(dropOptions, 'tolerance', 'pointer'),
        greedy: getField(dropOptions, 'greedy', true),
        // activeClass: 'drop-item',
        hoverClass: getField(dropOptions, 'hoverClass', 'drop-accept'),
        accept: (!onAccept) ? getField(dropOptions, 'accept', '.bl-drag-item') : function(el) {
          var testVm = ko.dataFor(el.get(0));
          if (testVm) {
            return onAccept.call(viewModel, testVm, el);
          }
        },
        drop: function(evt, ui) {
          var onStop = false;
          if (onDrop) {
            onStop = function(dragVm) {
              if (dragVm) {
                onDrop.call(viewModel, dragVm, evt, ui);
              }
            };
          }
          ui.draggable.data('onStop', onStop);
        },
        over: function(evt, ui) {
          if (onOver) {
            onOver.call(viewModel, evt, ui);
          }
        },
        out: function(evt, ui) {
          if (onOut) {
            onOut.call(viewModel, evt, ui);
          }
        }
      });
    }
  };
  //
  function getField(options, name, defaultValue) {
    var result = options[name];
    if (result == null) {
      result = defaultValue;
    }
    return result;
  }


  return ScrumPanelViewModel;
});
