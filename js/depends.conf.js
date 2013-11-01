window.require = {
  paths: {
    // app namespacing
    webconfig: '/webconfig',
    src: '/js/app',
    spec: '/js-specs',
    mock: '/js-mocks',

    // external libs
    jquery: '/js/lib/jquery-1.9.1',
    ko: '/js/lib/knockout',
    moment: '/js/lib/moment', // Used for Date object
    underscore: '/js/lib/underscore', // Allows for excellent data manipulation like linq in C#.
    markdown: '/js/lib/markdown',
  },

  // defines global names(exports). does NOT load/require them
  global: {
    underscore: '_',
    markdown: 'markdown',
  }
};
