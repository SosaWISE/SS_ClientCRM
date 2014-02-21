define('src/core/dataservice.base', [
  'jquery',
  'src/core/jsonhelpers',
  'src/core/querystring',
  'src/core/utils',
], function(
  jquery,
  jsonhelpers,
  querystring,
  utils
) {
  "use strict";

  var _requestCounter = 0,
    _sessionId = null,
    _history = [];

  function frontSlash(text) {
    return text ? ('/' + text) : '';
  }

  function DataserviceBase(collectionName, domain) {
    this.collectionName = collectionName;
    this.baseUrl = (domain ? ('//' + domain) : '') + frontSlash(collectionName);
  }
  DataserviceBase.prototype.timeout = 1000 * 30;
  // DataserviceBase.prototype.timeout = 1000 * 6;
  // DataserviceBase.prototype.timeout = 1000 * 60 * 3;

  DataserviceBase.prototype.createRequestUrl = function(id, link, queryObj /*, httpVerb*/ ) {
    var query = querystring.toQuerystring(queryObj);
    return this.baseUrl + frontSlash(id) + frontSlash(link) + (query ? ('?' + query) : '');
  };

  //@NOTE: the webservice only supports POST, GET and DELETE

  DataserviceBase.prototype.post = function(path, data, setter, callback) {
    this.ajax('POST', null, path, null, data, setter, callback);
  };
  DataserviceBase.prototype.get = function(path, queryObj, setter, callback) {
    this.ajax('GET', null, path, queryObj, null, setter, callback);
  };

  DataserviceBase.prototype.save = function(params, setter, callback) {
    this.ajax('POST', params.id, params.link, null, params.data, setter, callback);
  };
  DataserviceBase.prototype.read = function(params, setter, callback) {
    this.ajax('GET', params.id, params.link, params.queryObj, null, setter, callback);
  };
  // DataserviceBase.prototype.update = function(id, data, setter, callback) {
  //   this.ajax('PATCH', id, null, null, data, setter, callback);
  // };
  DataserviceBase.prototype.del = DataserviceBase.prototype.delete = function(id, setter, callback) {
    this.ajax('DELETE', id, null, null, null, setter, callback);
  };
  // DataserviceBase.prototype.replace = function(id, data, setter, callback) {
  //   this.ajax('PUT', id, null, null, data, setter, callback);
  // };

  DataserviceBase.prototype.ajax = function(httpVerb, id, link, queryObj, data, setter, callback) {
    queryObj = (queryObj || {});
    if (!queryObj.SessionId) {
      queryObj.SessionId = _sessionId;
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
      data: (data && typeof(data) !== "string") ? JSON.stringify(data, jsonhelpers.replacer) : data,

      contentType: 'application/json',
      dataType: 'json',

      callback: callback,
      setter: setter,
    };

    // add to history
    _history.push(context);
    // trim history list
    if (_history.length > DataserviceBase.maxHistory) {
      _history.shift();
    }

    return this.execute(context);
  };

  DataserviceBase.prototype.execute = function(context) {
    var _this = this;

    // make request
    return jquery.ajax({
      url: context.requestUrl,
      type: context.httpVerb,
      data: context.data,

      timeout: _this.timeout,

      contentType: context.contentType || 'application/json',
      dataType: context.dataType || 'json',

      crossDomain: true,
      /** This needs to be enabled once we are in production.
       * The header property Access-Control-Allow-Origin also needs to be changed from '*' wildcard to where the client is
       * hosted. */
      xhrFields: {
        withCredentials: true,
      },

      processData: false,
      cache: false,

      error: function(xhr, textStatus, errorThrown) {
        _this.onError(xhr, textStatus, errorThrown, context);
      },
      success: function(responseData, textStatus, xhr) {
        _this.onComplete(responseData, textStatus, xhr, context);
      },
    });
  };

  DataserviceBase.prototype.onError = function(xhr, textStatus, errorThrown, context) {
    xhr = xhr || {};
    if (xhr.readyState === 0 && textStatus === 'error') {
      // ignore the error if readyState is UNSENT.
      // page is probably refreshing or closing
      return;
    }

    var value, code, message, responseData;
    try {

      try {
        value = JSON.parse(xhr.responseText);
      } catch (ex) {
        value = xhr.responseText;
      }

      if (textStatus === 'timeout') {
        code = 990003;
        message = 'Request Timeout Error';
      } else {
        code = 990002;
        message = 'Server Error';
      }

      responseData = {
        Code: code,
        Message: errorThrown || message,
        Value: value,
      };
    } catch (ex) {
      console.log(ex);
      responseData = {
        Code: 990001,
        Message: 'Error processing response',
        Value: null,
      };
    }
    this.onComplete(responseData, textStatus, xhr, context);
  };

  DataserviceBase.prototype.onComplete = function(responseData, textStatus, xhr, context) {
    xhr = xhr || {};
    context.response = {
      time: new Date(),
      text: xhr.responseText,
      data: responseData,
      status: textStatus,
      xhr: xhr,
    };

    if (utils.isFunc(context.callback)) {
      // try to update session id
      DataserviceBase.sessionID(responseData.SessionId);
      var err;
      // check if there was an error
      if (responseData.Code === 0) {
        // try to set setter value,
        if (utils.isFunc(context.setter)) {
          context.setter(responseData.Value);
        }
      } else {
        err = responseData;
      }
      // call callback function
      context.callback(err, responseData, context);
    }
  };

  DataserviceBase.prototype.sessionID = function() {
    return DataserviceBase.sessionID();
  };

  //
  // static
  //
  DataserviceBase.sessionID = function(id) {
    // only set session id if it has a value and it has changed
    if (id && _sessionId !== id) {
      //@REVIEW: store sessionId by domain??
      _sessionId = id;
    }
    return _sessionId;
  };
  DataserviceBase.maxHistory = 20;
  DataserviceBase._history = _history;

  return DataserviceBase;
});
