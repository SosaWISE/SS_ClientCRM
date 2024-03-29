define("src/account/default/notes.vm", [
  "moment",
  "src/slick/rowevent",
  "src/slick/slickgrid.vm",
  "src/ukov",
  "ko",
  "src/core/combo.vm",
  "dataservice",
  "src/core/notify",
  "src/core/utils",
  "src/core/base.vm",
], function(
  moment,
  RowEvent,
  SlickGridViewModel,
  ukov,
  ko,
  ComboViewModel,
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
        ukov.validators.isRequired("Please select a primary reason"),
      ],
    },
    NoteCategory2Id: {
      validators: [ //
        // function(val, model) {
        //   return null;
        // },
        ukov.validators.isRequired("Please select a secondary reason"),
      ],
    },
    Note: {
      converter: strConverter,
      // validators: [
      //   ukov.validators.isRequired("Note is required"),
      // ],
    },
  };
  schemaNote = {
    converter: strConverter,
    validators: [
      ukov.validators.isRequired("Please enter a note"),
    ],
  };

  function NotesViewModel(options) {
    var _this = this;
    NotesViewModel.super_.call(_this, options);
    utils.assertProps(_this, [
      "id",
      "ownerVm",
    ]);

    _this.mixinLoad();

    _this.note = ukov.wrap("", schemaNote);
    _this.data = ukov.wrap({
      // NoteID: 0,
      NoteTypeId: "AUTO_GEN",
      CustomerMasterFileId: _this.id,
      Note: "",
    }, schema);
    _this.data.NoteCategory1IdCvm = new ComboViewModel({
      selectedValue: _this.data.NoteCategory1Id,
      noItemSelectedText: "[Primary Reason]",
      fields: {
        value: "NoteCategory1ID",
        text: "Category",
      },
    });
    _this.data.NoteCategory2IdCvm = new ComboViewModel({
      selectedValue: _this.data.NoteCategory2Id,
      noItemSelectedText: "[Secondary Reason]",
      fields: {
        value: "NoteCategory2ID",
        text: "Category",
      },
    });

    _this.departmentsCvm = new ComboViewModel({
      noItemSelectedText: "[Department]",
      fields: {
        value: "DepartmentID",
        text: "DepartmentName",
      },
    });


    _this.notesGvm = new SlickGridViewModel({
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
        rowHeight: 27 * 2,
      },
      plugins: [
        new RowEvent({
          eventName: "onDblClick",
          fn: function(item) {
            notify.info("Note Details", item.Note, 5, null, true);
          },
        }),
      ],
      columns: [ //
        {
          id: "CreatedOn",
          name: "Date",
          field: "CreatedOn",
          width: 20,
          cssClass: "wrap-cell",
          formatter: SlickGridViewModel.formatters.datetime,
        }, {
          id: "CreatedBy",
          name: "User",
          field: "CreatedBy",
          width: 35,
        }, {
          //   id: "NoteCategory1Id",
          //   name: "Primary Reason",
          //   // field: "NoteCategory1Id",
          //   field: "Category1",
          //   width: 30,
          // }, {
          //   id: "NoteCategory2Id",
          //   name: "Secondary Reason",
          //   // field: "NoteCategory2Id",
          //   field: "Category2",
          //   width: 30,
          // }, {
          id: "reason",
          name: "Reason",
          // width: 30,
          formatter: function(row, cell, value, columnDef, dataCtx) {
            //@NOTE: for this to work we need a list of all category1 and category2.
            //       currently we only have filtered lists
            return dataCtx.Category1 + ":<br />" + dataCtx.Category2;
          },
        }, {
          id: "Note",
          name: "Note",
          field: "Note",
          width: 300,
          cssClass: "wrap-cell",
          title: "Note",
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
        if (!err) {
          _this.ownerVm.close();
        }
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
        link: "departmentid",
      }, null, utils.safeCallback(null, function(err, resp) {
        // make sure selectedValue hasn"t changed
        if (_this.departmentsCvm.selectedValue() === selectedValue) {
          _this.data.NoteCategory1IdCvm.setList(resp.Value.sort(byCategory));
        }
      }, function(err) {
        notify.error(err);
      }));
    });
    _this.data.NoteCategory1IdCvm.selectedValue.subscribe(function(selectedValue) {
      _this.data.NoteCategory2IdCvm.setList([]);
      if (!selectedValue) {
        return;
      }
      dataservice.maincore.notecategory2.read({
        id: selectedValue,
        link: "category1id",
      }, null, utils.safeCallback(null, function(err, resp) {
        // make sure selectedValue hasn"t changed
        if (_this.data.NoteCategory1IdCvm.selectedValue() === selectedValue) {
          _this.data.NoteCategory2IdCvm.setList(resp.Value.sort(byCategory));
          if (!_this.data.NoteCategory2IdCvm.selectedValue.peek()) {
            _this.data.NoteCategory2IdCvm.selectFirst();
          }
        }
      }, function(err) {
        notify.error(err);
      }));
    });
  }
  utils.inherits(NotesViewModel, BaseViewModel);
  NotesViewModel.prototype.viewTmpl = "tmpl-acct-default-notes";

  NotesViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;
    load_departments(_this.departmentsCvm, join.add());
    load_notes(_this.id, _this.notesGvm, join.add());
    createNote(_this.data, join.add());
  };
  NotesViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (!_this.note._saved) {
      msg = "An an account note has not been entered.";
    } else if (!_this.data.isClean() || !_this.note.isClean()) {
      msg = "Pending changes for the current note need to be saved.";
    }
    return msg;
  };

  function createNote(ukovData, cb) {
    var model = ukovData.getValue();
    // set default note categories
    model.NoteCategory1Id = 1; // Master Access
    model.NoteCategory2Id = 1; // General Open
    dataservice.maincore.notes.save({
      data: model,
    }, null, utils.safeCallback(cb, function(err, resp) {
      ukovData.setValue(resp.Value);
      ukovData.markClean(resp.Value);
    }));
  }

  function appendNote(note, ukovData, cb) {
    if (!ukovData.isValid()) {
      notify.warn(ukovData.errMsg(), null, 7);
      return cb(ukovData.errMsg());
    }
    if (!note.isValid()) {
      notify.warn(note.errMsg(), null, 7);
      return cb(note.errMsg());
    }

    var model = ukovData.getValue();
    model.Note = (model.Note) ? model.Note + "\n" : "";
    model.Note += note();

    note("");

    dataservice.maincore.notes.save({
      data: model,
    }, null, utils.safeCallback(cb, function(err, resp) {
      note._saved = true; // mark the note as being saved (used in `closeMsg`)
      ukovData.setValue(resp.Value);
      ukovData.markClean(resp.Value);
    }));
  }

  function load_departments(cvm, cb) {
    dataservice.maincore.departments.read({}, null, utils.safeCallback(cb, function(err, resp) {
      cvm.setList(resp.Value);
      // try to select Data Entry
      cvm.selectedValue("DENTRY");
      // select the first if nothing is selected
      if (!cvm.selectedValue()) {
        cvm.selectItem(cvm.list()[0]);
      }
    }));
  }

  function load_notes(id, gvm, cb) {
    gvm.list([]);
    dataservice.maincore.notes.read({
      id: id,
      link: "cmfid",
    }, null, utils.safeCallback(cb, function(err, resp) {
      gvm.list(resp.Value || []);
    }));
  }

  function byCategory(a, b) {
    if (a.Category > b.Category) {
      return 1;
    }
    if (a.Category < b.Category) {
      return -1;
    }
    return 0;
  }


  return NotesViewModel;
});
