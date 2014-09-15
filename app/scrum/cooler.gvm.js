define('src/scrum/cooler.gvm', [
  'src/core/relativesort',
  'src/core/treelist',
  'ko',
  'src/slick/movesubrows',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'slick',
  'src/core/utils',
], function(
  RelativeSort,
  TreeList,
  ko,
  MoveSubRows,
  RowEvent,
  SlickGridViewModel,
  Slick,
  utils
) {
  "use strict";

  function createTree(openVm) {
    // var rsort = new RelativeSort({
    //   start: 0,
    //   increment: 5,
    // });
    // rsort.getIntSort(null, null);

    var tree = new TreeList({
      onRowCountChanged: new Slick.Event(),
      onRowsChanged: new Slick.Event(),
      comparer: function(a, b) {
        return b.ID - a.ID; // descending
      },
      taker: function(item) {
        return (item.Points == null || item.ProjectOrder == null);
      },
      accepter: function(item, parent, prev, next) {
        return next !== next; //@TODO:
      },
      inserter: function(item, parent, prev, next, cb) {
        item = utils.clone(item);
        // item.Points = null;
        item.ProjectOrder = null;
        // save item
        var editor = openVm.makeEditor(item);
        editor.save(function(err, resp) {
          if (!err) {
            openVm.storyUpdated(resp.Value);
          }
          cb();
        });
      },
    });
    return tree;
  }

  function CoolerGridViewModel(options, openVm) {
    var _this = this;
    CoolerGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 20,
        multiSelect: false,
      },
      dataView: createTree(openVm),
      plugins: [ //
        new MoveSubRows({
          rowMoveHelper: options.rowMoveHelper,
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
  utils.inherits(CoolerGridViewModel, SlickGridViewModel);

  // CoolerGridViewModel.prototype.nextOrderNumber = function() {
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

  return CoolerGridViewModel;
});
