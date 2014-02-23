define('src/scrum/backlog.gvm', [
  'ko',
  'src/slick/movesubrows',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  ko,
  MoveSubRows,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function BacklogGridViewModel(options) {
    var _this = this;
    BacklogGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      dataView: options.dataView,
      plugins: [
        new MoveSubRows({
          dataView: options.dataView,
          // orderName: 'OrderNumber',
          onOrderChanged: function(changedRows) {
            console.log('changedRows', changedRows);
            // changedRows.forEach(function(item) {
            //   options.save(item);
            // });
          },
        }),
        // new RowEvent({
        //   eventName: 'onDblClick',
        //   fn: function(item) {
        //     options.edit(item, function(model, deleted) {
        //       if (!model) { // nothing changed
        //         return;
        //       }
        //       if (deleted) { // remove deleted item
        //         _this.list.remove(item);
        //       } else { // update in place
        //         _this.list.replace(item, model);
        //       }
        //     });
        //   },
        // }),
      ],
      columns: [
        {
          id: '#',
          name: '',
          width: 30,
          behavior: 'selectAndMove',
          resizable: false,
          cssClass: 'cell-reorder',
        },
        {
          id: '#c',
          name: '',
          width: 30,
          behavior: 'dropChild',
          resizable: false,
        },
        {
          id: "name",
          name: "Name",
          // field: "name",
          // width: 70,
          // minWidth: 50,
          // cssClass: "cell-name",
          // sortable: true,
          // editor: Slick.Editors.Text
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return dataCtx.item.Name;
          },
        },
        {
          id: "points",
          name: "Points",
          // field: "points",
          width: 70,
          minWidth: 50,
          // cssClass: "cell-points",
          // sortable: true,
          // editor: Slick.Editors.Text
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return dataCtx.points();
          },
        },
      ],
    });
  }
  utils.inherits(BacklogGridViewModel, SlickGridViewModel);

  // BacklogGridViewModel.prototype.nextOrderNumber = function() {
  //   var _this = this,
  //     list = _this.list(),
  //     orderNumber;
  //   if (list.length) {
  //     orderNumber = list[list.length - 1].OrderNumber;
  //     if (!orderNumber) {
  //       orderNumber = list.length;
  //     }
  //     orderNumber += 1;
  //   } else {
  //     orderNumber = 1;
  //   }
  //   return orderNumber;
  // };

  return BacklogGridViewModel;
});
