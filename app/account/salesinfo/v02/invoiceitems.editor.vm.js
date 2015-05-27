define("src/account/salesinfo/v02/invoiceitems.editor.vm", [
  "src/account/mscache",
  "src/account/default/rep.find.vm",
  "dataservice",
  "src/core/combo.vm",
  "src/core/arrays",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
  "ko",
  "src/ukov",
], function(
  mscache,
  RepFindViewModel,
  dataservice,
  ComboViewModel,
  arrays,
  strings,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema;
  // var strConverter = ukov.converters.string();

  schema = {
    _model: true,

    ItemId: {
      validators: [
        ukov.validators.isRequired("Please select a part"),
      ],
    },
    Assignee: {
      // validators: [
      //   ukov.validators.isRequired("Please select an assignee"),
      // ],
    },
    Qty: {
      converter: ukov.converters.number(0),
      validators: [ //
        ukov.validators.isInRange(0, 99, "Invalid quantity"),
      ],
    },
  };


  function InvoiceItemsEditorViewModel(options) {
    var _this = this;
    InvoiceItemsEditorViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "layersVm",
      "invoice",
      "cache",
    ]);
    // utils.assertProps(_this.invoice, [
    //   "InvoiceItems",
    // ]);
    utils.assertProps(_this.cache, [
      "reps",
    ]);
    if (_this.invoiceItemGrp) {
      utils.assertProps(_this.invoiceItemGrp, [
        "groupItems",
      ]);
    }

    _this.mixinLoad();

    _this.initActiveFocus("focusOk");

    // if (!_this.item) {
    //   _this.item = {
    //     InvoiceID: _this.invoice.ID,
    //     Qty: 1,
    //     // XOR - BarcodeId and ItemSku
    //     BarcodeId: !_this.byPart ? _this.barcode : null,
    //     ItemSku: _this.byPart ? _this.itemSku : null,
    //     // XOR - SalesmanId and TechnicianId
    //     SalesmanId: null,
    //     // TechnicianId: null,
    //   };
    // }

    function getModel() {
      var invoiceItemGrp = _this.invoiceItemGrp;
      if (invoiceItemGrp) {
        return {
          ItemId: invoiceItemGrp.ItemId || null,
          Assignee: invoiceItemGrp.SalesmanId || null,
          Qty: invoiceItemGrp.groupItems.length,
        };
      } else {
        return {
          ItemId: options.itemId || null,
          Assignee: options.salesrepId || null,
          Qty: 1,
        };
      }
    }

    _this.data = ukov.wrap(getModel(), schema);

    _this.data.ItemCvm = new ComboViewModel({
      selectedValue: _this.data.ItemId,
      // fields: mscache.metadata("invoices/items"),
      fields: {
        value: "ID",
        text: function(item) {
          return strings.format("{1} - {0}", item.ItemDesc, item.ItemSKU);
        },
      },
      // assumes invoices/items have already been loaded
      list: mscache.getList("invoices/items").peek().filter(function(item) {
        return !item.IsDeleted;
      }),
    });
    if (!_this.data.ItemCvm.selectedValue.peek()) {
      _this.data.ItemCvm.selectFirst();
    }

    _this.data.AssigneeCvm = new ComboViewModel({
      nullable: true,
      selectedValue: _this.data.Assignee,
      list: _this.cache.reps,
      fields: {
        value: "CompanyID",
        text: function(rep) {
          return strings.format("{0} - {1}", rep.CompanyID, strings.joinTrimmed(" ", rep.FirstName, rep.LastName));
        },
      },
      actions: [ //
        {
          text: "Find Rep",
          onClick: function(filterText) {
            var vm = new RepFindViewModel({
              title: "Find Rep",
              text: filterText,
            });
            if (filterText.length) {
              vm.cmdFind.execute();
            }
            _this.layersVm.show(vm, function(rep) {
              repHandler(_this, rep);
            });
          },
        }
      ],
    });
    if (!_this.data.AssigneeCvm.selectedValue.peek()) {
      _this.data.AssigneeCvm.selectFirst();
    }

    //
    // events
    //
    _this.clickCancel = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 7);
        return cb();
      }
      var qty = _this.data.Qty.getValue();
      var salesmanId = _this.data.Assignee.getValue();
      var item = _this.data.ItemCvm.selectedItem();
      var invoiceItems = _this.invoiceItemGrp ? _this.invoiceItemGrp.groupItems : [];
      var length = Math.max(qty, invoiceItems.length);

      function findDeletedItem(invItem) {
        return invItem.IsDeleted && invItem.ItemId === item.ID;
      }

      for (var i = 0; i < length; i++) {
        var invoiceItem = invoiceItems[i];
        if (i < qty) {
          // update or create
          if (!invoiceItem) {
            // try to undelete or create new
            invoiceItem = arrays.first(_this.invoice.InvoiceItems, findDeletedItem) || {};
            // add to list to be saved
            invoiceItems.push(invoiceItem);
          }
          copyInvoiceItemFromItem(invoiceItem, item);
          invoiceItem.SalesmanId = salesmanId;
          // invoiceItem.TechnicianId = null;
          // invoiceItem.ProductBarcodeId = null;
          // invoiceItem.AccountEquipmentId = null;
          // invoiceItem.IsActive = true;
          // invoiceItem.IsDeleted = false;
        } else {
          // deleted
          invoiceItem.IsDeleted = true;
        }
      }
      dataservice.api_ms.invoices.save({
        id: _this.invoice.ID,
        data: {
          ModifiedOn: _this.invoice.ModifiedOn,
          InvoiceItems: invoiceItems,
        }
      }, function(inv) {
        _this.layerResult = inv;
        closeLayer(_this);
      }, cb);
    });
  }
  utils.inherits(InvoiceItemsEditorViewModel, BaseViewModel);
  InvoiceItemsEditorViewModel.prototype.viewTmpl = "tmpl-salesinfo-v02-invoiceitems_editor";
  InvoiceItemsEditorViewModel.prototype.width = 400;
  InvoiceItemsEditorViewModel.prototype.height = "auto";

  InvoiceItemsEditorViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    var assignee = _this.data.Assignee.cleanVal.peek();
    if (assignee && !_this.data.Assignee.peek()) {
      loadRep(assignee, function(rep) {
        repHandler(_this, rep);
        _this.data.markClean({}, true);
      }, join.add());
    } else {
      //
      _this.data.markClean({}, true);
    }
  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  InvoiceItemsEditorViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  InvoiceItemsEditorViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = "Please wait for save to finish.";
    }
    return msg;
  };

  function loadRep(companyId, setter, cb) {
    dataservice.qualify.salesrep.read({
      id: companyId,
    }, setter, cb);
  }

  function repHandler(_this, rep) {
    if (rep) {
      var value = rep.CompanyID;
      if (!_this.data.AssigneeCvm.hasValue(value)) {
        _this.cache.reps.push(rep);
        _this.data.AssigneeCvm.setList(_this.cache.reps);
      }
      _this.data.AssigneeCvm.selectedValue(value);
    }
  }

  function copyInvoiceItemFromItem(invoiceItem, item) {
    invoiceItem.ItemId = item.ID;
    invoiceItem.Qty = 1; // always 1
    invoiceItem.Cost = item.Cost;
    invoiceItem.RetailPrice = item.Price;
    invoiceItem.PriceWithTax = item.Price;
    invoiceItem.SystemPoints = item.SystemPoints;
    invoiceItem.TaxOptionId = item.TaxOptionId;
    // if this is being called the invoice
    // item should be active and not deleted
    invoiceItem.IsActive = true;
    invoiceItem.IsDeleted = false;
    // ensure fields are set
    utils.setIfNull(invoiceItem, {
      SalesmanId: null,
      TechnicianId: null,
      ProductBarcodeId: null,
      AccountEquipmentId: null,
      // IsActive: true,
      // IsDeleted: false,
    });
  }
  InvoiceItemsEditorViewModel.copyInvoiceItemFromItem = copyInvoiceItemFromItem;

  return InvoiceItemsEditorViewModel;
});
