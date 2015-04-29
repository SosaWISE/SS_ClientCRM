define("src/account/salesinfo/v02/invoice.model", [
  "src/account/salesinfo/v02/invoiceitems.editor.vm",
  "src/account/salesinfo/options",
  "src/account/accounts-cache",
  "ko",
  "src/ukov",
  "src/core/strings",
  "src/core/money",
  "src/core/combo.vm",
  "src/core/joiner",
  "src/core/utils",
], function(
  InvoiceItemsEditorViewModel,
  salesInfoOptions,
  accountscache,
  ko,
  ukov,
  strings,
  money,
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
      "saveInvoiceItems",
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

    var ignore = true;

    function createComputedInvItem(itemTypeId, upsaleItemId, discountItemId, over3ItemId) {
      var model = ukov.wrap({
        fee: 0,
        over3Months: false,
      }, computedInvItemSchema);

      function setIsDeleted(invItems, isDeleted) {
        invItems.forEach(function(invoiceItem) {
          invoiceItem.IsDeleted = isDeleted;
        });
      }

      //
      // update invoice items when model changes
      //
      model.fee.subscribe(function(actualFee) {
        if (ignore || !model.isValid() || !utils.isNum(actualFee)) {
          return;
        }
        if (model.fee.isClean.peek()) {
          console.log("fee handler clean");
          return;
        }
        //
        // modify upsaleItemId and discountItemId invoice items
        //

        var invoiceItems = data.invoiceItems.peek();
        var fee = money.sub(actualFee, sumRetailPrice(filterInvoiceItems(invoiceItems, [itemTypeId], [])
          .filter(function(invoiceItem) {
            return !invoiceItem.IsDeleted;
          })));

        var invItems = filterInvoiceItems(invoiceItems, [], [upsaleItemId, discountItemId]);
        // start with all deleted
        setIsDeleted(invItems, true);

        if (fee !== 0) {
          var itemId = (fee < 0) ? discountItemId : upsaleItemId;
          var invoiceItem = filterInvoiceItems(invItems, [], [itemId])[0];
          if (!invoiceItem) {
            // create item
            invItems.push(invoiceItem = {});
          }
          var item = accountscache.getMap("invoices/items")[itemId];
          InvoiceItemsEditorViewModel.copyInvoiceItemFromItem(invoiceItem, item);
          //
          invoiceItem.RetailPrice = fee;
          invoiceItem.PriceWithTax = fee;
        }

        // notify invoice items were updated
        options.saveInvoiceItems(invItems);
      });
      if (over3ItemId) {
        model.over3Months.subscribe(function(over3Months) {
          if (ignore || !model.isValid()) {
            return;
          }
          if (model.over3Months.isClean.peek()) {
            console.log("over3Months handler clean");
            return;
          }
          //
          // modify over3ItemId invoice items
          //

          var invoiceItems = data.invoiceItems.peek();
          var invItems = filterInvoiceItems(invoiceItems, [], [over3ItemId]);
          // start with all deleted
          setIsDeleted(invItems, true);

          // update the first invoice item
          if (over3Months) {
            var invoiceItem = invItems[0];
            if (!invoiceItem) {
              // create item
              invItems.push(invoiceItem = {});
            }
            var item = accountscache.getMap("invoices/items")[over3ItemId];
            InvoiceItemsEditorViewModel.copyInvoiceItemFromItem(invoiceItem, item);
            //
            // @Over3MonthsDisc =
            //  CAST(
            //    SUM(AII.RetailPrice)
            //    - (CAST(SUM(AII.RetailPrice) AS FLOAT) / 3)
            //  AS DECIMAL(6,2))
            var sum = sumRetailPrice(filterInvoiceItems(invoiceItems, [itemTypeId], [upsaleItemId, discountItemId]));
            sum = money.sub(sum, money.div(sum, 3));
            invoiceItem.RetailPrice = money.mult(sum, -1);
            invoiceItem.PriceWithTax = money.mult(sum, -1);
          }
          // notify invoice items were updated
          options.saveInvoiceItems(invItems);
        });
      }

      // update model when invoice items change
      model.updateModel = function() {
        var items = data.invoiceItems.peek();
        //
        // calculate total for invoice items
        model.fee(sumRetailPrice(filterInvoiceItems(items, [itemTypeId], [upsaleItemId, discountItemId])));
        // find undeleted item
        var item = filterInvoiceItems(items, [], [over3ItemId])[0];
        model.over3Months(!!(item && !item.IsDeleted));
        // clean it
        model.markClean({}, true);
      };

      // combos
      model.over3MonthsCvm = new ComboViewModel({
        selectedValue: model.over3Months,
        list: salesInfoOptions.over3Months,
      });

      return model;
    }

    data.rmr = createComputedInvItem("MON_CONT", "MMR_SREP_UPSL", "MMR_SREP_DISC", null);
    data.activation = createComputedInvItem("SETUP_FEE", "SETUP_FEE_UPSL", "SETUP_FEE_DISC", "SETUP_FEE_OVR3");

    function updateModels() {
      console.log("updateModels");
      //
      ignore = true;
      //
      data.rmr.updateModel();
      data.activation.updateModel();
      //
      ignore = false;
    }
    data.invoiceItems.subscribe(updateModels);
    // force first update
    updateModels();

    data.findInvoiceItems = function(itemTypeIds, itemIds) {
      var items = data.invoiceItems.peek();
      return filterInvoiceItems(items, itemTypeIds, itemIds);
    };

    return data;
  }
  // var rangeValidationGroup = {
  //   keys: ["fee", "range"],
  //   // no validators needed here, just need this in order to revalidate fee whenever range changes
  //   validators: [],
  // };
  var computedInvItemSchema = {
    _model: true,
    range: {
      // validationGroup: rangeValidationGroup,
    },
    fee: {
      converter: ukov.converters.number(2, "Invalid fee"),
      validators: [
        ukov.validators.isRequired(),
        // ukov.validators.isInRange(0, 999, "Invalid amount"),
        // function(val, model) {
        //   var range = model.range || {};
        //   var min = range.min || 0;
        //   var max = range.max || 999;
        //   if (val < min || max < val) {
        //     return strings.format("Must be between {0:$} and {1:$}", min, max);
        //   }
        // }
      ],
      // validationGroup: rangeValidationGroup,
    },
    over3Months: {
      converter: ukov.converters.bool(),
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
      return money.add(total, item.RetailPrice);
    }, 0);
  }

  return invoice_model;
});
