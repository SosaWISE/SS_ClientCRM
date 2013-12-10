define('src/vm.combo', [
  'ko',
  'src/core/utils',
  'src/core/vm.base',
], function(
  ko,
  utils,
  BaseViewModel
) {
  "use strict";

  var charRegx = /([^\s]{1})/g,
    regxAnyLetter = '.*';

  //@TODO:
  // on focus open (tab pressed)
  // on blur close (click elsewhere)
  // on escap key press close

  function ComboViewModel(options) {
    var _this = this;
    ComboViewModel.super_.call(_this, options);

    _this.activeIndex = -1;
    _this.filterText = ko.observable('');
    _this.selectedItem = ko.observable(ComboViewModel.noItemSelected);
    if (!_this.selectedValue) {
      _this.selectedValue = ko.observable();
    }

    _this.list = ko.observableArray();
    _this.actions = ko.observableArray();
    _this.isOpen = ko.observable(false);
    _this.focusInput = ko.observable(false);
    _this.selectInput = ko.observable(false);

    _this.filterText.subscribe(function(filterText) {
      filterList(_this.list(), filterText);
      _this.deactivateCurrent();
      _this.activateNext(true);
    });

    // whenever selectedValue changes
    //    verify the value is in the list of items
    //    update selectedItem
    _this.selectedValue.subscribe(function(selectedValue) {
      if (selectedValue != null) {
        var item;
        _this.list().some(function(wrappedItem) {
          if (wrappedItem.item.value === selectedValue) {
            item = wrappedItem.item;
            return true;
          }
        });
        if (item) {
          _this.selectedItem(item);
        } else {
          console.log('selectedValue not in list:', selectedValue);
          _this.selectedValue(null);
        }
      } else {
        _this.selectedItem(ComboViewModel.noItemSelected);
      }
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
        item = item.item; // unwrap item
        _this.selectedValue(item.value);

        _this.clickClose();

        if (item !== _this.list()[_this.activeIndex]) {
          _this.deactivateCurrent();
          _this.activeIndex = _this.list().indexOf(item) - 1;
          _this.activateNext(true);
        }
      }
    };

    _this.clickAction = function(action) {
      _this.clickClose();
      action.onClick(_this.filterText());
    };

    if (options && options.list) {
      _this.setList(options.list);
    } else {
      // start with nothing selected
      _this.selectedValue(null);
    }
  }
  utils.inherits(ComboViewModel, BaseViewModel);
  ComboViewModel.prototype.viewTmpl = 'tmpl-combo';
  ComboViewModel.noItemSelected = {
    value: null,
    text: '[Select One]',
  };

  ComboViewModel.prototype.setList = function(list) {
    var _this = this,
      wrapList = new Array(list.length);
    list.forEach(function(item, index) {
      wrapList[index] = wrapItem(item);
    });
    _this.list(wrapList);
    filterList(_this.list(), _this.filterText());

    // reset selected value
    _this.selectedValue(null);

    _this.deactivateCurrent();
  };
  ComboViewModel.prototype.addItem = function(item) {
    item = wrapItem(item);
    this.list.push(item);
    return item;
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

  function wrapItem(item) {
    if (!('value' in item)) {
      throw new Error('no value field: ' + JSON.stringify(item));
    }
    if (!('text' in item)) {
      throw new Error('no text field: ' + JSON.stringify(item));
    }
    return {
      item: item,
      text: item.text,
      html: ko.observable(item.text),
      matches: ko.observable(false),
      active: ko.observable(false),
    };
  }

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
