define('src/vm.combo', [
  'src/util/utils',
  'src/core/vm.base',
  'ko'
], function(
  utils,
  BaseViewModel,
  ko
) {
  "use strict";

  var charRegx = /([^\s]{1})/g,
    regxAnyLetter = '.*';

  function ComboViewModel(options) {
    var _this = this;
    ComboViewModel.super_.call(_this, options);

    _this.activeIndex = -1;
    _this.noItemSelected = {
      text: '[Select One]',
    };
    _this.filterText = ko.observable('');
    _this.selectedItem = ko.observable(_this.noItemSelected);
    _this.list = ko.observableArray();
    _this.isOpen = ko.observable(false);
    _this.focusInput = ko.observable(false);
    _this.selectInput = ko.observable(false);

    _this.filterText.subscribe(function(filterText) {
      filterList(_this.list(), filterText);
      _this.deactivateCurrent();
      _this.activateNext(true);
    });

    //
    // events
    //
    _this.clickClose = function() {
      _this.isOpen(false);
    };
    _this.clickToggleOpen = function() {
      if (_this.isOpen()) {
        _this.clickClose();
      } else {
        // _this.filterText('');
        _this.isOpen(true);
        setTimeout(function() {
          _this.focusInput(true);
          _this.selectInput(true);
        }, 0);
      }
    };
    _this.inputKeydown = function(vm, evt) {
      var down;
      switch (evt.keyCode) {
        default: return true;
        case 27: // escape key
          _this.clickClose();
          return false;
        case 13: // enter key
          _this.selectItem(_this.list()[_this.activeIndex]);
          return false;
        case 38: // up arrow key
          down = false;
          break;
        case 40: // down arrow key
          down = true;
          break;
      }
      _this.activateNext(down);
    };
    _this.selectItem = function(item) {
      if (item) {
        _this.selectedItem(item);
        _this.clickClose();
      }
    };
  }
  utils.inherits(ComboViewModel, BaseViewModel);
  ComboViewModel.prototype.viewTmpl = 'tmpl-combo';

  ComboViewModel.prototype.setList = function(list) {
    var _this = this,
      wrapList = new Array(list.length);
    list.forEach(function(item, index) {
      if (!item.text) {
        throw new Error('no text field: ' + JSON.stringify(item));
      }
      wrapList[index] = {
        item: item,
        text: item.text,
        html: ko.observable(item.text),
        matches: ko.observable(false),
        active: ko.observable(false),
      };
    });
    _this.list(wrapList);
    filterList(_this.list(), _this.filterText());
    // select first visible item in the list
    _this.selectedItem(wrapList[findNextIndex(wrapList, wrapList.length, true)] || _this.noItemSelected);
    _this.deactivateCurrent();
  };

  ComboViewModel.prototype.deactivateCurrent = function() {
    var _this = this,
      activeItem = _this.list()[_this.activeIndex];
    if (activeItem) {
      activeItem.active(false);
    }
    _this.activeIndex = -1;
  };
  ComboViewModel.prototype.activateNext = function(down) {
    var _this = this,
      list = _this.list(),
      item;
    item = list[_this.activeIndex];
    if (item) {
      item.active(false);
    }
    _this.activeIndex = findNextIndex(list, _this.activeIndex, down);
    item = list[_this.activeIndex];
    if (item) {
      item.active(true);
    }
  };

  function findNextIndex(list, startIndex, down) {
    var index = startIndex,
      inc = (down) ? 1 : -1,
      count = 0,
      length = list.length;

    while (count < length) {
      count++;

      index += inc;
      if (index >= length) {
        // go to start
        index = 0;
      } else if (index < 0) {
        // go to end
        index = length - 1;
      }

      if (list[index].matches()) {
        return index;
      }
    }

    return -1;
  }

  function filterList(list, filterText) {
    var matches = getMatches(filterText),
      regx = new RegExp(regxAnyLetter + matches.join(regxAnyLetter) + regxAnyLetter, 'i'),
      letterRegxList = createLetterRegxList(matches);
    list.forEach(function(val) {
      if (regx.test(val.text)) {
        val.html(makeHtml(letterRegxList, val.text));
        val.matches(true);
      } else {
        val.html(val.text);
        val.matches(false);
      }
    });
  }

  function getMatches(filterText) {
    var matches = [];
    filterText.replace(charRegx, function(item, match) {
      matches.push(match);
    });
    return matches;
  }

  function createLetterRegxList(matches) {
    var results = new Array(matches.length);
    matches.forEach(function(m, index) {
      results[index] = new RegExp(m, 'i');
    });
    return results;
  }

  function makeHtml(letterRegxList, text) {
    var results = [],
      index = 0,
      length = text.length,
      letter;
    letterRegxList.forEach(function(regx) {
      while (index < length) {
        letter = text[index++];
        if (regx.test(letter)) {
          results.push('<b>' + letter + '</b>');
          return; // break while loop
        } else {
          results.push(letter);
        }
      }
    });
    if (index < length) {
      results.push(text.substr(index));
    }
    return results.join('');
  }

  return ComboViewModel;
});
