// the mock factory
define('mock/mockery', [
], function() {
  'use strict';

  var mockery = {},
    identitySeed = 1000,
    tokenRegx = /@([A-Z_0-9]+(:?\([^\(\)]*\))?)/g,
    loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    incMap = {};

  mockery.fn = {
    BOOL: function() {
      return mockery.random() >= 0.5;
    },
    NUMBER: function(cache, min, max) {
      return randomFromRange(min, max, 0, 10);
    },
    INC: function(cache, key) {
      var val = incMap[key];
      if (val) {
        val++;
      } else {
        val = identitySeed; // default start value
      }
      incMap[key] = val;
      return val;
    },
    INC_NULLABLE: function(cache, key) {
      if (mockery.random() >= 0.8) {
        return null; // top level
      } else {
        return mockery.fn.INC(cache, key + 'NULLABLE');
      }
    },
    REF_INC: function(cache, key) {
      return mockery.fn.NUMBER(cache, identitySeed, incMap[key] || identitySeed);
    },
    FK: function(cache, key) {
      return incModulus(cache, key, key + '_FK_');
      // var count = incMap[key] - identitySeed + 1,
      //   fkCount = mockery.fn.INC(cache, key + '_FK_') - identitySeed;
      // return (fkCount % count) + identitySeed;
    },
    IMG: function(cache, width, height, category) {
      return 'http://lorempixel.com/' + width + '/' + height + '/' + (category || '');
    },
    TEXT: function(cache, min, max) {
      var results = [],
        num = randomFromRange(min, max, 10, 50),
        length = 0,
        splitIndex,
        str = loremIpsum,
        tmpStr;
      splitIndex = Math.floor((loremIpsum.length - 2) * mockery.random());
      str = loremIpsum.substr(splitIndex) + loremIpsum.substr(0, splitIndex);
      while (length < num) {
        if ((length + str.length) < num) {
          tmpStr = str;
        } else {
          tmpStr = str.substr(0, num - length);
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
      return fromTemplate('@NAME.@LASTNAME@@LASTNAME(cb).com', cache).toLowerCase();
    },
    FULLNAME: function(cache) {
      return fromTemplate('@NAME @LASTNAME', cache);
    },
    CHAR_UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    CHAR_LOWER: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    MNAME: ['James', 'John', 'Robert', 'Michael', 'William', 'David',
        'Richard', 'Charles', 'Joseph', 'Thomas', 'Christopher', 'Daniel',
        'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven', 'Edward',
        'Brian', 'Ronald', 'Anthony', 'Kevin', 'Jason', 'Matthew', 'Gary',
        'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank', 'Scott', 'Eric'],
    FEMNAME: ['Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth',
        'Jennifer', 'Maria', 'Susan', 'Margaret', 'Dorothy', 'Lisa', 'Nancy',
        'Karen', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon',
        'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Jessica',
        'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Amy', 'Anna'],
    LASTNAME: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller',
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
  mockery.fn.NAME = [].concat(mockery.fn.MNAME).concat(mockery.fn.FEMNAME);

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

      fnValue = mockery.fn[fnName];
      if (!fnValue) {
        if (mockery.log) {
          console.warn(fnName);
          console.warn(params);
        }
        result = fnName;
        return;
      }

      // must be an array or a function
      if (Array.isArray(fnValue)) {
        result = fnValue[Math.floor(fnValue.length * mockery.random())];
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

  function incModulus(cache, refKey, key) {
    var count = incMap[refKey] - identitySeed + 1,
      refCount = mockery.fn.INC(cache, key) - identitySeed;
    return (refCount % count) + identitySeed;
  }

  function randomFromRange(min, max, defaultMin, defaultMax) {
    min = (min) ? parseInt(min, 10) : (defaultMin || 0);
    max = (max) ? parseInt(max, 10) : (defaultMax || 10);
    if (max < min) {
      var tmp = max;
      max = min;
      min = tmp;
    }
    return Math.round(mockery.random() * (max - min)) + min;
  }

  function randomDate() {
    return new Date(Math.floor(mockery.random() * new Date().valueOf()));
  }

  // set to Math.random if you want more random
  mockery.random = function random() {
    // http://stackoverflow.com/questions/521295/javascript-random-seeds/19303725#19303725
    var x = Math.sin(mockery.randomIndex++) * 10000;
    x = x - Math.floor(x);
    return x;
  };
  mockery.randomIndex = 1;
  mockery.fromTemplate = function(template) {
    return fromTemplate(template, {});
  };
  mockery.log = false;
  mockery.getData = getData;
  mockery.randomFromRange = randomFromRange;
  mockery.padLeft = padLeft;
  mockery.padRight = padRight;
  mockery.incModulus = incModulus;

  return mockery;
});