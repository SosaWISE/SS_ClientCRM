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

  function BacklogGridViewModel() {
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
      columns: [
        {
          // foreach Scope in Backlog
          //   foreach Story in Scope
          //     Name Column: 'Scope.Name: Story.Name'
          id: 'Name',
          name: 'Name',
          field: 'Name',
        },
        {
          id: 'Points',
          name: 'Points',
          field: 'Points',
        },
        {
          id: 'Owner',
          name: 'Owner',
          field: 'Owner',
        },
      ],
    });
    while (_this.list().length < 2) {
      _this.list().push({
        Name: 'Name ' + (_this.list().length + 1),
        Points: 'Points ' + (_this.list().length + 1),
        Owner: 'Owner ' + (_this.list().length + 1),
      });
    }
  }
  utils.inherits(BacklogGridViewModel, SlickGridViewModel);

  return BacklogGridViewModel;
});
