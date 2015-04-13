define("src/account/salesinfo/v02/invoice.model", [
  "src/account/salesinfo/options",
  "src/account/accounts-cache",
  "ko",
  "src/ukov",
  "src/core/combo.vm",
  "src/core/joiner",
  "src/core/utils",
], function(
  salesInfoOptions,
  accountscache,
  ko,
  ukov,
  ComboViewModel,
  joiner,
  utils
) {
  "use strict";

  function invoice_model(options) {
    utils.assertProps(options, [
      "layersVm",
      "handler",
      "yesNoOptions",
      "getRepId",
      "getTekId",
    ]);
    // var handler = options.handler;

    var invoice = {};
    var data = function(inv) {
      if (arguments.length) {
        invoice = inv;
        data.invoiceItems(inv.InvoiceItems || []);
      }
      return invoice;
    };
    data.peek = function() { // ¿mimick an observable?
      return invoice;
    };
    data.invoiceItems = ko.observable([]);
    data.invoiceItems.subscribe(function(items) {
      invoice.InvoiceItems = items;
    });

    data.load = function(cb) {
      var join = joiner().after(cb);
      accountscache.ensure("invoices/items", join.add());
    };

    function createComputedInvoiceItem(itemId, itemTypeId, upsaleItemId, discountItemId, over3ItemId) {
      var model = ukov.wrap({
        fee: 0,
        over3Months: false,
        hasItem: false,
      }, schema);
      var ignore = false;

      // update invoice items when model changes
      model.fee.subscribe(function() {
        if (ignore) {
          return;
        }
        //@TODO: update invoice items
        var fee = model.fee.getValue();
        fee = fee;
        throw new Error("not implemented");
      });
      model.over3Months.subscribe(function(over3Months) {
        if (ignore) {
          return;
        }
        var isDeleted = !over3Months;
        var items = filterInvoiceItems(data.invoiceItems.peek(), [], [over3ItemId]);
        items.forEach(function(item) {
          item.IsDeleted = isDeleted;
        });

        // @Over3MonthsDisc =
        //  CAST(
        //    SUM(AII.RetailPrice)
        //    - (CAST(SUM(AII.RetailPrice) AS FLOAT) / 3)
        //  AS DECIMAL(6,2))
        var sum = sumRetailPrice(filterInvoiceItems(data.invoiceItems.peek(), [itemTypeId], [upsaleItemId, discountItemId]));
        sum = sum - (sum / 3);

        var newItem;
        // update invoice items
        if (over3Months) {
          if (!items.length) {
            // create item
            newItem = {
              ItemId: over3ItemId,
              TaxOptionId: "TAX",
              Cost: 0,
              IsActive: true,
              IsDeleted: false,
            };
            items = [newItem];
          }
          items.forEach(function(item) {
            item.Qty = 1;
            item.RetailPrice = sum * -1;
            item.PriceWithTax = sum * -1;
            item.SalesmanId = options.getRepId();
            item.TechnicianId = options.getTekId();
          });
        }
        // notify invoice items were updated
        items = data.invoiceItems.peek();
        if (newItem) {
          items.push(newItem);
        }
        data.invoiceItems(items);
      });
      model.hasItem.subscribe(function(hasItem) {
        if (ignore) {
          return;
        }
        var isDeleted = !hasItem;
        var items = filterInvoiceItems(data.invoiceItems.peek(), [itemTypeId], [upsaleItemId, discountItemId, over3ItemId]);
        items.forEach(function(item) {
          item.IsDeleted = isDeleted;
        });
        var newItem;
        if (itemId && hasItem && !items.length) {
          newItem = {
            ItemId: itemId,
            // ItemId: itemTypeId,
            TaxOptionId: "TAX",
            Cost: 0,
            IsActive: true,
            IsDeleted: false,
          };
          items = [newItem];
          items.forEach(function(item) {
            item.Qty = 1;
            item.RetailPrice = 0;
            item.PriceWithTax = 0;
            item.SalesmanId = options.getRepId();
            item.TechnicianId = options.getTekId();
          });
        }
        // notify invoice items were updated
        items = data.invoiceItems.peek();
        if (newItem) {
          items.push(newItem);
        }
        data.invoiceItems(items);
      });

      // update model when invoice items change
      function updateModel() {
        var items = data.invoiceItems.peek();
        //
        ignore = true;
        // calculate total for invoice items
        model.fee(sumRetailPrice(filterInvoiceItems(items, [itemTypeId], [upsaleItemId, discountItemId])));
        // find undeleted item
        var item = filterInvoiceItems(items, [], [over3ItemId])[0];
        model.over3Months(!!(item && !item.IsDeleted));
        // find undeleted item
        item = filterInvoiceItems(items, [itemTypeId], [])[0];
        model.hasItem(!!(item && !item.IsDeleted));
        //
        ignore = false;
      }
      data.invoiceItems.subscribe(updateModel);
      // force first update
      updateModel();

      // combos
      model.over3MonthsCvm = new ComboViewModel({
        selectedValue: model.over3Months,
        list: salesInfoOptions.over3Months,
      });
      model.hasItemCvm = new ComboViewModel({
        selectedValue: model.hasItem,
        list: options.yesNoOptions,
      });

      return model;
    }

    data.activation = createComputedInvoiceItem(
      "SETUP_FEE_199", "SETUP_FEE", "SETUP_FEE_UPSL", "SETUP_FEE_DISC", "SETUP_FEE_OVR3");
    data.rmr = createComputedInvoiceItem(
      null, "MON_CONT", "MMR_SREP_UPSL", "MMR_SREP_DISC", null);
    data.upgrades = createComputedInvoiceItem(
      "UPG_FEE", "UPG_FEE", null, null, "UPG_FEE_OVR3");

    return data;
  }

  // var dateConverter = ukov.converters.date();
  // var schema = {
  //   _model: true,

  //   ID: {},
  //   AccountId: {},
  //   InvoiceTypeId: {},
  //   ContractId: {},
  //   TaxScheduleId: {},
  //   PaymentTermId: {},
  //   DocDate: {},
  //   PostedDate: {},
  //   DueDate: {},
  //   GLPostDate: {},
  //   CurrentTransactionAmount: {},
  //   SalesAmount: {},
  //   OriginalTransactionAmount: {},
  //   CostAmount: {},
  //   TaxAmount: {},
  //   IsActive: {},
  //   IsDeleted: {},
  //   ModifiedOn: {},
  //   ModifiedBy: {},
  //   CreatedOn: {},
  //   CreatedBy: {},

  //   InvoiceItems: [ //
  //     {
  //       _model: true,

  //     },
  //   ],
  // };

  var boolConverter = ukov.converters.bool();
  var schema = {
    _model: true,

    fee: {
      converter: ukov.converters.number(2, "Invalid amount"),
      validators: [
        ukov.validators.isRequired(),
      ],
    },
    over3Months: {
      converter: boolConverter,
    },
    hasItem: {
      converter: boolConverter,
    },
  };

  function filterInvoiceItems(list, itemTypeIds, itemIds) {
    var typeIdMap = {};
    itemTypeIds.forEach(function(typeId) {
      if (typeId) {
        typeIdMap[typeId.toUpperCase()] = true;
      }
    });
    var itemIdMap = {};
    itemIds.forEach(function(itemId) {
      if (itemId) {
        itemIdMap[itemId.toUpperCase()] = true;
      }
    });
    return list.filter(function(invoiceItem) {
      if (itemIdMap[invoiceItem.ItemId]) {
        return true;
      }
      // get the InvoiceItem then check for existance of ItemTypeId
      var item = accountscache.getMap("invoices/items")[invoiceItem.ItemId];
      return item && typeIdMap[item.ItemTypeId];
    });
  }

  function sumRetailPrice(list) {
    return list.reduce(function(total, item) {
      if (item.IsDeleted) {
        return total;
      }
      return total + item.RetailPrice;
    }, 0);
  }

  return invoice_model;
});
