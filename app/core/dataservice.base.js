define("src/core/dataservice.base", [
  "jquery",
  "src/core/storage",
  "src/core/jsonhelpers",
  "src/core/querystring",
  "src/core/authorize",
  "src/core/utils",
  "src/core/harold",
], function(
  jquery,
  storage,
  jsonhelpers,
  querystring,
  authorize,
  utils
) {
  "use strict";

  var _requestCounter = 0,
    _history = [];

  function DataserviceBase(collectionName, domain) {
    this.collectionName = collectionName;
    this.baseUrl = (domain ? ("//" + domain) : "") + frontSlash(collectionName);
  }

  //@NOTE: the webservice only supports POST, GET and DELETE (which is why update and replace are commented out)

  // raw post/get (difficult to mock)
  DataserviceBase.prototype.post = function(path, data, setter, callback) {
    this.ajax("POST", null, path, null, data, setter, callback);
  };
  DataserviceBase.prototype.get = function(path, queryObj, setter, callback) {
    this.ajax("GET", null, path, queryObj, null, setter, callback);
  };

  // post/get with params object (easy to mock)
  DataserviceBase.prototype.save = function(params, setter, callback) {
    this.ajax("POST", getId(params), getLink(params), params.query, params.data, setter, callback);
  };
  DataserviceBase.prototype.read = function(params, setter, callback) {
    this.ajax("GET", getId(params), getLink(params), params.query, params.data, setter, callback);
  };
  // DataserviceBase.prototype.update = function(id, data, setter, callback) {
  //   this.ajax("PATCH", id, null, null, data, setter, callback);
  // };
  DataserviceBase.prototype.del = DataserviceBase.prototype.delete = function(params, setter, callback) {
    if (utils.isObject(params)) {
      this.ajax("DELETE", getId(params), getLink(params), params.query, params.data, setter, callback);
    } else {
      this.ajax("DELETE", params, null, null, null, setter, callback);
    }
  };
  // DataserviceBase.prototype.replace = function(id, data, setter, callback) {
  //   this.ajax("PUT", id, null, null, data, setter, callback);
  // };



  DataserviceBase.prototype.createRequestUrl = function(id, link, queryObj /*, httpVerb*/ ) {
    var query = querystring.toQuerystring(queryObj);
    return this.baseUrl + frontSlash(id) + frontSlash(link) + (query ? ("?" + query) : "");
  };
  DataserviceBase.prototype.ajax = function(httpVerb, id, link, queryObj, data, setter, callback) {
    queryObj = (queryObj || {});

    var contentType = "application/json";
    if (data) {
      if (data instanceof FormData) {
        contentType = false;
      } else if (!utils.isStr(data)) {
        data = jsonhelpers.stringify(data);
      }
    }

    var context = {
      request: {
        id: ++_requestCounter,
        time: new Date(),
      },

      requestUrl: this.createRequestUrl(id, link, queryObj, httpVerb),

      //  CRUD     Http Verb
      // -----------------------------
      // Create  - POST
      // Read    - GET
      // Update  - PATCH (partial PUT)
      // Delete  - DELETE
      // Replace - PUT
      httpVerb: httpVerb,
      data: data,

      contentType: contentType,
      dataType: "json",

      callback: callback,
      setter: setter,
    };

    // add to history
    _history.push(context);
    // trim history list
    if (_history.length > DataserviceBase.maxHistory) {
      _history.shift();
    }

    authorize.execute(context, execute);
  };

  //
  // static
  //

  DataserviceBase.maxHistory = 20;
  DataserviceBase._history = _history;

  DataserviceBase.timeout = 1000 * 30;
  // DataserviceBase.timeout = 1000 * 6;
  // DataserviceBase.timeout = 1000 * 60 * 3;

  function getToken() {
    var auth = storage.getItem("auth");
    return auth ? auth.Token : null;
  }

  function execute(context) {
    var headers = {};
    var token = context.token || getToken();
    if (token) {
      headers.Authorization = "Token" + token;
    }

    // make request
    jquery.ajax({
      url: context.requestUrl,
      type: context.httpVerb,
      data: context.data,

      timeout: DataserviceBase.timeout,

      contentType: context.contentType,
      dataType: context.dataType,

      headers: headers,
      crossDomain: true,
      /** This needs to be enabled once we are in production.
       * The header property Access-Control-Allow-Origin also needs to be changed from "*" wildcard to where the client is
       * hosted. */
      xhrFields: {
        withCredentials: true,
      },

      processData: false,
      cache: false,

      error: function(xhr, textStatus, errorThrown) {
        onError(xhr, textStatus, errorThrown, context);
      },
      success: function(responseData, textStatus, xhr) {
        authorize.handleResponse(responseData, textStatus, xhr, context, onComplete, execute);
      },
    });
  }

  function onError(xhr, textStatus, errorThrown, context) {
    xhr = xhr || {};
    // if (xhr.readyState === 0 && textStatus === "error") {
    //   // ignore the error if readyState is UNSENT.
    //   // page is probably refreshing or closing
    //   return;
    // }

    var value, code, msg, msgParts, responseData;
    try {
      msgParts = [];

      try {
        value = jsonhelpers.parse(xhr.responseText);
      } catch (ex) {
        value = xhr.responseText;
      }

      if (textStatus === "timeout") {
        code = 990003;
        msg = "Request timed out";
      } else if (xhr.readyState === 0) {
        code = 990000;
        msg = "Unable to connect to server";
      } else {
        code = 990002;
        msg = "Error making request";
      }
      msgParts.push(msg);

      if (utils.isStr(errorThrown) && errorThrown.length) {
        msgParts.push(errorThrown);
      }
      if (value && value.Message) {
        msgParts.push(value.Message);
      }

      responseData = {
        Code: code,
        Message: msgParts.join(": "),
        Value: value,
      };
    } catch (ex) {
      console.error(ex);
      responseData = {
        ex: null, // do not want this exception logged
        Code: 990001,
        Message: ex.stack,
        Value: null,
      };
    }
    onComplete(responseData, textStatus, xhr, context);
  }

  function onComplete(responseData, textStatus, xhr, context) {
    xhr = xhr || {};
    context.response = {
      time: new Date(),
      text: xhr.responseText,
      data: responseData,
      status: textStatus,
      xhr: xhr,
    };

    // set request url
    responseData.Url = context.requestUrl;

    var err;
    // check if there was an error
    if (responseData.Code === 0) {
      // try to set setter value,
      if (utils.isFunc(context.setter)) {
        try {
          context.setter(responseData.Value);
        } catch (ex) {
          console.error(ex);
          err = {
            Code: 990004,
            Message: ex.stack,
            Value: null,
          };
        }
      }
    } else {
      err = responseData;
      // // prepend requestUrl
      // err.Message = context.requestUrl + "\n" + (err.Message || "");
    }
    if (utils.isFunc(context.callback)) {
      // call callback function
      context.callback(err, responseData, context);
    }
  }


  function frontSlash(text) {
    return (text || text === 0) ? ("/" + text) : "";
  }

  function getStringValue(params, name) {
    if (!_hasOwnProperty.call(params, name)) {
      return null;
    }
    var result = params[name];
    // if the property has been set, but is null/undefined, convert it to a string
    if (result == null) {
      result += "";
    }
    return result;
  }
  var _hasOwnProperty = Object.prototype.hasOwnProperty;

  function getId(params) {
    return getStringValue(params, "id");
  }

  function getLink(params) {
    return getStringValue(params, "link");
  }

  // export for specs
  DataserviceBase.onError = onError;
  DataserviceBase.onComplete = onComplete;

  return DataserviceBase;
});
