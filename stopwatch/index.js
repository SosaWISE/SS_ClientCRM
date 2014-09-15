(function() {
  'use strict';

  function setBtnState(btn, enabled) {
    if (enabled) {
      btn.removeAttribute('disabled');
    } else {
      btn.setAttribute('disabled', 'disabled');
    }
  }

  var btnStartPause = document.getElementById('btn-start-pause'),
    btnLap = document.getElementById('btn-lap'),
    btnClear = document.getElementById('btn-clear'),
    btnReset = document.getElementById('btn-reset'),
    valMin = document.getElementById('val-min'),
    valSec = document.getElementById('val-sec'),
    valMs = document.getElementById('val-ms'),
    divLaps = document.getElementById('laps'),
    startTime, elapsed = 0,
    min, sec, ms,
    running = false;

  btnStartPause.addEventListener('click', function() {
    // startTime = Date.now();
    if (!running) {
      running = true;
    } else {
      running = false;
      // add to total and reset startTime
      elapsed += (Date.now() - startTime);
      startTime = null;
    }
    updateBtns();
  });
  btnLap.addEventListener('click', function() {
    if (running) {
      // add to time list
      var li = document.createElement('li');
      li.innerHTML = padLeft(min, 2) + ':' + padLeft(sec, 2) + '.' + padLeft(ms, 3);
      divLaps.appendChild(li);
      //@TDOO:
      // clear running time
      elapsed = 0;
      startTime = Date.now();
      //
      updateBtns();
    }
  });
  btnClear.addEventListener('click', function() {
    if (!running) {
      elapsed = 0;
      updateBtns();
    }
  });
  btnReset.addEventListener('click', function() {
    elapsed = 0;
    divLaps.innerHTML = '';
    updateBtns();
  });

  function updateBtns() {
    setBtnState(btnLap, running);
    setBtnState(btnClear, !running);
    setBtnState(btnReset, !running && [1].length > 0);
    tick();
  }

  function tick( /*timestamp*/ ) {
    // console.log('requestAnimationFrame:\n' + timestamp);
    if (running && !startTime) {
      startTime = Date.now();
    }

    var deltams = 0;
    if (startTime) {
      // calculate change since last tick
      deltams = (Date.now() - startTime) + elapsed;
    } else if (elapsed) {
      deltams = elapsed;
    }

    min = Math.floor((deltams / (1000 * 60)) % 60);
    sec = Math.floor((deltams / 1000) % 60);
    ms = Math.floor(deltams % 1000);

    // calculate times
    valMin.innerHTML = min;
    valSec.innerHTML = sec;
    valMs.innerHTML = ms;

    if (running) {
      // window.requestAnimationFrame(tick);
      window.setTimeout(tick, 100);
    }
  }

  function padLeft(n, width) {
    var s = n + '';
    while (s.length < width) {
      s = '0' + s;
    }
    return s;
  }
})();
