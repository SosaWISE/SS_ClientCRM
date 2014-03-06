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
          id: 'Name',
          name: 'Name',
          width: 50,
          formatter: options.fullnameFormatter,
        },
        {
          id: 'RelationshipId',
          name: 'Relationship',
          field: 'RelationshipId',
          width: 50,
          formatter: options.relationshipFormatter,
        },
        {
          id: 'Phone1',
          name: 'Primary Phone',
          field: 'Phone1',
          width: 50,
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return formatPhoneAndType(value, dataCtx.Phone1TypeId);
          },
        },
        {
          id: 'Phone2',
          name: 'Secondary Phone',
          field: 'Phone2',
          width: 50,
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return formatPhoneAndType(value, dataCtx.Phone2TypeId);
          },
        },
        {
          id: 'Phone3',
          name: 'Alternate Phone',
          field: 'Phone3',
          width: 50,
          formatter: function(row, cell, value, columnDef, dataCtx) {
            return formatPhoneAndType(value, dataCtx.Phone3TypeId);
          },
        },
        {
          id: 'HasKey',
          name: 'Has Keys',
          field: 'HasKey',
          // resizable: false,
          width: 30,
          minWidth: 15,
          formatter: SlickGridViewModel.formatters.xFormatter,
        },
      ],
    });

    function formatPhoneAndType(phone, type) {
      type = options.getPhoneType(type);
      if (type && type.MsPhoneTypeId && phone) {
        return type.MsPhoneTypeId + ': ' + phone;
      }
      return phone;
    }
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
