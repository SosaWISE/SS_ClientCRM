define('src/mocker', [
], function() {
  'use strict';

  var mocker = {},
    tokenRegx = /@([A-Z_0-9]+(:?\([^\(\)]*\))?)/g,
    loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    incMap = {};

  mocker.fn = {
    BOOL: function() {
      return mocker.random() >= 0.5;
    },
    NUMBER: function(cache, min, max) {
      return randomFromRange(min, max, 0, 10);
    },
    INC: function(cache, key) {
      var val = incMap[key];
      if (val) {
        val++;
      } else {
        val = 1000; // default start value
      }
      incMap[key] = val;
      return val;
    },
    IMG: function(cache, width, height, category) {
      return 'http://lorempixel.com/' + width + '/' + height + '/' + (category || '');
    },
    TEXT: function(cache, min, max) {
      var results = [],
        num = randomFromRange(min, max, 10, 50),
        length = 0,
        tmpStr;
      while (length < num) {
        if ((length + loremIpsum.length) < num) {
          tmpStr = loremIpsum;
        } else {
          tmpStr = loremIpsum.substr(0, num - length);
        }
        results.push(tmpStr);
        length += tmpStr.length + 2; // includes join string length
      }
      return results.join('. ');
    },
    PHONE: function(cache) {
      return fromTemplate('(@NUMBER(200,999)) @NUMBER(100,999)-@NUMBER(1000,9999)', cache);
    },
    EMAIL: function(cache) {
      return fromTemplate('@NAME.@LAST_NAME@@LAST_NAME(cb).com', cache).toLowerCase();
    },
    FULLNAME: function(cache) {
      return fromTemplate('@NAME @LAST_NAME', cache);
    },
    CHAR_UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    CHAR_LOWER: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    MALE_NAME: ['James', 'John', 'Robert', 'Michael', 'William', 'David',
        'Richard', 'Charles', 'Joseph', 'Thomas', 'Christopher', 'Daniel',
        'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven', 'Edward',
        'Brian', 'Ronald', 'Anthony', 'Kevin', 'Jason', 'Matthew', 'Gary',
        'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank', 'Scott', 'Eric'],
    FEMALE_NAME: ['Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth',
        'Jennifer', 'Maria', 'Susan', 'Margaret', 'Dorothy', 'Lisa', 'Nancy',
        'Karen', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon',
        'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Jessica',
        'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Amy', 'Anna'],
    LAST_NAME: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller',
        'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson',
        'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson',
        'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark',
        'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen'],
    SEASON: ['Spring', 'Summer', 'Fall', 'Winter'],

    DATE_YYYY: function() {
      var yyyy = randomDate().getFullYear();
      return yyyy + '';
    },
    DATE_DD: function() {
      return padLeft(randomDate().getDate(), '0', 2);
    },
    DATE_MM: function() {
      return padLeft(randomDate().getMonth() + 1, '0', 2);
    },
    TIME_HH: function() {
      return padLeft(randomDate().getHours(), '0', 2);
    },
    TIME_MM: function() {
      return padLeft(randomDate().getMinutes(), '0', 2);
    },
    TIME_SS: function() {
      return padLeft(randomDate().getSeconds(), '0', 2);
    },
  };
  mocker.fn.NAME = [].concat(mocker.fn.MALE_NAME).concat(mocker.fn.FEMALE_NAME);

  function fromTemplate(template, cache, range) {
    if (template == null) {
      return template;
    }

    var func;
    switch (typeof(template)) {
      default: return template;
      case 'string':
        func = fromStringTemplate;
        break;
      case 'object':
        if (Array.isArray(template)) {
          func = fromArrayTemplate;
        } else {
          func = fromObjectTemplate;
        }
        break;
    }
    return func(template, cache, range);
  }

  function fromArrayTemplate(template, cache, range) {
    var result = [];

    range = getRangeValue(range, 1, 10);

    template = template[0];
    while (range > 0) {
      cache = {}; // reset cache for each result value
      result.push(fromTemplate(template, cache));
      range--;
    }
    return result;
  }

  function fromObjectTemplate(template, cache) {
    var result = {};
    Object.keys(template).forEach(function(name) {
      result[removeRange(name)] = fromTemplate(template[name], cache, getRange(name));
    });
    return result;
  }

  function fromStringTemplate(template, cache, repeatRange) {
    if (template == null) {
      return null;
    }

    var result,
      matches = template.match(tokenRegx);
    if (matches) {
      if (matches.length === 1 && matches[0] === template) {
        // result can be any type
        result = getData(template.substr(1), cache);
      } else {
        // result is a string
        result = '';
        matches.forEach(function(key) {
          template = template.replace(key, getData(key.substr(1), cache));
        });

        repeatRange = getRangeValue(repeatRange, 1, 1);
        while (repeatRange > 0) {
          repeatRange--;
          result += template;
        }
      }
    } else {
      result = template;
    }
    return result;
  }

  function getRangeValue(range, defaultMin, defaultMax) {
    var result,
      matches = (range || '').match(/(\d+)-(\d+)/);

    if (matches) {
      result = randomFromRange(matches[1], matches[2], defaultMin, defaultMax);
    } else {
      result = randomFromRange(defaultMin, defaultMax);
    }
    return result;
  }

  function getRange(name) {
    var index = name.indexOf('|');
    if (index > -1) {
      name = name.substr(index);
    } else {
      name = '';
    }
    return name;
  }

  function removeRange(name) {
    var index = name.indexOf('|');
    if (index > -1) {
      name = name.substr(0, index);
    }
    return name;
  }

  function getData(text, cache) {
    var parenIndex = text.indexOf('('),
      fnName,
      params,
      fnValue,
      result;

    if (cache && cache.hasOwnProperty(text)) {
      // use cached value
      result = cache[text];
    } else {
      if (parenIndex > -1) {
        fnName = text.substr(0, parenIndex);
        // (val1,val2,etc.)
        params = text.substr(parenIndex);
        params = params.match(/([^\(,\)]+)/g) || [];
      } else {
        fnName = text;
        params = [];
      }
      // pass along the cache as the first param
      params.unshift(cache);

      fnValue = mocker.fn[fnName];
      if (!fnValue) {
        if (mocker.log) {
          console.warn(fnName);
          console.warn(params);
        }
        result = fnName;
        return;
      }

      // must be an array or a function
      if (Array.isArray(fnValue)) {
        result = fnValue[Math.floor(fnValue.length * mocker.random())];
      } else {
        result = fnValue.apply(null, params);
      }

      // cache result
      if (cache) {
        cache[text] = result;
      }
    }
    return result;
  }

  function padLeft(txt, letter, length) {
    txt += '';
    while (txt.length < length) {
      txt = letter + txt;
    }
    return txt;
  }

  function padRight(txt, letter, length) {
    txt += '';
    while (txt.length < length) {
      txt += letter;
    }
    return txt;
  }

  function randomFromRange(min, max, defaultMin, defaultMax) {
    min = (min) ? parseInt(min, 10) : (defaultMin || 0);
    max = (max) ? parseInt(max, 10) : (defaultMax || 10);
    if (max < min) {
      var tmp = max;
      max = min;
      min = tmp;
    }
    return Math.round(mocker.random() * (max - min)) + min;
  }

  function randomDate() {
    return new Date(Math.floor(mocker.random() * new Date().valueOf()));
  }

  // set to Math.random if you want more random
  mocker.random = function random() {
    // http://stackoverflow.com/questions/521295/javascript-random-seeds/19303725#19303725
    var x = Math.sin(mocker.randomIndex++) * 10000;
    x = x - Math.floor(x);
    return x;
  };
  mocker.randomIndex = 1;
  mocker.fromTemplate = function(template) {
    return fromTemplate(template, {});
  };
  mocker.log = false;
  mocker.getData = getData;
  mocker.randomFromRange = randomFromRange;
  mocker.padLeft = padLeft;
  mocker.padRight = padRight;

  return mocker;
});
