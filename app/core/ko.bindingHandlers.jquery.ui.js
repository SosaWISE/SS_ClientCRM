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

  ko.bindingHandlers.drop = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      var el, enabled;

      el = jquery(element);
      // el.droppable("destroy");

      enabled = ko.unwrap(valueAccessor());
      if (enabled) {
        el.droppable({
          accept: viewModel.accept,
          drop: function(ev, ui) {
            if (viewModel.onDrop) {
              viewModel.onDrop(ev, ui);
            }
          },
          over: function(ev, ui) {
            if (viewModel.onDropOver) {
              viewModel.onDropOver(ev, ui);
            }
          },
          out: function(ev, ui) {
            if (viewModel.onDropOut) {
              viewModel.onDropOut(ev, ui);
            }
          }
        });
      }
    }
  };

  ko.bindingHandlers.drag = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      var el, enabled, helper, dragClass;

      el = jquery(element);
      // el.draggable("destroy");

      enabled = ko.unwrap(valueAccessor());
      if (enabled) {
        helper = viewModel.dragHelper;
        if (typeof(viewModel.getDragHelper) === 'function') {
          helper = function(evt) {
            var el = this;
            return viewModel.getDragHelper(el, evt);
          };
        }
        dragClass = viewModel.dragClass || 'item-dragging';

        el.draggable({
          //revert : 'invalid' //if we aren't dropped into our target, revert
          appendTo: viewModel.appendTo || 'body',
          helper: helper || 'clone',
          revert: viewModel.revertDrag,
          //dynamic: true,
          scroll: false,
          start: function(evt, ui) {
            ui.helper.addClass(dragClass);
            if (viewModel.onDragStart) {
              viewModel.onDragStart({
                evt: evt,
                ui: ui
              });
            }

            ui.helper.data('startposition', ui.helper.position());
          },
          stop: function(evt, ui) {
            var accepted = ui.helper.data('drop-accepted'),
              options = {
                evt: evt,
                ui: ui,
                accepted: accepted
              };

            ui.helper.removeClass(dragClass);
            if (viewModel.onDragStop) {
              viewModel.onDragStop(options);
            }

            if (accepted) {
              if (viewModel.onDragStopComplete) {
                viewModel.onDragStopComplete(options);
              }
            } else {
              //??
            }
          }
        });
      }
    }
  };
});
