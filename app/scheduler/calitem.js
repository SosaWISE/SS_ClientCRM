define("src/scheduler/calitem", [
  "ko",
  "src/core/strings",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ko,
  strings,
  utils
) {
  "use strict";

  function CalItem(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }
    utils.ensureProps(_this, [
      "board",
      "data",
    ]);
    utils.ensureProps(_this.data, [
      "StartOn",
      "EndOn",
      "ColumnID",
    ]);
    propCheck("StartOn", _this.data.StartOn);
    propCheck("EndOn", _this.data.EndOn);

    function getStartOn() {
      var startOn = _this.data.StartOn.getValue();
      if (!utils.isDate(startOn)) {
        startOn = _this.board.selectedDate.peek();
      }
      return startOn;
    }

    function getEndOn() {
      var startOn = getStartOn();
      var endOn = _this.data.EndOn.getValue();
      if (!utils.isDate(endOn)) {
        endOn = new Date(startOn.valueOf());
        endOn.setMinutes(endOn.getMinutes() + 15);
      }
      return new Date(startOn.getFullYear(), startOn.getMonth(), startOn.getDate(),
        endOn.getHours(), endOn.getMinutes()); //, endOn.getSeconds(), endOn.getMilliseconds());
    }

    _this.selected = ko.observable(false);
    _this.scrollTo = ko.observable(false);
    _this.dateText = ko.computed({
      deferEvaluation: true,
      read: function() {
        _this.data.StartOn(); // subscribe
        return strings.format("{0:d}", getStartOn());
      }
    });
    _this.position = ko.computed({
      deferEvaluation: true,
      read: function() {
        _this.data.StartOn(); // subscribe
        var colID = _this.data.ColumnID(); // subscribe
        var row = _this.board.timeToRow(getStartOn());
        return {
          top: row * _this.board.rowHeight,
          left: _this.board.getColLeftPercent(colID),
          // ColumnID is set as part of `position` because `left` is a
          // percentage of the container and not a pixel value, which
          // makes it impossible to calculate the `ColumnID` from
          // `left` like we do with `StartOn` and `top`
          ColumnID: colID,
        };
      },
      write: function(position) {
        // set times
        var startOn = getStartOn();
        var endOn = getEndOn();
        // find delta between StartOn and EndOn
        var delta = endOn.valueOf() - startOn.valueOf();
        // convert from screen position to time
        startOn = _this.board.topToTime(startOn, position.top);
        _this.data.StartOn(startOn);
        endOn = new Date(startOn.valueOf() + delta);
        _this.data.EndOn(endOn);

        // set column
        _this.data.ColumnID(position.ColumnID);
      },
    });
    _this.height = ko.computed({
      deferEvaluation: true,
      read: function() {
        _this.data.StartOn(); // subscribe
        _this.data.EndOn(); // subscribe
        var startOn = getStartOn();
        var endOn = getEndOn();
        return _this.board.timeToHeight(startOn, endOn);
      },
      write: function(height) {
        var startOn = getStartOn();
        var endOn = getEndOn();
        endOn = _this.board.heightToTime(startOn, endOn, height);
        _this.data.EndOn(endOn);
      },
    });

    _this.timespan = ko.computed(function() {
      _this.data.StartOn(); // subscribe
      _this.data.EndOn(); // subscribe
      return calcTimespan(getStartOn(), getEndOn());
    });

    _this.getCustomerName = function(data) {
      return strings.joinTrimmed(' ', data.Salutation, data.FirstName, data.MiddleName, data.LastName, data.Suffix);
    };

    //
    //events
    //
    _this.clickCancel = utils.noop; //@NOTE: to be set by owner
    // _this.cmdSave = ko.command(function(cb) {
    //   saveAppt(_this, cb);
    // });
  }

  function propCheck(name, prop) {
    if (!ko.isObservable(prop) ||
      !utils.isFunc(prop.getValue) ||
      !prop.doc ||
      !prop.doc.converter
    ) {
      throw new Error(name + " needs to be a ukov prop with a converter");
    }
  }

  function create(board, data) {
    var id = data.ID || -1;
    var startOn = data.StartOn;
    var endOn = data.EndOn;
    if (ko.isObservable(startOn) && ko.isObservable(endOn)) {
      return new CalItem({
        board: board,
        ID: id,
        viewTmpl: "tmpl-scheduler-calitem",
        data: data,
        editable: true,
      });
    }

    return {
      board: board,
      ID: id,
      position: {
        top: board.timeToRow(startOn) * board.rowHeight,
        left: board.getColLeftPercent(data.ColumnID),
        // left: "0px",
      },
      height: board.timeToHeight(startOn, endOn),
      viewTmpl: (id > 0) ? "tmpl-scheduler-calitem" : "tmpl-scheduler-calitem_gone",
      //
      data: {
        model: data,
      },
      selected: false,
      editable: false,
      timespan: calcTimespan(startOn, endOn),
    };
  }
  CalItem.create = create;

  function calcTimespan(startOn, endOn) {
    return strings.format("{0:t} - {1:t}", startOn, endOn);
  }

  return CalItem;
});
