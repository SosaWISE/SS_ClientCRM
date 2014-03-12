define('src/account/security/parts.editor.vm', [
  'src/dataservice',
  'src/core/combo.vm',
  'src/core/strings',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'ko',
  'src/ukov',
], function(
  dataservice,
  ComboViewModel,
  strings,
  notify,
  utils,
  BaseViewModel,
  ko,
  ukov
) {
  "use strict";

  var schema,
    strConverter = ukov.converters.string();

  schema = {
    _model: true,

    InvoiceID: {
      validators: [
        ukov.validators.isRequired('Zip code is required'),
      ],
    },
    BarcodeId: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Barcode is required'),
      ],
    },
    ItemSku: {
      converter: strConverter,
      validators: [
        ukov.validators.isRequired('Part # is required'),
      ],
    },
    Qty: {
      converter: ukov.converters.number(0),
    },
    SalesmanID: {},
    TechnicianID: {},
  };


  function PartsEditorViewModel(options) {
    var _this = this,
      assignToList;
    PartsEditorViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'byPart',
      'invoiceID',
      // 'salesman',
      // 'technician',
    ]);

    _this.focusFirst = ko.observable();
    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to actually focus
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

    _this.data = ukov.wrap(_this.item || {
      InvoiceID: _this.invoiceID,
      Qty: 1,
      // XOR - BarcodeId and ItemSku
      BarcodeId: !_this.byPart ? _this.barcode : null,
      ItemSku: _this.byPart ? _this.itemSku : null,
      // XOR - SalesmanID and TechnicianID
      SalesmanID: null,
      TechnicianID: null,
    }, schema);
    if (_this.byPart) {
      _this.data.BarcodeId.ignore(true);
    } else {
      _this.data.ItemSku.ignore(true);
    }
    _this.data.update(false, false);

    assignToList = _this.getAssignToList();
    _this.data.AssignToCvm = new ComboViewModel({
      // try to select first item in assignToList
      selectedValue: ukov.wrap(assignToList.length ? assignToList[0].value : '', {
        validators: [
          //
          function(value) {
            value = value || null;

            //@REVIEW: not sure if setting the value in a validator is the best method...
            if (value === _this.salesman.id) {
              _this.data.SalesmanID(value);
              _this.data.TechnicianID(null);
            } else {
              _this.data.SalesmanID(null);
              _this.data.TechnicianID(value);
            }

            if (!value) {
              return 'Please assign the equipment to someone';
            }
          },
        ]
      }),
      list: assignToList,
    });

    //
    // events
    //
    _this.cmdCancel = ko.command(function(cb) {
      closeLayer(null);
      cb();
    }, function(busy) {
      return !busy && !_this.cmdSave.busy();
    });
    _this.cmdSave = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.notify('warn', _this.data.errMsg(), 7);
        cb();
        return;
      }
      dataservice.invoicesrv.invoiceItems.save({
        id: _this.invoiceID,
        link: _this.byPart ? 'AddByPartNumber' : 'AddByBarcode',
        data: _this.data.getValue(),
      }, null, utils.safeCallback(cb, function(err, resp) {
        closeLayer(resp.Value);
      }, function(err) {
        notify.notify('error', err.Message);
      }));
    });

    function closeLayer(result) {
      if (_this.layer) {
        _this.layer.close(result);
      }
    }
  }
  utils.inherits(PartsEditorViewModel, BaseViewModel);
  PartsEditorViewModel.prototype.viewTmpl = 'tmpl-security-parts_editor';
  PartsEditorViewModel.prototype.width = 290;
  PartsEditorViewModel.prototype.height = 'auto';

  PartsEditorViewModel.prototype.getAssignToList = function() {
    var _this = this,
      result = [];

    function addItem(obj, css) {
      if (obj) {
        result.push({
          value: obj.id,
          text: strings.format('{0} - {1}', obj.id, obj.name),
          cssClass: css,
        });
      }
    }
    addItem(_this.salesman, 'salesman');
    addItem(_this.technician, 'technician');

    return result;
  };

  return PartsEditorViewModel;
});
