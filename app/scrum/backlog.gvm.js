define('src/scrum/backlog.gvm', [
  'src/scrum/backlogdata',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  BacklogData,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function BacklogGridViewModel() {
    var _this = this;
    _this.bd = new BacklogData();
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
      dataView: _this.bd,
      columns: _this.bd.columns,
    });
  }
  utils.inherits(BacklogGridViewModel, SlickGridViewModel);

  BacklogGridViewModel.prototype.init = function(scopes, storys) {
    var _this = this;
    _this.bd.init(scopes, storys);
  };

  return BacklogGridViewModel;
});
