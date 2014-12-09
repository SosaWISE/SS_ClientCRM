define('src/viz/idphoto.vm', [
  'src/core/numbers',
  'src/config',
  'src/dataservice',
  'jquery',
  'ko',
  'pixi',
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
], function(
  numbers,
  config,
  dataservice,
  jquery,
  ko,
  PIXI,
  notify,
  utils,
  BaseViewModel
) {
  "use strict";

  ko.bindingHandlers.pixi = {
    init: function(element, valueAccessor) {
      var disposed = false,
        pixiData = ko.unwrap(valueAccessor());
      element.appendChild(pixiData.view);

      function renderFrame() {
        if (!disposed) {
          pixiData.renderFrame();
          window.requestAnimFrame(renderFrame);
        }
      }
      renderFrame();

      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        // detach from parent
        element.removeChild(pixiData.view);
        // stop rendering loop
        disposed = true;
      });
    },
  };

  ko.bindingHandlers.video = {
    init: function(element, valueAccessor) {
      var videoData = ko.unwrap(valueAccessor());
      element.onerror = videoData.onerror;
      element.onloadedmetadata = videoData.onloadedmetadata;
      element.src = videoData.src;
      //
      videoData.video = element;
    },
  };

  var canvasHelper = {
    toBlob: function(canvas, quality) {
      // take apart data URL
      var parts = canvas.toDataURL('image/jpeg', quality).match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
      // assume base64 encoding
      var binStr = atob(parts[3]);
      // convert to binary in ArrayBuffer
      var buf = new ArrayBuffer(binStr.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i < view.length; i++) {
        view[i] = binStr.charCodeAt(i);
      }
      //
      var blob = new Blob([view], {
        'type': parts[1],
      });
      // // create url handle
      // var url = window.URL.createObjectURL(blob);
      // return blob
      return blob;
    }
  };

  // function uploadFormData(url, fd, name, cb) {
  //   var xhr = new XMLHttpRequest();
  //   xhr.upload.addEventListener('progress', function(evt) {
  //     if (evt.lengthComputable) {
  //       var percentComplete = Math.round(evt.loaded * 100 / evt.total);
  //       console.log('upload:', percentComplete.toString() + '%');
  //     } else {
  //       console.log('upload: unable to compute');
  //     }
  //   }, false);
  //   xhr.addEventListener('load', function(evt) {
  //     /* This event is raised when the server send back a response */
  //     notify.info(evt.target.responseText, null, 5);
  //     cb(null, evt.target.responseText);
  //   }, false);
  //   xhr.addEventListener('error', function( /*evt*/ ) {
  //     var msg = 'There was an error attempting to upload the file.';
  //     notify.warn(msg, null, 5);
  //     cb(msg);
  //   }, false);
  //   xhr.addEventListener('abort', function uploadCanceled( /*evt*/ ) {
  //     var msg = 'The upload has been canceled by the user or the browser dropped the connection.';
  //     notify.warn(msg, null, 5);
  //     cb(msg);
  //   }, false);
  //   xhr.open('POST', url);
  //   xhr.send(fd);
  // }

  function IdPhotoViewModel(options) {
    var _this = this;
    IdPhotoViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, [
      'userid',
    ]);

    _this.title = 'Id Photo';

    _this.videoData = ko.observable(null);

    //
    // events
    //
    var currPhoto;
    var canSave = ko.observable(false);
    _this.cmdRotateLeft = ko.command(function(cb) {
      rotateSprite(currPhoto, Math.PI / -2);
      fitToBounds(group, boxWidth, boxHeight, false);
      cb();
    }, function(busy) {
      return !busy && canSave();
    });
    _this.cmdRotateRight = ko.command(function(cb) {
      rotateSprite(currPhoto, Math.PI / 2);
      fitToBounds(group, boxWidth, boxHeight, false);
      cb();
    }, function(busy) {
      return !busy && canSave();
    });
    _this.cmdSave = ko.command(function(cb) {
      // hide overlays
      overlay.visible = false;

      // ensure the stage is rendered
      renderer.render(stage);

      var quality = 0.95;
      var fd = new FormData();
      fd.append('file', canvasHelper.toBlob(renderer.view, quality), quality + 'photo.jpg');

      // uploadFormData('//' + config.serviceDomain + '/humanresourcesrv/users/' + _this.userid + '/upload', fd, function(err, resp) {
      //   resp = resp;
      //   cb();
      // });
      dataservice.humanresourcesrv.users.save({
        id: _this.userid,
        link: 'upload',
        data: fd,
      }, null, utils.safeCallback(cb, function(err, resp) {
        if (resp.Value) {
          _this.layerResult = resp.Value;
          _this.setImage(null); // force clean up
          if (closeLayer(_this) && currPhoto) {
            currPhoto.texture.destroy(true); // destroy it and remove it from the cache

          }
        } else {
          notify.warn('Bad response value: ' + resp.Value, null, 10);
        }
      }, notify.iferror));

      // var win = window.open();
      // win.document.write("<img src='" + data + "'/>");

      // reshow overlays
      overlay.visible = true;
    }, function(busy) {
      return !busy && canSave();
    });
    _this.cmdStartCamera = ko.command(function(cb) {
      startCamera(_this, cb);
    }, function(busy) {
      return !busy && !_this.videoData();
    });
    _this.cmdStopCamera = ko.command(function(cb) {
      _this.videoData.peek().stream.stop();
      _this.videoData(null);
      cb();
    }, function(busy) {
      return !busy && _this.videoData();
    });
    // _this.cmdTakePicture = ko.command(function(cb) {
    //   takePicture(cb);
    // }, function(busy) {
    //   return !busy && _this.videoData();
    // });

    //
    function onImageLoaded() {
      if (_this._disposed) {
        return;
      }
      canSave(currPhoto.texture.baseTexture.hasLoaded);
      //
      fitToBounds(group, boxWidth, boxHeight, true);
      //
      rotateSprite(currPhoto, 0);
    }
    _this.setImage = function(imgUrl, crossOrigin) {
      canSave(false);
      _this.disposePhoto();
      if (imgUrl) {
        currPhoto = new PIXI.Sprite.fromImage(imgUrl, crossOrigin || 'use-credentials');
        //
        currPhoto.anchor.x = 0.5;
        currPhoto.anchor.y = 0.5;
        // add it to group
        group.addChild(currPhoto);
        group.setChildIndex(currPhoto, 0);
        //
        if (currPhoto.texture.baseTexture.hasLoaded) {
          onImageLoaded();
        } else {
          currPhoto.texture.baseTexture.once('loaded', onImageLoaded);
        }
      }
    };
    _this.disposePhoto = function() {
      if (currPhoto) {
        currPhoto.texture.baseTexture.off('loaded', onImageLoaded);
        currPhoto.texture.destroy(true); // destroy it and remove it from the cache
        if (group) {
          group.removeChild(currPhoto);
        }
        currPhoto = null;
      }
    };

    //
    // Pixi setup
    //
    var boxWidth = 600;
    var boxHeight = 600;
    var stage = new PIXI.Stage();
    var renderer = new PIXI.CanvasRenderer(boxWidth, boxHeight, {
      transparent: true,
    });
    // PIXI.autoDetectRenderer (which in chrome returns PIXI.WebGLRenderer) has issues
    //  when opening and closing this dialog quickly.
    // var renderer = PIXI.autoDetectRenderer(boxWidth, boxHeight, null, false, true);

    _this.pixi = {
      view: renderer.view,
      renderFrame: function() {
        renderer.render(stage);
      },
    };

    var group = new PIXI.DisplayObjectContainer();
    // set position
    group.position.x = group.position.y = 0;
    // set size
    group.width = boxWidth;
    group.height = boxHeight;
    //
    stage.addChild(group);

    _this.setImage(_this.imgUrl);

    addDragMove(group, boxWidth, boxHeight);



    var zoomOutScale = 0.95,
      zoomInScale = 1 / zoomOutScale;
    addWheelListener(renderer.view, function(e) {
      var offset = jquery(renderer.view).offset(),
        x = e.clientX - offset.left,
        y = e.clientY - offset.top,
        scale = (e.deltaY < 0) ? zoomInScale : zoomOutScale;

      doZoom(group, x, y, scale);
      fitToBounds(group, boxWidth, boxHeight, false);
    });

    //
    var overlay = createOverlay(boxWidth);
    stage.addChild(overlay);
  }
  utils.inherits(IdPhotoViewModel, BaseViewModel);
  IdPhotoViewModel.prototype.viewTmpl = 'tmpl-viz-idphoto';
  IdPhotoViewModel.prototype.width = 640;
  IdPhotoViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      return _this.layer.close();
    }
  }
  IdPhotoViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };
  IdPhotoViewModel.prototype.closeMsg = function() { // overrides base
    var _this = this,
      msg;
    if (_this.cmdSave.busy() && !_this.layerResult) {
      msg = 'Please wait for save to finish.';
    }
    return msg;
  };
  IdPhotoViewModel.prototype.dispose = function() {
    var _this = this;
    _this._disposed = true;
    _this.disposePhoto();
  };

  // function takePicture(ctx, canvas, video) {
  //   //document.createElement('canvas');
  //   ctx.drawImage(video, 0, 0);
  //   return canvas.toDataURL('image/webp');
  // }
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
  window.URL = window.URL || window.webkitURL;

  function startCamera(_this, cb) {
    if (!navigator.getUserMedia) {
      notify.warn('Sorry. `navigator.getUserMedia()` is not available.', null, 5);
      return;
    }
    // if (_this.videoData.peek()) {
    //   cb();
    //   return;
    // }

    navigator.getUserMedia({
      video: true
    }, function(stream) {
      cb();

      var video = {};

      stream.onended = function( /*e*/ ) {
        if (video.video) {
          video.video.pause();
        }
      };

      video.stream = stream;
      video.src = window.URL.createObjectURL(stream);
      video.onerror = function( /*e*/ ) {
        video.stream.stop();
        _this.videoData(null);
      };
      // video.onloadedmetadata = function( /*e*/ ) {
      //   notify.info('onloadedmetadata', null, 5);
      // };
      _this.videoData(video);
    }, function(e) {
      cb();
      if (e.name === "PermissionDeniedError") {
        notify.warn('User denied access to use camera.', null, 5);
      } else {
        notify.warn('No camera available.', null, 5);
      }
    });
  }

  function rotateSprite(sprite, radians) {
    //@REVIEW: make this rotate around the center of the screen
    // set rotation
    sprite.rotation += radians;
    //
    var upright = numbers.roundTo(sprite.rotation / Math.PI, 10) % 1 === 0;
    var hwidth = sprite.width / 2;
    var hheight = sprite.height / 2;
    // move the sprite position depending on it's orientation
    sprite.position.x = (upright) ? hwidth : hheight;
    sprite.position.y = (upright) ? hheight : hwidth;
  }

  function approximatelyEqual(a, b, tolerance) {
    return Math.abs(a - b) < tolerance;
  }
  approximatelyEqual(0.1 + 0.2, 0.3, 1e-12); // true

  function doZoom(item, x, y, factor) {
    // convert (x,y) to (x,y) on item
    x = (x - item.position.x) / item.scale.x;
    y = (y - item.position.y) / item.scale.y;

    var xScaleBefore = item.scale.x;
    var yScaleBefore = item.scale.y;
    // do scale
    item.scale.x *= factor;
    item.scale.y *= factor;

    // move to keep (x,y) on item in the same position on the screen
    item.position.x -= (x * (item.scale.x - xScaleBefore));
    item.position.y -= (y * (item.scale.y - yScaleBefore));
  }

  function fitToBounds(item, boxWidth, boxHeight, canZoomOut) {
    fitBoxSize(item, boxWidth, boxHeight, canZoomOut);
    fitPosition(item, boxWidth, boxHeight);
  }

  function fitBoxSize(item, boxWidth, boxHeight, canZoomOut) {
    //
    // must fit bounding box size
    //
    if (
      // one side is shorter than bounding box
      (item.width < boxWidth || item.height < boxHeight) ||
      // both sides are longer than bounding box and we're allowed to zoom out
      (item.width > boxWidth && item.height > boxHeight && canZoomOut)
    ) {
      var factor = scaleFactorToBounds(item.width, item.height, boxWidth, boxHeight);
      // zoom in/out to fit bounding box (w/out changing position)
      doZoom(item, item.position.x, item.position.y, factor);
    }
  }

  function fitPosition(item, boxWidth, boxHeight) {
    //
    // must be positioned within bounding box
    //
    // change x position
    if (item.x > 0) {
      item.x = 0;
    } else if (item.x + item.width < boxWidth) {
      item.x = boxWidth - item.width;
    }
    // change y position
    if (item.y > 0) {
      item.y = 0;
    } else if (item.y + item.height < boxHeight) {
      item.y = boxHeight - item.height;
    }
  }

  function scaleFactorToBounds(width, height, boxWidth, boxHeight) {
    var factor;
    if (width <= height) {
      // use item width
      factor = boxWidth / width;
    } else {
      // use item height
      factor = (boxHeight || boxWidth) / height; // height is optional. default to width(square)
    }
    return factor;
  }

  function addDragMove(item, boxWidth, boxHeight) {
    var prevX, prevY, isDragging = false;

    item.interactive = true;
    item.buttonMode = true;

    item.mousedown = function(moveData) {
      var pos = moveData.global;
      prevX = pos.x;
      prevY = pos.y;
      isDragging = true;

      this.data = moveData;
      this.alpha = 0.9;
    };

    item.mousemove = function(moveData) {
      if (!isDragging) {
        return;
      }
      var pos = moveData.global;
      var dx = pos.x - prevX;
      var dy = pos.y - prevY;

      this.position.x += dx;
      this.position.y += dy;

      prevX = pos.x;
      prevY = pos.y;

      fitPosition(item, boxWidth, boxHeight);
    };

    item.mouseup = parent.mouseupoutside = function( /*moveDate*/ ) {
      this.alpha = 1;
      isDragging = false;
    };
  }

  function createOverlay(width) {
    function drawEllipse(hRatio) {
      var h = (half / 2) * hRatio;
      g.drawEllipse(half, half * 0.85, h * 0.75, h);
    }

    var half = width / 2;
    var g = new PIXI.Graphics();
    g.position.x = half;
    g.position.y = half;
    //
    g.lineStyle(5, 0x000000, 0.5);
    g.drawRect(0, 0, width, width);
    //
    g.lineStyle(3, 0x43B22A, 0.7);
    drawEllipse(1.375);
    drawEllipse(1);
    // g.arcTo(); // left
    // g.arcTo(); // right
    //
    g.pivot.x = width / 2;
    g.pivot.y = width / 2;
    //
    return g;
  }

  /**
   * This module unifies handling of mouse whee event accross different browsers
   *
   * See https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel?redirectlocale=en-US&redirectslug=DOM%2FMozilla_event_reference%2Fwheel
   * for more details
   */
  var addWheelListener = (function() {
    var prefix = "",
      _addEventListener, support;

    // detect event model
    if (window.addEventListener) {
      _addEventListener = "addEventListener";
    } else {
      _addEventListener = "attachEvent";
      prefix = "on";
    }

    // detect available wheel event
    // 1. Modern browsers support "wheel"
    // 2. Webkit and IE support at least "mousewheel"
    // 3. let's assume that remaining browsers are older Firefox
    support = "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";

    function _addWheelListener(elem, eventName, callback, useCapture) {
      elem[_addEventListener](prefix + eventName, support === "wheel" ? callback : function(originalEvent) {
        if (!originalEvent) {
          originalEvent = window.event;
        }

        // create a normalized event object
        var event = {
          // keep a ref to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: "wheel",
          deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
          deltaX: 0,
          delatZ: 0,
          preventDefault: function() {
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          }
        };

        // calculate deltaY (and deltaX) according to the event
        if (support === "mousewheel") {
          event.deltaY = -1 / 40 * originalEvent.wheelDelta;
          // Webkit also support wheelDeltaX
          if (originalEvent.wheelDeltaX) {
            (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX);
          }
        } else {
          event.deltaY = originalEvent.detail;
        }

        // it's time to fire the callback
        return callback(event);

      }, useCapture || false);
    }

    return function addWheelListener(elem, callback, useCapture) {
      _addWheelListener(elem, support, callback, useCapture);

      // handle MozMousePixelScroll in older Firefox
      if (support === "DOMMouseScroll") {
        _addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
      }
    };
  })();

  // export for testing
  IdPhotoViewModel.scaleFactorToBounds = scaleFactorToBounds;

  return IdPhotoViewModel;
});
