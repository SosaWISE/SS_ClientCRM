define('src/core/ko.bindingHandlers.jquery.ui', [
  'jquery.ui',
  'jquery',
  'ko',
], function(
  _jquery_ui,
  jquery,
  ko
) {
  "use strict";

  function getField(options, name, defaultValue) {
    var result = options[name];
    if (result == null) {
      result = defaultValue;
    }
    return result;
  }

  ko.bindingHandlers.drop = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      var el, dropOptions, onDropName, onOverName, onOutName;

      el = jquery(element);
      // el.droppable("destroy");

      dropOptions = ko.unwrap(valueAccessor());

      onDropName = getField(dropOptions, 'onDropName', 'onDrop');
      onOverName = getField(dropOptions, 'onOverName', 'onOver');
      onOutName = getField(dropOptions, 'onOutName', 'onOut');

      el.droppable({
        tolerance: getField(dropOptions, 'tolerance', 'intersect'),
        greedy: getField(dropOptions, 'greedy', true),
        // activeClass: 'drop-item',
        hoverClass: getField(dropOptions, 'hoverClass', 'drop-accept'),
        accept: getField(dropOptions, 'accept', '.bl-item'),
        drop: function(ev, ui) {
          var dropVm = ko.dataFor(ev.toElement);
          if (dropVm && viewModel[onDropName]) {
            viewModel[onDropName](dropVm, ev, ui);
          }
          // if (viewModel[onDropName]) {
          //   viewModel[onDropName](ev, ui);
          // }
        },
        over: function(ev, ui) {
          if (viewModel[onOverName]) {
            viewModel[onOverName](ev, ui);
          }
        },
        out: function(ev, ui) {
          if (viewModel[onOutName]) {
            viewModel[onOutName](ev, ui);
          }
        }
      });
    }
  };

  ko.bindingHandlers.drag = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      var el, drapOptions, helper, dragClass;

      el = jquery(element);
      // el.draggable("destroy");

      drapOptions = ko.unwrap(valueAccessor());

      helper = viewModel.dragHelper;
      if (typeof(viewModel.getDragHelper) === 'function') {
        helper = function(evt) {
          var el = this;
          return viewModel.getDragHelper(el, evt);
        };
      }
      dragClass = viewModel.dragClass || 'item-dragging';

      el.draggable({
        zIndex: 1,
        //revert : 'invalid' //if we aren't dropped into our target, revert
        appendTo: viewModel.appendTo || 'body',
        helper: helper || 'original',
        revert: 'invalid' || viewModel.revertDrag,
        //dynamic: true,
        scroll: false,
        // snap: true,
        // snapMode: 'outer',
        // snapTolerance: 5,
        distance: 10,
        handle: '.drag-hdl',
        start: function(evt, ui) {
          // prevent dropping on self
          el.droppable({
            disabled: true,
          });

          ui.helper.addClass(dragClass);
          if (viewModel.onDragStart) {
            viewModel.onDragStart({
              evt: evt,
              ui: ui
            });
          }

          ui.helper.data('startposition', ui.helper.position());
        },
        stop: function( /*evt, ui*/ ) {
          el.droppable({
            disabled: false,
          });

          // var accepted = ui.helper.data('drop-accepted'),
          //   options = {
          //     evt: evt,
          //     ui: ui,
          //     accepted: accepted
          //   };
          //
          // ui.helper.removeClass(dragClass);
          // if (viewModel.onDragStop) {
          //   viewModel.onDragStop(options);
          // }
          //
          // if (accepted) {
          //   if (viewModel.onDragStopComplete) {
          //     viewModel.onDragStopComplete(options);
          //   }
          // } else {
          //   //??
          // }
        }
      });
    }
  };
});
