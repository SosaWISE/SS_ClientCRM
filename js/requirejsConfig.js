// this global require variable is used by require.js when the app loads
var require = {
  // by default load any module from this path
  baseUrl: 'js/app',

  // defines where each is located. does NOT load/require them
  paths: {
    webconfig: '../../webconfig',
    jquery: '../lib/jquery-1.9.1',
    ko: '../lib/knockout',
    moment: '../lib/moment', // Used for Date object
    underscore: '../lib/underscore', // Allows for excellent data manipulation like linq in C#.
  },

  // defines global names(exports) and file dependencies (deps). does NOT load/require them
  shim: {
    underscore: {
      exports: '_'
    },
  }
};
