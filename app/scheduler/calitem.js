define("src/scheduler/calitem", [
  "src/ukov",
  "ko",
  "src/core/strings",
  "src/core/utils",
  "src/core/base.vm",
], function(
  ukov,
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
    assertUkovProp(_this.data, "StartOn");
    assertUkovProp(_this.data, "EndOn");
    assertUkovProp(_this.data, "ColumnID");

    _this.selected = ko.observable(false);
    _this.scrollTo = ko.observable(false);
    _this.position = ko.computed({
      deferEvaluation: true,
      read: function() {
        _this.data.StartOn(); // subscribe
        var colID = _this.data.ColumnID(); // subscribe
        var row = _this.board.timeToRow(getStartOn(_this));
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
        var startOn = getStartOn(_this);
        var endOn = getEndOn(_this);
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
        var startOn = getStartOn(_this);
        var endOn = getEndOn(_this);
        return _this.board.timeToHeight(startOn, endOn);
      },
      write: function(height) {
        var startOn = getStartOn(_this);
        var endOn = getEndOn(_this);
        endOn = _this.board.heightToTime(startOn, endOn, height);
        _this.data.EndOn(endOn);
      },
    });

    _this.timespan = ko.computed(function() {
      _this.data.StartOn(); // subscribe
      _this.data.EndOn(); // subscribe
      return calcTimespan(getStartOn(_this), getEndOn(_this));
    });

    _this.getCustomerName = function(data) {
      return strings.joinTrimmed(' ', data.Salutation, data.FirstName, data.MiddleName, data.LastName, data.Suffix);
    };
  }
  CalItem.prototype.overlaps = function(b, ignoreSelf) {
    var a = this;
    if (ignoreSelf && a.data.ID.peek() === b.data.ID.peek()) {
      return false;
    }
    return a.data.ColumnID.peek() === b.data.ColumnID.peek() &&
      getStartOnTime(a) < getEndOnTime(b) &&
      getEndOnTime(a) > getStartOnTime(b);
  };

  function toTime(dt) {
    return (dt.getHours() * 60) + dt.getMinutes();
  }

  function getStartOnTime(_this) {
    return toTime(getStartOn(_this));
  }

  function getEndOnTime(_this) {
    return toTime(getEndOn(_this));
  }


  function getStartOn(_this) {
    var startOn = _this.data.StartOn.getValue();
    if (!utils.isDate(startOn)) {
      startOn = new Date(_this.board.selectedDate.peek().valueOf());
      startOn.setHours(_this.board.startHour, 0, 0, 0);
    }
    return startOn;
  }

  function getEndOn(_this) {
    var endOn = _this.data.EndOn.getValue();
    var hours, minutes;
    if (utils.isDate(endOn)) {
      hours = endOn.getHours();
      minutes = endOn.getMinutes();
    } else {
      hours = _this.board.endHour;
      if (hours === 24) {
        hours = 23;
        minutes = 55;
      } else {
        minutes = 0;
      }
    }
    var startOn = getStartOn(_this);
    return new Date(startOn.getFullYear(), startOn.getMonth(), startOn.getDate(),
      hours, minutes); //, endOn.getSeconds(), endOn.getMilliseconds());
  }

  function assertUkovProp(obj, name) {
    if (!isUkovProp(obj, name)) {
      throw new Error(name + " needs to be a ukov prop with a converter");
    }
  }

  function isUkovProp(obj, name) {
    var prop = obj[name];
    return ko.isObservable(prop) && utils.isFunc(prop.getValue) && prop.doc && prop.doc.converter;
  }

  function isUkovModel(obj) {
    return obj && obj.model && obj.doc && obj.doc._model;
  }

  function create(board, data) {
    var editable = isUkovModel(data);
    if (!editable) {
      data.ID = data.ID || -1;
      data = ukov.wrap(data, readOnlySchema);
    }
    return new CalItem({
      editable: editable,
      board: board,
      ID: data.ID,
      data: data,
      viewTmpl: (data.ID.peek() >= 0) ? "tmpl-scheduler-calitem" : "tmpl-scheduler-calitem_gone",
    });
  }
  CalItem.create = create;

  function calcTimespan(startOn, endOn) {
    return strings.format("{0:t} - {1:t}", startOn, endOn);
  }

  // var timeConverter = ukov.converters.time(
  //   function getStartDate(model) {
  //     return model.StartOn;
  //   },
  //   function removeSeconds(dt) {
  //     dt.setSeconds(0, 0);
  //     return dt;
  //   }
  // );
  var readOnlyConverter = function() {
    throw new Error("Read only");
  };
  var readOnlySchema = {
    _model: true,
    ID: {},
    StartOn: {
      converter: readOnlyConverter,
    },
    EndOn: {
      converter: readOnlyConverter,
    },
    ColumnID: {
      converter: readOnlyConverter,
    },
  };

  return CalItem;
});
