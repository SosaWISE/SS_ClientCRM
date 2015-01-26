define("src/scheduler/calcol", [
  "ko",
  "src/core/strings",
  "src/core/utils",
], function(
  ko,
  strings,
  utils
) {
  "use strict";

  function CalCol(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }
    utils.assertProps(_this, [
      "board",
      "index",
      "ID",
      "Title",
    ]);

    _this.index = ko.observable(_this.index);
    _this.position = ko.computed({
      deferEvaluation: true,
      read: function() {
        return {
          top: "0px",
          left: _this.board.getColLeftPercent(_this.ID),
        };
      },
    });
  }

  function create(board, index, id, title) {
    return new CalCol({
      board: board,
      index: index,
      ID: id,
      Title: title,
    });
  }
  CalCol.create = create;

  return CalCol;
});
