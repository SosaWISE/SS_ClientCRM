(function() {
  "use strict";

  var definedMap = {},
    dependantsMap = {},
    pendingDefineMap = {},
    jsonpCount = 0,
    config = window.require || {};
  // ensure certain properties exist
  config.paths = config.paths || {
    // default app namespacing
    src: 'app',
    spec: 'spec',
    specui: 'specui',
    mock: 'mock',
  };
  config.global = config.global || {};

  // setTimeout(function() {
  //   console.log('dependantsMap', JSON.stringify(dependantsMap, null, '  '));
  // }, 1100);

  function define(name, deps, value) {
    var mod, valueType = typeof(value);

    if (valueType === 'undefined') {
      throw new Error('missing value');
    }
    if (definedMap[name]) {
      throw new Error(name + ' module redifined');
    }

    mod = {
      name: name,
      deps: deps,
    };

    if (valueType === 'function') {
      mod.func = value;
    } else {
      mod.value = value;
    }
    definedMap[name] = mod;

    if (pendingDefineMap[name]) {
      pendingDefineMap[name](mod);
    }
  }

  function getModule(name) {
    if (name === 'exports') {
      return {
        name: 'exports',
        deps: [],
        value: {},
      };
    }
    return definedMap[name];
  }


  function require(deps, cb) {
    var notArray = !Array.isArray(deps);
    if (notArray) {
      deps = [deps];
    }
    deps = requireDeps(null, deps, function(deps) {
      if (typeof(cb) === 'function') {
        cb.apply(window, deps);
      }
    });
    if (notArray) {
      deps = deps[0];
    }
    return deps;
  }

  function walkUp(key, find) {
    var dependants = dependantsMap[key],
      result = false;
    if (dependants) {
      dependants.some(function(d) {
        if (d === find) {
          result = true;
          // break loop
          return result;
        }
      });
      if (!result) {
        dependants.some(function(d) {
          // start recursion
          result = walkUp(d, find);
          // break loop if true
          return result;
        });
      }
    }
    return result;
  }

  function requireDeps(dependant, deps, cb) {
    cb = cb;
    var remaining = deps.length,
      resolvedDeps = new Array(remaining);

    if (remaining === 0) {
      cb(resolvedDeps);
      return resolvedDeps;
    }

    function moduleResolved(mod, index) {
      resolvedDeps[index] = mod.value;
      remaining--;
      if (remaining === 0) {
        cb(resolvedDeps);
      }
    }
    deps.forEach(function(name, index) {
      if (dependant) {
        if (walkUp(dependant, name)) {
          // circular dependency, use undefined as the dependency value
          return moduleResolved({}, index);
        }
        // add dependant to map
        (dependantsMap[name] = dependantsMap[name] || []).push(dependant);
      }

      var mod = getModule(name);
      if (mod) {
        // module is defined
        resolveModule(mod, function(mod) {
          moduleResolved(mod, index);
        });
      } else {
        // download module
        resolvedDeps[index] = null;
        addPendingDefine(name, index, moduleResolved);
      }
    });
    return resolvedDeps;
  }

  function addPendingDefine(name, index, cb) {
    if (!pendingDefineMap[name]) {
      var list = [];
      pendingDefineMap[name] = function(mod) {
        delete pendingDefineMap[name];
        resolveModule(mod, function(mod) {
          list.forEach(function(func) {
            func(mod);
          });
        });
      };
      pendingDefineMap[name].list = list;

      loadModule(name, function() {
        if (getModule(name)) {
          return;
        }

        define(name, [], function() {
          return window[config.global[name]];
        });
      });
    }
    pendingDefineMap[name].list.push(function(mod) {
      cb(mod, index);
    });
  }

  function resolveModule(mod, cb) {
    if (mod.value !== undefined) {
      cb(mod);
      return false;
    }
    var resolving = mod.resolving;
    if (resolving) {
      // notify cb when done resolving
      resolving.push(cb);
    } else {
      // mark that we're resolving it and notify cb when done resolving
      mod.resolving = [cb];
      requireDeps(mod.name, mod.deps, function(resolvedDeps) {
        try {
          // get real value
          mod.value = mod.func.apply(window, resolvedDeps);
          if (mod.value == null) {
            mod.deps.some(function(depName, index) {
              if (depName === 'exports') {
                mod.value = resolvedDeps[index];
                return true;
              }
            });
          }
        } catch (ex) {
          console.error('DEPENDS ERROR: failed to init `' + mod.name + '` - ' + ex);
        }
        if (mod.value === undefined) {
          // ensure the value has been set to something other than undefined
          mod.value = null;
        }

        resolving = mod.resolving;
        delete mod.resolving;
        resolving.forEach(function(cb) {
          cb(mod);
        });
      });
    }
    return true;
  }

  function toUrl(name) {
    var parts = name.split('/'),
      pathPart = config.paths[parts[0]];
    if (pathPart) {
      parts[0] = pathPart;
      name = parts.join('/');
    }
    return name + '.js';
  }

  function loadModule(name, cb) {
    var url, async, parts;

    parts = name.split('!');
    if (parts.length === 1) {
      url = toUrl(name);
      async = false;
    } else {
      url = jsonp(parts[1], cb);
      async = true;
    }

    onReady(function() {
      var script = document.createElement('script');
      script.onload = cb;
      script.async = async || false;
      script.src = url;
      document.body.appendChild(script);
    });
  }

  function onReady(cb) {
    if (document.body) {
      cb();
      // setTimeout( cb,0 );
    } else {
      document.addEventListener("DOMContentLoaded", cb, false);
    }
  }

  function jsonp(url, cb) {
    var id = '__jsonp' + (jsonpCount++) + '__';
    url += (url.indexOf('?') < 0) ? '?' : '&';
    url += 'callback=' + id;
    window[id] = function() {
      cb();
    };
    return url;
  }

  //
  window.require = require;
  window.define = define;
  define.amd = {
    jQuery: true,
  };
})();
