define('src/core/dataservice.base', [
  'jquery',
  'src/util/querystring'
], function(
  $,
  querystring
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

  DataserviceBase.prototype.get = function(path, queryObj, callback) {
    this.ajax('GET', null, path, queryObj, null, callback);
  };
  DataserviceBase.prototype.post = function(path, data, callback) {
    this.ajax('POST', null, path, null, data, callback);
  };

  DataserviceBase.prototype.create = function(data, callback) {
    this.ajax('POST', null, null, null, data, callback);
  };
  DataserviceBase.prototype.read = function(id, link, queryObj, callback) {
    this.ajax('GET', id, link, queryObj, null, callback);
  };
  DataserviceBase.prototype.update = function(id, data, callback) {
    this.ajax('PATCH', id, null, null, data, callback);
  };
  DataserviceBase.prototype.del = DataserviceBase.prototype.delete = function(id, callback) {
    this.ajax('DELETE', id, null, null, null, callback);
  };
  DataserviceBase.prototype.replace = function(id, data, callback) {
    this.ajax('PUT', id, null, null, data, callback);
  };

  DataserviceBase.prototype.ajax = function(httpVerb, id, link, queryObj, data, callback) {
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
      data: (data && typeof(data) !== "string") ? JSON.stringify(data) : data,

      contentType: 'application/json',
      dataType: 'json',

      callback: callback,
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
    return $.ajax({
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

    var value, code, message, response;
    try {

      try {
        value = JSON.parse(xhr.responseText);
      } catch (ex) {
        value = xhr.responseText;
      }

      if (textStatus === 'timeout') {
        code = 3;
        message = 'Request Timeout Error';
      } else {
        code = 2;
        message = 'Server Error';
      }

      response = {
        Code: code,
        Message: errorThrown || message,
        Value: value,
      };
    } catch (ex) {
      console.log(ex);
      response = {
        Code: 1,
        Message: 'Error processing response',
        Value: null,
      };
    }
    this.onComplete(response, textStatus, xhr, context);
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

    if (typeof(context.callback) === 'function') {
      // try to update session id
      DataserviceBase.sessionID(responseData.SessionId);
      // call callback function
      context.callback(responseData, context);
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
