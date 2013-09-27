define([
  'underscore'
], function(
  _und
) {
  "use strict";

  var _decode = window.decodeURIComponent;

  function Querystring(query) {
    this._query = query;
    this._items = parseQuery(query);
  }

  // public members
  Querystring.prototype.removeValue = function(field) {
    delete this._items[field.toLowerCase()];
  };
  Querystring.prototype.getValue = function(field, type) {
    if (!field) {
      return;
    }

    field = field.toLowerCase(); // case insensitive

    var name, items = this._items,
      result;
    for (name in items) {
      if (field === name.toLowerCase()) {
        result = items[name];
        if (type) {
          // use first value if there is a list
          if (type !== "array" && _und.isArray(result)) {
            result = result[0];
          }

          switch (type) {
            case "array":
              if (result) {
                // it could already be an array so check if it's a string
                if (typeof items[name] === "string") {
                  result = [result];
                }
              } else {
                result = [];
              }
              break;
            case "bool":
            case "boolean":
              if (result) {
                result = result.toLowerCase(); // case insensitive
                result = (result === "true" || result === "1" || result === "yes" || result === "on");
              } else {
                result = false;
              }
              break;
            case "int":
              if (result) {
                result = parseInt(result, 10);
              }
              break;
            case "string":
              // use result
              break;
          }
        }
        break;
      }
    }

    return result;
  };


  function decodeComponent(s) {
    // replace "+" with encoded space, then decode
    return _decode((s + "").replace(/\+/g, '%20'));
  }

  function getQuery(uri) {
    var query, pos;

    pos = uri.indexOf('#');
    if (pos > -1) {
      uri = uri.substring(0, pos);
    }

    pos = uri.indexOf('?');
    if (pos > -1) {
      // escaping?
      query = uri.substring(pos + 1) || null;
      //uri = uri.substring(0, pos);
    }

    return query;
  }

  function parseQuery(text) {
    var items = {}, name, splits, length, v, value, i;

    if (!text) {
      return items;
    }

    // replace multiple &&&... with &
    // remove starting and trailing ? and &
    text = text.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!text) {
      return items;
    }

    splits = text.split('&');
    length = splits.length;

    for (i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = decodeComponent(v.shift());
      value = v.length ? decodeComponent(v.join('=')) : null; // when no "=" value is null as per spec

      // make comma separated values into an array
      if (value) {
        v = value.split(',');
        if (v.length > 1) {
          value = v;
        }
      }

      if (items[name] != null) {
        // item already exists, change the value into an array of strings

        // null shouldn't be include in array
        if (value != null) {
          if (typeof items[name] === "string") {
            items[name] = [items[name]];
          }

          if (typeof value === "string") {
            items[name].push(value);
          } else {
            items[name] = _und.union(items[name], value);
          }
        }
      } else {
        items[name] = value;
      }
    }

    return items;
  }

  function getFragment(uri) {
    var frag, pos;

    pos = uri.indexOf('#');
    if (pos > -1) {
      // escaping?
      frag = uri.substring(pos + 1) || null;
      //uri = uri.substring(0, pos);
    }

    return frag;
  }

  function toQueryPair(key, value) {
    if (_und.isUndefined(value)) {
      return key;
    }

    // ensure the value is a string
    value = value == null ? '' : value + "";

    // normalize newlines as \r\n. as per HTML spec.
    value = value.replace(/(\r)?\n/g, '\r\n');

    // encode value
    value = encodeURIComponent(value);

    // replace '%20' with '+'. as per HTML spec.
    value = value.replace(/%20/g, '+');

    //
    return key + '=' + value;
  }

  function toQuerystring(obj) {
    var results = [];

    _und.each(obj, function(value, key) {
      // encode key
      key = encodeURIComponent(key);

      if (value && typeof(value) === 'object') {
        if (_und.isArray(value)) {
          // add each value of the array
          _und.each(value, function(value) {
            results.push(toQueryPair(key, value));
          });
        }
      } else {
        if (_und.isBoolean(value) && !value) {
          // exclude false boolean values
          return;
        }
        // add value
        results.push(toQueryPair(key, value));
      }
    });

    return results.join('&');
  }

  Querystring.decodeComponent = decodeComponent;
  Querystring.getQuery = getQuery;
  Querystring.parseQuery = parseQuery;
  Querystring.getFragment = getFragment;
  Querystring.toQueryPair = toQueryPair;
  Querystring.toQuerystring = toQuerystring;

  // create instances for current url
  Querystring.instance = new Querystring(getQuery(window.location.href));
  Querystring.fragment = new Querystring(getFragment(window.location.href));

  return Querystring;
});
