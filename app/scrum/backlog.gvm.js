define('src/scrum/backlog.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function BacklogGridViewModel(options) {
    var _this = this;
    BacklogGridViewModel.super_.call(_this, {
      options: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function() {
            alert('double clicked');
          },
        }),
      ],
      dataView: options.bd,
      columns: options.bd.columns,
    });
  }
  utils.inherits(BacklogGridViewModel, SlickGridViewModel);

  return BacklogGridViewModel;
});
