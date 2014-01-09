define('src/core/vm.combo', [
  'ko',
  'src/core/strings',
  'src/core/utils',
  'src/core/vm.base',
], function(
  ko,
  strings,
  utils,
  BaseViewModel
) {
  "use strict";

  var charRegx = /([^\s]{1})/g,
    regxAnyLetter = '.*',
    defaultFields = {
      value: 'value',
      text: 'text',
    };

  //@TODO:
  // on focus open (tab pressed)
  // on blur close (click elsewhere)

  function ComboViewModel(options) {
    var _this = this;
    ComboViewModel.super_.call(_this, options);

    // ensure fields property exists
    _this.fields = _this.fields || {};
    _this.fields.value = _this.fields.value || 'value';
    _this.fields.text = _this.fields.text || 'text';

    _this.activeIndex = -1;
    _this.filterText = ko.observable('');
    _this.selected = ko.observable(ComboViewModel.noItemSelected);
    if (!_this.selectedValue) {
      _this.selectedValue = ko.observable();
    }

    _this.list = ko.observableArray();
    _this.actions = ko.observableArray();
    _this.isOpen = ko.observable(false);
    _this.focusInput = ko.observable(false);
    _this.selectInput = ko.observable(false);
    _this.deselectInput = ko.observable(false);

    _this.filterText.subscribe(function(filterText) {
      filterList(_this.list(), filterText);
      _this.deactivateCurrent();
      _this.activateNext(true);
    });

    // whenever selectedValue changes
    //    verify the value is in the list of items
    //    update selected
    _this.selectedValue.subscribe(function(selectedValue) {
      if (selectedValue != null) {
        var wrappedItem;
        _this.list().some(function(listItem) {
          if (listItem.value === selectedValue) {
            wrappedItem = listItem;
            return true;
          }
        });
        if (wrappedItem) {
          _this.selected(wrappedItem);

          if (wrappedItem.item !== _this.list()[_this.activeIndex]) {
            _this.deactivateCurrent();
            if (wrappedItem.value != null) {
              _this.activeIndex = _this.list().indexOf(wrappedItem) - 1;
              _this.activateNext(true);
            }
          }
        } else {
          console.log('selectedValue not in list:', selectedValue);
          //@NOTE: this will call this function again
          // and set `selected` to `noItemSelected`
          _this.selectedValue(null);
        }
      } else {
        _this.selected(ComboViewModel.noItemSelected);
        _this.deactivateCurrent();
      }
    });

    //
    // events
    //
    _this.onClickingItem = function() {
      _this.clickingItem = true;
    };
    _this.offClickingItem = function() {
      _this.clickingItem = false;
    };
    _this.clickTestClose = function() {
      if (_this.clickingItem) {
        return;
      }
      _this.clickClose();
    };
    _this.clickClose = function() {
      _this.clickingItem = false;
      _this.isOpen(false);
      _this.deselectInput(true);
    };
    _this.clickOpen = function() {
      if (!_this.isOpen()) {
        // _this.filterText('');
        _this.isOpen(true);
        setTimeout(function() {
          _this.focusInput(true);
          _this.selectInput(true);
        }, 0);
      }
    };
    _this.inputKeydown = function(vm, evt) {
      var keyCode = evt.keyCode;
      console.log(keyCode);
      if (!_this.isOpen()) {
        // ignore keys
        switch (keyCode) {
          case 16: // shift
          case 17: // ctrl
          case 18: // alt
          case 27: // escape
          case 9: // tab
            return true; // do default action
        }

        _this.isOpen(true);
        _this.focusInput(true);
        _this.selectInput(true);

        // only open and don't do other actions below
        switch (keyCode) {
          case 13: // enter
          case 38: // up arrow
          case 40: // down arrow
            return false; // prevent default action
        }
      }

      switch (keyCode) {
        default: return true;
        case 27: // escape
          _this.clickClose();
          return false;
        case 13: // enter
        case 9: // tab
          _this.selectItem(_this.list()[_this.activeIndex]);
          return keyCode === 9; // for tab key do default action
        case 38: // up arrow
          _this.activateNext(false);
          return false;
        case 40: // down arrow
          _this.activateNext(true);
          return false;
      }
      return true; // do default action
    };
    _this.selectItem = function(wrappedItem) {
      if (wrappedItem) {
        _this.selectedValue(wrappedItem.value);
      } else {
        _this.selectedValue(null);
      }
      _this.clickClose();
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

  ComboViewModel.prototype.selectFirst = function() {
    var _this = this;
    _this.selectItem(_this.list()[0]);
  };
  ComboViewModel.prototype.setList = function(list) {
    list = list || [];
    var _this = this,
      wrapList = new Array(list.length);

    list.forEach(function(item, index) {
      wrapList[index] = wrapItem(item, _this.fields);
    });
    if (_this.nullable) {
      wrapList.unshift(ComboViewModel.noneItem);
    }
    _this.list(wrapList);
    filterList(_this.list(), _this.filterText());

    // reset selected value
    _this.selectedValue(null);
    _this.deactivateCurrent();
  };
  ComboViewModel.prototype.addItem = function(item) {
    var _this = this;
    item = wrapItem(item, _this.fields);
    _this.list.push(item);
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

  function wrapItem(item, fields) {
    if (!(fields.value in item)) {
      throw new Error('no ' + fields.value + ' field: ' + JSON.stringify(item));
    }
    if (!(fields.text in item)) {
      throw new Error('no ' + fields.text + ' field: ' + JSON.stringify(item));
    }
    return {
      item: item,
      text: item[fields.text],
      value: item[fields.value],
      html: ko.observable(item[fields.text]),
      matches: ko.observable(false),
      active: ko.observable(false),
    };
  }

  ComboViewModel.noItemSelected = wrapItem({
    value: null,
    text: '[Select One]',
  }, defaultFields);
  ComboViewModel.noneItem = wrapItem({
    value: null,
    text: '[None]',
  }, defaultFields);

  // function indexOfItem(list, item) {
  //   var index = -1;
  //   list.some(function(wrappedItem, i) {
  //     if (wrappedItem.item === item) {
  //       index = i;
  //       return true;
  //     }
  //   });
  //   return index;
  // }
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
      regx, letterRegxList;
    regx = createRegx(matches);
    letterRegxList = createLetterRegxList(matches);
    list.forEach(function(wrappedItem) {
      if (regx.test(wrappedItem.text)) {
        wrappedItem.html(makeHtml(letterRegxList, wrappedItem.text));
        wrappedItem.matches(true);
      } else {
        wrappedItem.html(wrappedItem.text);
        wrappedItem.matches(false);
      }
    });
  }

  function getMatches(filterText) {
    var matches = [];
    filterText.replace(charRegx, function(item, match) {
      match = strings.escapeRegExp(match);
      matches.push(match);
    });
    return matches;
  }

  function createRegx(matches) {
    return new RegExp(regxAnyLetter + matches.join(regxAnyLetter) + regxAnyLetter, 'i');
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
