define('src/core/ko.bindingHandlers.spinner', [
  'jquery',
  'ko'
], function(
  jquery,
  ko
) {
  'use strict';

  var map = {},
    showList = [],
    count = 0,
    timeoutId, timeoutMs = 100,
    rotateBy = 45 * Math.PI / 180,
    width = 60,
    hwidth = width / 2,
    startY = width / 3.7,
    lineWidth = 7,
    opacityList = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  ko.bindingHandlers.spinner = {
    init: function(element /*, valueAccessor, allBindings*/ ) {
      var id = ++count,
        wrap, spinner, canvas, colorRgb, color;

      // colorRgb = allBindings.get('spinner-rgb') || 'white';
      // switch (colorRgb) {
      //   case 'white':
      //     color = 'white';
      //     colorRgb = '255,255,255';
      //     break;
      //   case 'black':
      //     color = 'black';
      //     colorRgb = '0,0,0';
      //     break;
      //   default:
      //     color = 'black';
      //     // assume it's actually an rgb value
      //     // colorRgb = '0,0,0';
      //     break;
      // }
      color = 'white'; // not sure if i like the black spinner, so everything is white for now
      colorRgb = '255,255,255';

      //
      // setup
      //

      // remove all children
      ko.utils.emptyDomNode(element);

      // add wrap
      wrap = document.createElement('div');
      wrap.setAttribute('class', 'spinner-wrap ' + color);
      element.appendChild(wrap);
      // add spinner
      spinner = document.createElement('div');
      spinner.setAttribute('class', 'spinner');
      wrap.appendChild(spinner);
      // add canvas
      canvas = document.createElement('canvas');
      // setting the width and height in css doesn't have the same affect
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', width);
      spinner.appendChild(canvas);


      //
      // ???
      //

      ko.utils.domData.set(element, 'spinnerID', id);
      // add to map
      map[id] = {
        id: id,
        element: element,
        ctx: canvas.getContext('2d'),
        colorRgb: colorRgb,
        show: false,
      };
      // get notified when the element is disposed
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        removeItem(id);
      });

      // tell knockout to not do any child bindings
      return {
        'controlsDescendantBindings': true,
      };
    },
    update: function(element, valueAccessor) {
      var id = ko.utils.domData.get(element, 'spinnerID'),
        value = ko.unwrap(valueAccessor());
      updateShowList(id, value);
    },
  };


  function removeItem(id) {
    var item = map[id];
    if (!item) {
      return;
    }
    delete map[id];
    removeFromShowList(id);

    log();
  }

  function updateShowList(id, show) {
    var item = map[id];
    if (!item) {
      return;
    }

    item.show = show;
    removeFromShowList(id);
    if (show) {
      jquery(item.element).show();
      showList.push(item);
      animate();
    } else {
      jquery(item.element).hide();
    }

    log();
  }

  function removeFromShowList(id) {
    showList.some(function(item, index) {
      if (item.id === id) {
        showList.splice(index, 1);
        return true;
      }
    });
  }

  function log() {
    // console.log('total spinners:', Object.keys(map).length);
    // console.log('spinners spinning:', showList.length);
  }


  //
  // canvas funcs
  //

  function animate() {
    if (timeoutId) {
      return;
    }

    showList.forEach(function(item) {
      drawLines(item.ctx, item.colorRgb);
    });
    timeoutId = setTimeout(function() {
      timeoutId = 0;
      if (showList.length) {
        animate();
      }
    }, timeoutMs);
  }

  function drawLines(ctx, colorRgb) {
    ctx.clearRect(0, 0, width, width);
    opacityList.forEach(function(opacity) {
      rotate(ctx);
      drawLine(ctx, 'rgba(' + colorRgb + ',' + opacity + ')');
    });
    // move ahead one position
    rotate(ctx);
  }

  function drawLine(ctx, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
    ctx.moveTo(hwidth, startY);
    ctx.lineTo(hwidth, lineWidth);
    ctx.stroke();
    ctx.closePath();
  }

  function rotate(ctx) {
    ctx.translate(hwidth, hwidth);
    ctx.rotate(rotateBy);
    ctx.translate(-hwidth, -hwidth);
  }

});
