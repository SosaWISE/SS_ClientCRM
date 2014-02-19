define('src/account/security/emcontacts.gvm', [
  'jquery',
  'ko',
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  jquery,
  ko,
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function EmContactsGridViewModel(options) {
    var _this = this;
    EmContactsGridViewModel.super_.call(_this, {
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27,
      },
      plugins: [
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
          id: 'OrderNumber',
          name: 'OrderNumber',
          field: 'OrderNumber',
        },
        {
          id: 'FirstName',
          name: 'FirstName',
          field: 'FirstName',
        },
        {
          id: 'MiddleName',
          name: 'MiddleName',
          field: 'MiddleName',
        },
        {
          id: 'LastName',
          name: 'LastName',
          field: 'LastName',
        },
        {
          id: 'RelationshipId',
          name: 'RelationshipId',
          field: 'RelationshipId',
        },
        {
          id: 'Phone1',
          name: 'Phone1',
          field: 'Phone1',
        },
        {
          id: 'Phone2',
          name: 'Phone2',
          field: 'Phone2',
        },
        {
          id: 'Phone3',
          name: 'Phone3',
          field: 'Phone3',
        },
        {
          id: 'HasKey',
          name: 'HasKey',
          field: 'HasKey',
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
