define('src/scrum/backlog.gvm', [
  'src/core/relativesort',
  'src/core/treelist',
  'ko',
  'src/slick/dragdrop',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'slick',
  'src/core/utils',
], function(
  RelativeSort,
  TreeList,
  ko,
  DragDrop,
  RowEvent,
  SlickGridViewModel,
  Slick,
  utils
) {
  "use strict";

  function createTree(openVm) {
    // start with low negative number and work up to 0
    var rsort = new RelativeSort({
      zero: (-1 << 30), // -1073741824
      increment: (1 << 14), // 16384
      max: -1,
    });

    var tree = new TreeList({
      onRowCountChanged: new Slick.Event(),
      onRowsChanged: new Slick.Event(),
      comparer: function(a, b) {
        return b.ProjectOrder - a.ProjectOrder; // descending
      },
      taker: function(item) {
        return (item.Points != null && item.ProjectOrder != null) && item.ProjectOrder < 0;
      },
      accepter: function(item, parent, prev, next) {
        return next === next; //@TODO:
      },
      inserter: function(item, parent, prev, next, cb) {
        item = utils.clone(item);
        // if (parent) {
        //   item.ParentID = parent.ID;
        // }
        item.ProjectOrder = rsort.getIntSort(prev ? prev.ProjectOrder : null, next ? next.ProjectOrder : null);
        if (!tree.takes(item)) {
          // edit item but with more save restrictions
          openVm.editItem(item, cb, {
            requirePoints: true,
          });
        } else {
          // save item
          var editor = openVm.makeEditor(item);
          editor.save(function(err, resp) {
            if (!err) {
              openVm.storyUpdated(resp.Value);
            }
            cb();
          });
        }
      },
    });
    return tree;
  }

  function BacklogGridViewModel(options, openVm) {
    var _this = this;
    BacklogGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 20,
        multiSelect: false,
      },
      dataView: createTree(openVm),
      plugins: [ //
        new DragDrop({
          dragHub: options.dragHub,
        }),
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(item) {
            options.edit(item, function() {
              // ??
            });
          },
        }),
      ],
      columns: [ //
        {
          id: 'sid',
          name: 'ID',
          field: "sid",
          width: 50,
          behavior: 'move',
          // resizable: false,
        }, {
          id: "name",
          name: "Name",
          field: "Name",
          width: 500,
          behavior: 'dropChild',
        }, {
          id: "points",
          name: "Points",
          field: "Points",
          width: 70,
          minWidth: 50,
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
