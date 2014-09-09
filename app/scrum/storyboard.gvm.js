define('src/scrum/storyboard.gvm', [
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

  function StoryBoardGridViewModel(options) {
    var _this = this;
    StoryBoardGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 20,
        multiSelect: false,
      },
      dataView: options.dataView,
      // plugins: [ //
      //   new MoveSubRows({
      //     dataView: options.dataView,
      //     // orderName: 'OrderNumber',
      //     onOrderChanged: function(changedRows) {
      //       console.log('changedRows', changedRows);
      //       // changedRows.forEach(function(item) {
      //       //   options.save(item);
      //       // });
      //     },
      //   }),
      //   // new RowEvent({
      //   //   eventName: 'onDblClick',
      //   //   fn: function(item) {
      //   //     options.edit(item, function(model, deleted) {
      //   //       if (!model) { // nothing changed
      //   //         return;
      //   //       }
      //   //       if (deleted) { // remove deleted item
      //   //         _this.list.remove(item);
      //   //       } else { // update in place
      //   //         _this.list.replace(item, model);
      //   //       }
      //   //     });
      //   //   },
      //   // }),
      // ],
      columns: [ //
        {
          id: 'sid',
          name: 'ID',
          field: "sid",
          width: 40,
          // behavior: 'selectAndMove',
          resizable: false,
          // cssClass: 'cell-reorder',
        },
        // {
        //   id: 'sprintId',
        //   name: 'Sprint',
        //   // width: 30,
        //   formatter: function(row, cell, value, columnDef, dataCtx) {
        //     return '??' + dataCtx.psid;
        //   },
        // },
        // {
        //   id: '#c',
        //   name: '',
        //   width: 30,
        //   behavior: 'dropChild',
        //   resizable: false,
        //   cssClass: 'cell-drop-child',
        //   formatter: function() {
        //     return '<div class="target"></div>';
        //   },
        // },
        {
          id: "name",
          name: "Name",
          field: "Name",
          // behavior: 'dropChild',

          // field: "name",
          // width: 70,
          // minWidth: 50,
          // cssClass: "cell-name",
          // sortable: true,
          // editor: Slick.Editors.Text
          // formatter: function(row, cell, value, columnDef, dataCtx) {
          //   return dataCtx.Name;
          // },
        }, {
          id: "points",
          name: "Points",
          field: "Points",
          width: 70,
          minWidth: 50,
          // cssClass: "cell-points",
          // sortable: true,
          // editor: Slick.Editors.Text
          // formatter: function(row, cell, value, columnDef, dataCtx) {
          //   return dataCtx.points();
          // },
        },
      ],
    });
  }
  utils.inherits(StoryBoardGridViewModel, SlickGridViewModel);

  // StoryBoardGridViewModel.prototype.nextOrderNumber = function() {
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

  return StoryBoardGridViewModel;
});
