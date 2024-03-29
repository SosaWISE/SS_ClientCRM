// the mock factory
define("src/core/mockery", [
  "src/core/utils",
], function(
  utils
) {
  "use strict";

  var mockery = {},
    identitySeed = 1, //1000,
    tokenRegx = /@([A-Z_0-9]+(:?\([^\(\)]*\))?)/g,
    loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
    incMap = {};

  mockery.fn = {
    BOOL: function(cache) {
      return cache.__funcs.random() >= 0.5;
    },
    NUMBER: function(cache, min, max) {
      return randomFromRange(cache, min, max, 0, 10);
    },
    MONEY: function(cache, min, max) {
      min = (min) ? parseInt(min, 10) : 1;
      max = (max) ? parseInt(max, 10) : 100;
      return randomFromRange(cache, min * 100, max * 100, 100, 10000) / 100;
    },
    INC: function(cache, key, idSeed) {
      var val, obj = incMap[key];
      if (obj) {
        val = ++obj.val;
      } else {
        if (idSeed) {
          idSeed = parseInt(idSeed, 10);
        }
        val = idSeed || identitySeed; // default start value
        incMap[key] = {
          val: val,
          idSeed: val,
        };
      }
      return val;
    },
    INC_NULLABLE: function(cache, key) {
      if (cache.__funcs.random() >= 0.8) {
        return null; // top level
      } else {
        return mockery.fn.INC(cache, key + "NULLABLE");
      }
    },
    REF_INC: function(cache, key) {
      var obj = incMap[key];
      return mockery.fn.NUMBER(cache, identitySeed, obj ? obj.val : identitySeed);
    },
    FK: function(cache, key) {
      return incModulus(cache, key, key + "_FK_");
      // var count = incMap[key] - identitySeed + 1,
      //   fkCount = mockery.fn.INC(cache, key + "_FK_") - identitySeed;
      // return (fkCount % count) + identitySeed;
    },
    IMG: function(cache, width, height, category) {
      return "//lorempixel.com/" + width + "/" + height + "/" + (category || "");
    },
    TEXT: function(cache, min, max) {
      var results = [],
        num = randomFromRange(cache, min, max, 10, 50),
        length = 0,
        splitIndex,
        str = loremIpsum,
        tmpStr;
      splitIndex = Math.floor((loremIpsum.length - 2) * cache.__funcs.random());
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
      return results.join(". ");
    },
    PHONE: function(cache, busterKey) {
      // prepend comma
      busterKey = (busterKey) ? "," + busterKey : "";
      // return fromTemplate("(@NUMBER(200,999)) @NUMBER(100,999)-@NUMBER(1000,9999)", cache);
      return fromTemplate("@NUMBER(200,999" + busterKey + ")@NUMBER(100,999" + busterKey + ")@NUMBER(1000,9999" + busterKey + ")", cache);
    },
    EMAIL: function(cache) {
      return fromTemplate("@NAME.@LASTNAME@@LASTNAME(cb)inc.com", cache).toLowerCase();
    },
    FULLNAME: function(cache) {
      return fromTemplate("@NAME @LASTNAME", cache);
    },
    CHAR_UPPER: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    CHAR_LOWER: "abcdefghijklmnopqrstuvwxyz".split(""),
    MNAME: ["James", "John", "Robert", "Michael", "William", "David",
      "Richard", "Charles", "Joseph", "Thomas", "Christopher", "Daniel",
      "Paul", "Mark", "Donald", "George", "Kenneth", "Steven", "Edward",
      "Brian", "Ronald", "Anthony", "Kevin", "Jason", "Matthew", "Gary",
      "Timothy", "Jose", "Larry", "Jeffrey", "Frank", "Scott", "Eric",
    ],
    FEMNAME: ["Mary", "Patricia", "Linda", "Barbara", "Elizabeth",
      "Jennifer", "Maria", "Susan", "Margaret", "Dorothy", "Lisa", "Nancy",
      "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol", "Ruth", "Sharon",
      "Michelle", "Laura", "Sarah", "Kimberly", "Deborah", "Jessica",
      "Shirley", "Cynthia", "Angela", "Melissa", "Brenda", "Amy", "Anna",
    ],
    LASTNAME: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller",
      "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson",
      "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson",
      "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark",
      "Lewis", "Robinson", "Walker", "Perez", "Hall", "Young", "Allen",
    ],
    SEASON: ["Spring", "Summer", "Fall", "Winter"],

    NOW: function() {
      return new Date();
    },
    DATE: function(cache) {
      var dt = randomDate(cache);
      return padLeft(dt.getFullYear(), "0", 4) + "-" + padLeft(dt.getMonth() + 1, "0", 2) + "-" + padLeft(dt.getDate(), "0", 2) + "T00:00:00.000Z";
    },
    DATETIME: function(cache, startDaysFromNow, endDaysFromNow) {
      return randomDate(cache, startDaysFromNow, endDaysFromNow).toISOString();
    },

    ADDRESS: function(cache) {
      return fromTemplate("@NUMBER(100,1999,North) North @NUMBER(100,1999,East) East", cache);
    },
    CITY: function(cache) {
      return fromTemplate("@LASTNAME(City)ton", cache);
    },
    // STATEAB: function(cache) {
    //   return fromTemplate("@CHAR_UPPER(StateA)@CHAR_UPPER(StateB)", cache);
    // },
    STATEAB: ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM", "GA", "GU",
      "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO",
      "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA",
      "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY",
    ],
    ZIP: function(cache) {
      return fromTemplate("8@NUMBER(1000,9999)", cache);
    },
    COUNTY: function(cache) {
      return fromTemplate("@LASTNAME(County) County", cache);
    },
  };
  mockery.fn.NAME = [].concat(mockery.fn.MNAME).concat(mockery.fn.FEMNAME);

  function fromTemplate(template, cache, range) {
    if (template == null) {
      return template;
    }

    var func;
    switch (typeof(template)) {
      case "string":
        func = fromStringTemplate;
        break;
      case "object":
        if (utils.isDate(template)) {
          // just return a copy of the date
          return new Date(template.valueOf());
        } else if (Array.isArray(template)) {
          func = fromArrayTemplate;
        } else {
          func = fromObjectTemplate;
        }
        break;
      default:
        return template;
    }
    return func(template, cache, range);
  }

  function fromArrayTemplate(template, cache, range) {
    var result = [];

    range = getRangeValue(cache, range, 1, 10);

    template = template[0];
    while (range > 0) {
      // reset cache for each result value
      cache = {
        // copy __funcs
        __funcs: cache.__funcs,
      };
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
        result = "";
        matches.forEach(function(key) {
          template = template.replace(key, getData(key.substr(1), cache));
        });

        repeatRange = getRangeValue(cache, repeatRange, 1, 1);
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

  function getRangeValue(cache, range, defaultMin, defaultMax) {
    var result,
      matches = (range || "").match(/(\d+)-(\d+)/);

    if (matches) {
      result = randomFromRange(cache, matches[1], matches[2], defaultMin, defaultMax);
    } else {
      result = randomFromRange(cache, defaultMin, defaultMax);
    }
    return result;
  }

  function getRange(name) {
    var index = name.indexOf("|");
    if (index > -1) {
      name = name.substr(index);
    } else {
      name = "";
    }
    return name;
  }

  function removeRange(name) {
    var index = name.indexOf("|");
    if (index > -1) {
      name = name.substr(0, index);
    }
    return name;
  }

  function getData(text, cache) {
    var parenIndex = text.indexOf("("),
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
        result = fnValue[Math.floor(fnValue.length * cache.__funcs.random())];
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

  function incModulus(cache, refKey, key) {
    var obj = incMap[refKey],
      count, refCount;
    if (!obj) {
      throw new Error("invalid refKey `" + refKey + "`");
    }
    count = obj.val - obj.idSeed + 1;
    refCount = mockery.fn.INC(cache, key) - obj.idSeed;
    return (refCount % count) + obj.idSeed;
  }

  function pad(isLeft, txt, letter, minLength) {
    if (!txt && txt !== 0) {
      txt = "";
    }
    txt += "";
    if (isLeft) {
      while (txt.length < minLength) {
        txt = letter + txt;
      }
    } else {
      while (txt.length < minLength) {
        txt += letter;
      }
    }
    return txt;
  }

  function padLeft(txt, letter, minLength) {
    return pad(true, txt, letter, minLength);
  }

  // function padRight(txt, letter, minLength) {
  //   return pad(false, txt, letter, minLength);
  // }

  function randomFromRange(cache, min, max, defaultMin, defaultMax) {
    min = (min) ? parseInt(min, 10) : (defaultMin || 0);
    max = (max) ? parseInt(max, 10) : (defaultMax || 10);
    if (max < min) {
      var tmp = max;
      max = min;
      min = tmp;
    }
    return Math.round(cache.__funcs.random() * (max - min)) + min;
  }

  function randomDate(cache, startDaysFromNow, endDaysFromNow) {
    var dt;
    // startDaysFromNow/endDaysFromNow: number of days before or after now
    //   - positive number goes into the future
    //   - negative number goes into the past
    startDaysFromNow = parseInt(startDaysFromNow, 10);
    endDaysFromNow = parseInt(endDaysFromNow, 10);
    if (!isNaN(startDaysFromNow) && !isNaN(endDaysFromNow)) {
      var nowTimestamp = mockery.fn.NOW().valueOf(),
        val = randomFromRange(cache, nowTimestamp + (startDaysFromNow * 86400000), nowTimestamp + (endDaysFromNow * 86400000));
      dt = new Date(val);
    } else {
      dt = new Date(Math.floor(cache.__funcs.random() * Date.now()));
    }
    return dt;
  }

  // set to Math.random if you want more random
  mockery.random = function random() {
    // http://stackoverflow.com/questions/521295/javascript-random-seeds/19303725#19303725
    var x = Math.sin(mockery.randomIndex++) * 10000;
    x = x - Math.floor(x);
    return x;
  };
  mockery.randomIndex = 1;
  mockery.fromTemplate = function(template, randomFn, cache) {
    cache = cache || {};
    cache.__funcs = cache.__funcs || {};
    cache.__funcs.random = randomFn || cache.__funcs.random || mockery.random;
    return fromTemplate(template, cache);
  };
  mockery.log = false;
  mockery.getData = getData;
  mockery.randomFromRange = randomFromRange;
  mockery.incModulus = incModulus;
  mockery.addModulusValueFunc = function(name, values) {
    if (mockery.fn[name]) {
      throw new Error(name + " already exists on mockery.fn");
    }
    var count = 0;
    mockery.fn[name] = function() {
      return values[count++ % values.length];
    };
  };


  mockery.filterListBy = function(list, propName, id) {
    return list.filter(function(item) {
      return item[propName] === id;
    });
  };
  mockery.findSingleBy = function(list, propName, id) {
    return list.filter(function(item) {
      return item[propName] === id;
    })[0];
  };
  mockery.findSingleOrAll = function(list, propName, id) {
    var result;
    if (id > 0 || (id && id.length)) {
      result = mockery.findSingleBy(list, propName, id);
    } else {
      result = list;
    }
    return result;
  };
  mockery.createOrUpdate = function(list, idName, idTemplate, newValue) {
    var id = newValue[idName],
      index;

    function findById(item, i) {
      if (item[idName] === id) {
        index = i;
        return true;
      }
    }
    if (id > 0) {
      if (!list.some(findById)) {
        throw new Error("invalid id. id not in list.");
      }

      // replace old value with new value
      list.splice(index, 1, newValue);
    } else {
      newValue[idName] = mockery.fromTemplate(idTemplate, {
        __funcs: {
          random: mockery.random,
        },
      });
      // add new value
      list.push(newValue);
    }
    return newValue;
  };
  mockery.deleteItem = function(list, idName, id) {
    var result;
    list.some(function(item, index) {
      if (item[idName] === id) {
        // remove
        list.splice(index, 1);
        result = item;
        return true;
      }
    });
    return result;
  };
  mockery.saveWithNoPKey = function(list, newValue, findFunc) {
    var index = findFunc(list, newValue);
    if (index > -1) {
      // update
      list.splice(index, 1, newValue);
    } else {
      // create
      list.push(newValue);
    }
    return newValue;
  };
  mockery.send = function(code, value, setter, cb, timeout) {
    var err, result;
    if (value) {
      value = utils.clone(value);
    }
    if (code) {
      err = {
        Code: code,
        Message: "Error Code " + code,
        Value: value,
      };
      // } else if (!value) {
      //   err = {
      //     Code: 12345,
      //     Message: "No value",
      //     Value: null,
      //   };
    } else {
      result = {
        Code: 0,
        Message: "Success",
        Value: value,
      };
    }

    window.setTimeout(function() {
      if (!err && result && utils.isFunc(setter)) {
        setter(result.Value);
      }
      cb(err, result);
    }, timeout || 100);
  };


  return mockery;
});
