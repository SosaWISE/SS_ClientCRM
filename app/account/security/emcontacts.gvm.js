define('src/account/security/emcontacts.gvm', [
  'ko',
  'src/slick/moverows',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  ko,
  MoveRows,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function EmContactsGridViewModel(options) {
    var _this = this,
      list = ko.observableArray();
    EmContactsGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      list: list,
      plugins: [
        new MoveRows({
          observableArray: list,
          orderName: 'OrderNumber',
          onOrderChanged: function(changedRows) {
            changedRows.forEach(function(item) {
              options.save(item);
            });
          },
        }),
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(item) {
            options.edit(item, function(model, deleted) {
              if (!model) { // nothing changed
                return;
              }
              if (deleted) { // remove deleted item
                _this.list.remove(item);
              } else { // update in place
                _this.list.replace(item, model);
              }
            });
          },
        }),
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
          id: 'Name',
          name: 'Name',
          formatter: options.fullnameFormatter,
        },
        {
          id: 'RelationshipId',
          name: 'RelationshipId',
          field: 'RelationshipId',
          formatter: options.relationshipFormatter,
        },
        {
          id: 'Phone1',
          name: 'Phone1',
          field: 'Phone1',
          width: 50,
        },
        {
          id: 'Phone2',
          name: 'Phone2',
          field: 'Phone2',
          width: 50,
        },
        {
          id: 'Phone3',
          name: 'Phone3',
          field: 'Phone3',
          width: 50,
        },
        {
          id: 'HasKey',
          name: 'HasKey',
          field: 'HasKey',
          // resizable: false,
          width: 30,
          formatter: options.yesNoFormatter,
        },
      ],
    });
  }
  utils.inherits(EmContactsGridViewModel, SlickGridViewModel);

  // EmContactsGridViewModel.prototype.augmentMenuVm = function(menuVm) {
  //   var _this = this;
  //   menuVm.clickDelete = function() {
  //     var item = _this.grid.getDataItem(menuVm.cell.row);
  //     console.log(item);
  //   };
  //   menuVm.viewTmpl = 'tmpl-security-emcontacts_ctxmenu';
  // };

  EmContactsGridViewModel.prototype.nextOrderNumber = function() {
    var _this = this,
      list = _this.list(),
      orderNumber;
    if (list.length) {
      orderNumber = list[list.length - 1].OrderNumber;
      if (!orderNumber) {
        orderNumber = list.length;
      }
      orderNumber += 1;
    } else {
      orderNumber = 1;
    }
    return orderNumber;
  };

  return EmContactsGridViewModel;
});
