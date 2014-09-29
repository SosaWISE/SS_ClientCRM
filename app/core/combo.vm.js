define('src/core/combo.vm', [
  'ko',
  'src/core/jsonhelpers',
  'src/core/strings',
  'src/core/utils',
  'src/core/base.vm',
], function(
  ko,
  jsonhelpers,
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
    },
    defaultNoItemSelected, defaultNoneItem;

  function ComboViewModel(options) {
    var _this = this;
    ComboViewModel.super_.call(_this, options);

    // ensure fields property exists
    _this.fields = _this.fields || {};
    _this.fields.value = _this.fields.value || 'value';
    _this.fields.text = _this.fields.text || 'text';

    if (_this.noItemSelectedText) {
      _this.noItemSelected = wrapItem({
        value: null,
        text: _this.noItemSelectedText,
      }, defaultFields);
    } else {
      _this.noItemSelected = defaultNoItemSelected;
    }
    if (_this.noneItemText) {
      _this.noneItem = wrapItem({
        value: null,
        text: _this.noneItemText,
      }, defaultFields);
    } else {
      _this.noneItem = defaultNoneItem;
    }

    _this.activeIndex = -1;
    _this.filterText = ko.observable('');
    _this.selected = ko.observable(_this.noItemSelected);
    if (!_this.selectedValue || !ko.isObservable(_this.selectedValue)) {
      _this.selectedValue = ko.observable();
    }
    // start history with current item
    _this.selectionHistory = [_this.selectedValue.peek()];

    _this.list = ko.observableArray();
    _this.actions = ko.observableArray(_this.actions);
    _this.isOpen = ko.observable(false);
    _this.focusInput = ko.observable(false);
    _this.selectInput = ko.observable(false);
    _this.deselectInput = ko.observable(false);

    _this.filterText.subscribe(function(filterText) {
      filterList(_this.list.peek(), filterText, _this.matchStart);
      _this.deactivateCurrent();
      _this.activateNext(true);
    });

    // whenever selectedValue changes
    //    verify the value is in the list of items
    //    update selected
    _this.selectedValue.subscribe(function(selectedValue) {
      // always try to find in list, even if selectedValue is null/undefined
      var wrappedItem = findWrappedItemByValue(_this.list.peek(), selectedValue);
      if (wrappedItem) {
        _this.selected(wrappedItem);

        if (wrappedItem.item !== _this.list.peek()[_this.activeIndex]) {
          _this.deactivateCurrent();
          if (wrappedItem.value != null) {
            _this.activeIndex = _this.list.peek().indexOf(wrappedItem) - 1;
            _this.activateNext(true);
          }
        }

        ko.utils.arrayRemoveItem(_this.selectionHistory, selectedValue);
        _this.selectionHistory.push(selectedValue);
        while (_this.selectionHistory.length > 10) {
          _this.selectionHistory.shift(); // remove first item
        }
      } else if (selectedValue !== null) { // in this case, undefined is not null
        // console.log('selectedValue not in list:', selectedValue);
        //@NOTE: this will call this function again
        // and set `selected` to `noItemSelected` or it will select the first item (if not nullable)
        _this.selectedValue(null);
        // } else if (!_this.nullable && _this.list.peek().length) {
        //   _this.selectFirst();
      } else {
        _this.selected(_this.noItemSelected);
        _this.deactivateCurrent();
      }
    });
    _this.setSelectedValue = function(value) {
      setAndNotify(_this.selectedValue, value);
    };

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
    _this.clickClose = function(preventFocus) {
      _this.clickingItem = false;
      if (_this.isOpen()) {
        _this.isOpen(false);
        setTimeout(function() {
          if (!preventFocus) {
            _this.focusInput(true);
            _this.selectInput(true);
          }
          _this.deselectInput(true);
        }, 0);
      }
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
    // must use keydown since keypress doesn't fire for arrow and enter keys and probably other as well
    _this.inputKeydown = function(vm, evt) {
      var keyCode = evt.keyCode;
      switch (keyCode) {
        // composition keycode for chrome, it is sent when user either hit a key or hit a selection. (https://code.google.com/p/chromium/issues/detail?id=118639#c7)
        // we don't want anything to do with it since it messes up what the actual key does
        //  e.g.: when closed, pressing the enter key will open then immediately close the combo box
        case 229:
          return true; // do default action
      }
      // console.log(keyCode);

      if (!_this.isOpen()) {
        // ignore keys
        switch (keyCode) {
          case 16: // shift
          case 17: // ctrl
          case 18: // alt
          case 27: // escape
          case 9: // tab
          case 91: // windows
            return true; // do default action
        }

        _this.isOpen(true);
        _this.focusInput(true);
        _this.selectInput(true);

        // only open and don't do other actions below
        switch (keyCode) {
          case 13: // enter
            // case 38: // up arrow
            // case 40: // down arrow
            return false; // prevent default action
        }
      }

      switch (keyCode) {
        default: return true;
        case 27: // escape
          _this.resetActive();
          _this.clickClose();
          evt.stopPropagation(); // cancel bubble
          return false; // prevent default action
        case 13: // enter
        case 9: // tab
          _this.selectItem(_this.list.peek()[_this.activeIndex]);
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
        _this.setSelectedValue(wrappedItem.value);
      } else {
        _this.setSelectedValue(null);
      }
      _this.clickClose(true);
    };

    _this.clickAction = function(action) {
      _this.clickClose();
      action.onClick(_this.filterText());
    };

    // ensure setList always has the correct scope
    _this.setList = _this.setList.bind(_this);

    // init
    if (options && options.list) {
      _this.setList(options.list);
    } else {
      // start with nothing selected
      _this.setSelectedValue(null);
    }
  }
  utils.inherits(ComboViewModel, BaseViewModel);
  ComboViewModel.prototype.viewTmpl = 'tmpl-combo';
  ComboViewModel.prototype.nullable = false;

  ComboViewModel.prototype.selectFirst = function() {
    var _this = this;
    _this.selectItem(_this.list.peek()[0]);
  };
  ComboViewModel.prototype.selectLast = function() {
    var _this = this,
      list = _this.list.peek();
    _this.selectItem(list[list.length - 1]);
  };
  ComboViewModel.prototype.selectedItem = function() {
    var _this = this,
      selected = _this.selected();
    if (selected && selected !== _this.noItemSelected) {
      return selected.item;
    }
    return null;
  };
  ComboViewModel.prototype.selectedText = function() {
    var _this = this,
      selectedItem = _this.selectedItem();
    return (selectedItem) ? selectedItem.text : '';
  };
  ComboViewModel.prototype.setList = function(list) {
    list = list || [];
    var _this = this,
      wrapList = new Array(list.length),
      i;

    list.forEach(function(item, index) {
      wrapList[index] = wrapItem(item, _this.fields);
    });
    if (_this.nullable) {
      wrapList.unshift(_this.noneItem);
    }
    _this.list(wrapList);
    filterList(_this.list.peek(), _this.filterText(), _this.matchStart);

    //
    // set selected value to item in the new list
    //
    // try to find the most recently used value in the list (loop in reverse order)
    i = _this.selectionHistory.length;
    while (i--) {
      // console.log('try selection:', _this.selectionHistory[i]);
      if (findWrappedItemByValue(wrapList, _this.selectionHistory[i])) {
        _this.setSelectedValue(_this.selectionHistory[i]);
        return;
      }
    }
    // try to select the clean value
    if (ko.isObservable(_this.selectedValue.cleanVal)) {
      _this.setSelectedValue(_this.selectedValue.cleanVal.peek());
    } else {
      // deselect value (set to undefined when value is null)
      _this.setSelectedValue(_this.selectedValue.peek() === null ? undefined : null);
    }
  };
  ComboViewModel.prototype.addItem = function(item) {
    var _this = this;
    item = wrapItem(item, _this.fields);
    _this.list.push(item);
    return item;
  };

  ComboViewModel.prototype.deactivateCurrent = function() {
    var _this = this,
      activeItem = _this.list.peek()[_this.activeIndex];
    if (activeItem) {
      activeItem.active(false);
    }
    _this.activeIndex = -1;
  };
  ComboViewModel.prototype.activateNext = function(down) {
    var _this = this,
      list = _this.list.peek(),
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
  ComboViewModel.prototype.resetActive = function() {
    var _this = this,
      selected = _this.selected();
    _this.deactivateCurrent();
    if (selected) {
      selected.active(true);
      _this.activeIndex = _this.list.peek().indexOf(selected) - 1;
    }
    _this.activateNext(true);
  };
  ComboViewModel.prototype.hasValue = function(value) {
    var _this = this,
      list = _this.list.peek();
    return !!findWrappedItemByValue(list, value);
  };

  function wrapItem(item, fields) {
    if (!(fields.value in item)) {
      throw new Error('no ' + fields.value + ' field: ' + jsonhelpers.stringify(item));
    }
    var text, value;
    if (utils.isFunc(fields.text)) {
      // text field can be a format function
      text = fields.text(item);
    } else if (!(fields.text in item)) {
      throw new Error('no ' + fields.text + ' field: ' + jsonhelpers.stringify(item));
    } else {
      text = ko.unwrap(item[fields.text]);
    }
    value = ko.unwrap(item[fields.value]);
    return {
      item: item,
      text: text,
      value: value,
      html: ko.observable(text),
      matches: ko.observable(false),
      active: ko.observable(false),
    };
  }

  function findWrappedItemByValue(list, value) {
    var wrappedItem;
    list.some(function(listItem) {
      if (listItem.value === value) {
        wrappedItem = listItem;
        return true;
      }
    });
    return wrappedItem;
  }

  defaultNoItemSelected = wrapItem({
    value: null,
    text: '[Select One]',
  }, defaultFields);
  defaultNoneItem = wrapItem({
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

  function filterList(list, filterText, matchStart) {
    var matches = getMatches(filterText),
      regx, letterRegxList;
    regx = createRegx(matches, matchStart);
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

  function createRegx(matches, matchStart) {
    if (matchStart) {
      return new RegExp('^' + matches.join('') + regxAnyLetter, 'i');
    } else {
      return new RegExp(regxAnyLetter + matches.join(regxAnyLetter) + regxAnyLetter, 'i');
    }
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


  // copied from ukov-prop
  function setAndNotify(_this, value) {
    //
    // force notification so value formatters can do their thang
    // - essentially the same code as when setting an observable,
    //   but we only want to notify when the values are equal
    //   since the built in code will notify when the values are not equal
    //
    if (!_this.equalityComparer || !_this.equalityComparer(_this.peek(), value)) {
      // set value - knockout will notify subscribers
      _this(value);
    } else {
      _this.valueWillMutate();
      // set value - knockout will NOT notify subscribers
      _this(value);
      _this.valueHasMutated();
    }
  }


  // cvm binding
  function makeCvmValueAccessor(valueAccessor) {
    return function() {
      var cvm = ko.unwrap(valueAccessor());
      if (!(cvm instanceof ComboViewModel)) {
        throw new Error('expected bound value to be a ComboViewModel');
      }
      return {
        data: cvm,
        name: cvm.viewTmpl,
        templateEngine: ko.nativeTemplateEngine.instance,
      };
    };
  }
  ko.bindingHandlers.cvm = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      return ko.bindingHandlers.template.init(element, makeCvmValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      return ko.bindingHandlers.template.update(element, makeCvmValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    },
  };

  return ComboViewModel;
});
