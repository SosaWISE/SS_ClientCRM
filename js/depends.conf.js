window.require = {
  paths: {
    // app namespacing
    src: 'js/app',
    spec: 'js-specs',
    mock: 'js-mocks',

    // external libs
    jquery: 'js/lib/jquery-1.9.1',
    ko: 'js/lib/knockout',
    moment: 'js/lib/moment', // Used for Date object
    underscore: 'js/lib/underscore', // Allows for excellent data manipulation like linq in C#.
  },

  // defines global names(exports). does NOT load/require them
  global: {
    underscore: '_',
  }
};
