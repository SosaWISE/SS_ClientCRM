define('src/account/vm.notes', [
  'src/slick/rowevent',
  'src/slick/vm.slickgrid',
  'src/ukov',
  'ko',
  'src/core/vm.combo',
  'src/core/mixin.load',
  'src/dataservice',
  'src/core/notify',
  'src/core/utils',
  'src/core/vm.base',
], function(
  RowEvent,
  SlickGridViewModel,
  ukov,
  ko,
  ComboViewModel,
  mixin_load,
  dataservice,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  var schema,
    schemaNote,
    strConverter = ukov.converters.string();

  schema = {
    _model: true,
    NoteID: {},
    NoteTypeId: {},
    CustomerMasterFileId: {},
    CustomerId: {},
    LeadId: {},
    NoteCategory1Id: {
      validators: [
        ukov.validators.isRequired('Please select a primary reason'),
      ],
    },
    NoteCategory2Id: {
      validators: [
        //
        function(val, model) {
          model = arguments;
          return null;
        },
        ukov.validators.isRequired('Please select a secondary reason'),
      ],
    },
    Note: {
      converter: strConverter,
      // validators: [
      //   ukov.validators.isRequired('Note is required'),
      // ],
    },
  };
  schemaNote = {
    converter: strConverter,
    validators: [
      ukov.validators.isRequired('Please enter a note'),
    ],
  };

  function NotesViewModel(options) {
    var _this = this;
    NotesViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['id']);

    _this.initMixinLoad();

    _this.note = ukov.wrap('', schemaNote);
    _this.data = ukov.wrap({
      // NoteID: 0,
      NoteTypeId: 'AUTO_GEN',
      CustomerMasterFileId: _this.id,
      Note: '',
    }, schema);
    _this.data.NoteCategory1IdCvm = new ComboViewModel({
      selectedValue: _this.data.NoteCategory1Id,
      noItemSelectedText: '[Primary Reason]',
      fields: {
        value: 'NoteCategory1ID',
        text: 'Category',
      },
      list: [
        {
          NoteCategory1ID: 1,
          Category: 'Master Account Access',
          Description: 'General Access to Master Account',
        },
      ]
    });
    _this.data.NoteCategory1IdCvm.selectedValue(1);
    _this.data.NoteCategory2IdCvm = new ComboViewModel({
      selectedValue: _this.data.NoteCategory2Id,
      noItemSelectedText: '[Secondary Reason]',
      fields: {
        value: 'NoteCategory2ID',
        text: 'Description',
      },
    });

    _this.departmentsCvm = new ComboViewModel({
      noItemSelectedText: '[Department]',
      fields: {
        value: 'DepartmentID',
        text: 'DepartmentName',
      },
    });


    _this.notesGvm = new SlickGridViewModel({
      options: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27 * 2,
      },
      plugins: [
        new RowEvent({
          eventName: 'onDblClick',
          fn: function(item) {
            notify.notify('info', item.Note, 5);
          },
        }),
      ],
      columns: [
        {
          id: 'CreatedOn',
          name: 'Date',
          field: 'CreatedOn',
          width: 40,
          cssClass: 'wrap-cell',
        },
        {
          id: 'CreatedBy',
          name: 'User',
          field: 'CreatedBy',
          width: 30,
        },
        {
          id: 'NoteCategory1Id',
          name: 'Primary Reason ID',
          field: 'NoteCategory1Id',
          width: 30,
        },
        {
          id: 'NoteCategory2Id',
          name: 'Secondary Reason',
          field: 'NoteCategory2Id',
          width: 30,
        },
        {
          id: 'Note',
          name: 'Note',
          field: 'Note',
          width: 300,
          cssClass: 'wrap-cell',
          title: 'Note',
        },
      ],
    });

    //
    // events
    //
    _this.cmdAppend = ko.command(function(cb) {
      appendNote(_this.note, _this.data, cb);
    });
    _this.cmdAppendClose = ko.command(function(cb) {
      _this.cmdAppend.execute(function(err) {
        if (err) {
          return cb();
        }
        alert('@TODO: close account');
        cb();
      });
    });

    //
    // subscriptions
    //
    _this.departmentsCvm.selectedValue.subscribe(function(selectedValue) {
      _this.data.NoteCategory1IdCvm.setList([]);
      if (!selectedValue) {
        return;
      }
      dataservice.maincore.notecategory1.read({
        id: selectedValue,
        link: 'departmentid',
      }, null, function(err, resp) {
        utils.safeCallback(err, function() {
          if (_this.departmentsCvm.selectedValue() === selectedValue) {
            // make sure selectedValue hasn't changed
            _this.data.NoteCategory1IdCvm.setList(resp.Value);
          }
        }, function(err) {
          if (err) {
            notify.notify('error', err.Message);
          }
        });
      });
    });
    _this.data.NoteCategory1IdCvm.selectedValue.subscribe(function(selectedValue) {
      _this.data.NoteCategory2IdCvm.setList([]);
      if (!selectedValue) {
        return;
      }
      dataservice.maincore.notecategory2.read({
        id: selectedValue,
        link: 'category1id',
      }, null, function(err, resp) {
        utils.safeCallback(err, function() {
          if (_this.data.NoteCategory1IdCvm.selectedValue() === selectedValue) {
            // make sure selectedValue hasn't changed
            _this.data.NoteCategory2IdCvm.setList(resp.Value);
          }
        }, function(err) {
          if (err) {
            notify.notify('error', err.Message);
          }
        });
      });
    });
  }
  utils.inherits(NotesViewModel, BaseViewModel);
  NotesViewModel.prototype.viewTmpl = 'tmpl-notes';

  NotesViewModel.prototype.onLoad = function(routeData, join) { // overrides base
    var _this = this;
    load_departments(_this.departmentsCvm, join.add());
    load_notes(_this.id, _this.notesGvm, join.add());
    createNote(_this.data, join.add());
  };

  function createNote(ukovData, cb) {
    var model = ukovData.getValue();
    dataservice.maincore.notes.save(model, null, function(err, resp) {
      utils.safeCallback(err, function() {
        ukovData.setVal(resp.Value);
        ukovData.markClean(resp.Value);
      }, cb);
    });
  }

  function appendNote(note, ukovData, cb) {
    if (!ukovData.isValid()) {
      notify.notify('warn', ukovData.errMsg(), 7);
      return cb(ukovData.errMsg());
    }
    if (!note.isValid()) {
      notify.notify('warn', note.errMsg(), 7);
      return cb(note.errMsg());
    }

    var model = ukovData.getValue();
    model.Note = (model.Note) ? model.Note + '\n' : '';
    model.Note += note();

    note('');

    dataservice.maincore.notes.save(model, null, function(err, resp) {
      utils.safeCallback(err, function() {
        ukovData.setVal(resp.Value);
        ukovData.markClean(resp.Value);
      }, cb);
    });
  }

  function load_departments(cvm, cb) {
    dataservice.maincore.departments.read({}, null, function(err, resp) {
      utils.safeCallback(err, function() {
        cvm.setList(resp.Value);
        cvm.selectItem(cvm.list()[0]);
      }, cb);
    });
  }

  function load_notes(id, gvm, cb) {
    gvm.list([]);
    dataservice.maincore.notes.read({
      id: id,
      link: 'cmfid',
    }, null, function(err, resp) {
      utils.safeCallback(err, function() {
        gvm.list(resp.Value || []);
      }, cb);
    });
  }


  return NotesViewModel;
});
